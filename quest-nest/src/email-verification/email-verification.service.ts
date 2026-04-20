import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import sgMail from '@sendgrid/mail';
import { UsersData } from 'src/users/users.data';
import { TOKEN_TYPE } from 'src/types/token';

const RESEND_COOLDOWN_MS = 60_000;

export type SendVerificationOptions = {
  /** Після реєстрації — одразу надіслати, не чекаючи cooldown */
  ignoreCooldown?: boolean;
};

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly usersData: UsersData,
    private readonly jwtService: JwtService,
  ) {
    const apiKey = process.env.SEND_GRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendVerificationEmail(
    email: string,
    options?: SendVerificationOptions,
  ): Promise<{ ok: true }> {
    this.ensureMailConfigured();

    const user = await this.usersData.findUnique({ email });
    if (!user) {
      return { ok: true };
    }

    const meta = (user.meta ?? {}) as PrismaJson.UserMeta;
    if (meta.emailVerified) {
      return { ok: true };
    }

    const lastSent = meta.verifyEmailLastSentAt;
    if (
      !options?.ignoreCooldown &&
      typeof lastSent === 'number' &&
      Date.now() - lastSent < RESEND_COOLDOWN_MS
    ) {
      throw new HttpException(
        'Зачекайте хвилину перед повторним надсиланням листа.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const token = await this.jwtService.signAsync(
      {
        uid: user.id,
        type: TOKEN_TYPE.EMAIL_TOKEN,
      },
      { expiresIn: '24h' },
    );

    const baseUrl =
      process.env.APP_PUBLIC_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`;
    const verifyUrl = `${baseUrl.replace(/\/$/, '')}/email-verification/verify?token=${encodeURIComponent(token)}`;

    try {
      await sgMail.send({
        to: email,
        from: process.env.MAIL_FROM as string,
        subject: 'Підтвердження електронної пошти',
        html: `<p>Підтвердіть пошту за посиланням:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
      });
    } catch (err: unknown) {
      const detail = this.sendGridErrorDetail(err);
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          error: 'Bad Gateway',
          message: 'Не вдалося надіслати лист через поштовий сервіс.',
          detail,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    await this.usersData.update(
      { id: user.id },
      {
        meta: {
          ...meta,
          verifyEmailLastSentAt: Date.now(),
        } as PrismaJson.UserMeta,
      },
    );

    return { ok: true };
  }

  async verifyEmail(token: string): Promise<{ ok: true }> {
    let payload: { uid?: unknown; type?: unknown };
    try {
      payload = await this.jwtService.verifyAsync<{
        uid: number;
        type: string;
      }>(token);
    } catch {
      throw new BadRequestException('Невірний або прострочений токен.');
    }

    if (
      payload.type !== TOKEN_TYPE.EMAIL_TOKEN ||
      typeof payload.uid !== 'number'
    ) {
      throw new BadRequestException('Невірний або прострочений токен.');
    }

    const user = await this.usersData.findUnique({ id: payload.uid });
    if (!user) {
      throw new BadRequestException('Невірний або прострочений токен.');
    }

    const meta = (user.meta ?? {}) as PrismaJson.UserMeta;
    await this.usersData.update(
      { id: user.id },
      {
        meta: {
          ...meta,
          emailVerified: true,
        } as PrismaJson.UserMeta,
      },
    );

    return { ok: true };
  }

  private ensureMailConfigured(): void {
    const apiKey = process.env.SEND_GRID_API_KEY;
    const from = process.env.MAIL_FROM;
    if (!apiKey?.trim() || !from?.trim()) {
      throw new ServiceUnavailableException(
        'Надсилання пошти не налаштоване (SENDGRID_API_KEY / MAIL_FROM).',
      );
    }
  }

  private sendGridErrorDetail(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const body = (
        err as {
          response?: { body?: { errors?: Array<{ message?: string }> } };
        }
      ).response?.body;
      const msg = body?.errors?.[0]?.message;
      if (msg) return msg;
    }
    if (err instanceof Error) return err.message;
    return 'Невідома помилка поштового провайдера.';
  }
}
