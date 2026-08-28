import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { Prisma } from '@prisma/client';
import { UsersData } from 'src/users/users.data';
import bcrypt from 'bcrypt';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ITokenPayload, TOKEN_TYPE } from 'src/types/token';
import { EmailService } from 'src/email/email.service';
import { isPrismaErrorCode } from 'src/common/utils/prisma-error.util';
import { ILoginResponse, IAccessTokenResponse } from 'src/types/interfaces';
import { RefreshAccessTokenRequestDto } from './dto/refresh-access-token-request.dto';
import { IPasswordResetEmailRequestDto } from './dto/password-reset-email.dto';
import { IPasswordResetRequestDto } from './dto/password-reset.dto';
const RESEND_COOLDOWN_MS = 60_000;

export type SendVerificationOptions = {
  /** Після реєстрації — одразу надіслати, не чекаючи cooldown */
  ignoreCooldown?: boolean;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersData: UsersData,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async login(loginRequestDto: LoginRequestDto): Promise<ILoginResponse> {
    try {
      const user = await this.usersData.findUnique({
        email: loginRequestDto.email,
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const { password: passwordHash } = user.meta as PrismaJson.UserMeta;

      const isValidPassword = await this.comparePassword(
        loginRequestDto.password,
        passwordHash,
      );
      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const accessToken = await this.generateToken({
        uid: user.id,
        type: TOKEN_TYPE.ACCESS,
      });
      if (!accessToken) {
        throw new UnauthorizedException('Failed to generate access token');
      }
      const refreshToken = await this.generateToken({
        uid: user.id,
        type: TOKEN_TYPE.REFRESH,
        exp: '7d', // 7 days
      });
      if (!refreshToken) {
        throw new UnauthorizedException('Failed to generate refresh token');
      }
      await this.usersData.update(
        { id: user.id },
        {
          meta: {
            ...user.meta,
            accessToken,
            refreshToken,
          } as PrismaJson.UserMeta,
        },
      );
      return { accessToken, refreshToken };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Unable to complete login');
    }
  }

  async register(registerRequestDto: RegisterRequestDto): Promise<void> {
    try {
      await this.createUser(registerRequestDto);
      await this.sendVerificationEmail(registerRequestDto.email, {
        ignoreCooldown: true,
      });
    } catch (error: unknown) {
      if (isPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException(
          'Користувач із такою поштою вже зареєстрований.',
        );
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Unable to complete registration');
    }
  }

  async sendVerificationEmail(
    email: string,
    options?: SendVerificationOptions,
  ): Promise<{ ok: true }> {
    try {
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
          type: TOKEN_TYPE.EMAIL,
        },
        { expiresIn: '24h' },
      );

      const baseUrl = process.env.VERIFY_EMAIL_URL ?? '';
      const verifyUrl = `${baseUrl.replace(/\/$/, '')}?token=${encodeURIComponent(token)}`;

      await this.emailService.sendEmail({
        to: email,
        subject: 'Підтвердження електронної пошти',
        html: `<p>Підтвердіть пошту за посиланням:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
      });

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
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to send verification email',
      );
    }
  }

  async verifyEmail(token: string): Promise<{ ok: true }> {
    try {
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
        payload.type !== TOKEN_TYPE.EMAIL ||
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
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Unable to verify email');
    }
  }

  async refreshAccessToken(
    refreshAccessTokenRequestDto: RefreshAccessTokenRequestDto,
  ): Promise<IAccessTokenResponse> {
    try {
      const { refreshToken } = refreshAccessTokenRequestDto;
      const { uid, type } = await this.verifyTokenPayload(refreshToken);
      if (type !== TOKEN_TYPE.REFRESH) {
        throw new BadRequestException('Invalid refresh token');
      }
      const user = await this.usersData.findUnique({
        id: Number(uid),
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const accessToken = await this.generateToken({
        uid: user.id,
        type: TOKEN_TYPE.ACCESS,
      });
      if (!accessToken) {
        throw new UnauthorizedException('Failed to generate access token');
      }
      await this.usersData.update(
        { id: user.id },
        {
          meta: {
            ...user.meta,
            accessToken,
          } as PrismaJson.UserMeta,
        },
      );
      return { accessToken };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Unable to refresh access token');
    }
  }
  private async createUser(registerRequestDto: RegisterRequestDto) {
    const data: Prisma.UserCreateInput = {
      email: registerRequestDto.email,
      phone: registerRequestDto.phone,
      fullname: registerRequestDto.fullname,
      meta: {
        password: await this.hashPassword(registerRequestDto.password),
        accessToken: '',
        emailVerified: false,
      } as PrismaJson.UserMeta,
    };
    return await this.usersData.create(data);
  }
  async passwordResetEmail(
    IPasswordResetEmailRequestDto: IPasswordResetEmailRequestDto,
  ): Promise<void> {
    try {
      const { email } = IPasswordResetEmailRequestDto;
      const user = await this.usersData.findUnique({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const token = await this.generateToken({
        uid: user.id,
        type: TOKEN_TYPE.PASSWORD_RESET,
      });
      if (!token) {
        throw new UnauthorizedException(
          'Failed to generate password reset token',
        );
      }
      const baseUrl = process.env.PASSWORD_RESET_URL ?? '';
      const passwordResetUrl = `${baseUrl.replace(/\/$/, '')}?token=${encodeURIComponent(token)}`;
      await this.emailService.sendEmail({
        to: email,
        subject: 'Підтвердження електронної пошти',
        html: `<p>Підтвердіть пошту за посиланням:</p><p><a href="${passwordResetUrl}">${passwordResetUrl}</a></p>`,
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to send password reset email',
      );
    }
  }
  async passwordReset(
    IPasswordResetRequestDto: IPasswordResetRequestDto,
  ): Promise<void> {
    try {
      const { password, token } = IPasswordResetRequestDto;
      const { uid, type } = await this.verifyTokenPayload(token);
      if (type !== TOKEN_TYPE.PASSWORD_RESET) {
        throw new BadRequestException('Invalid password reset token');
      }
      const user = await this.usersData.findUnique({ id: Number(uid) });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.usersData.update(
        { id: user.id },
        {
          meta: {
            ...user.meta,
            password: await this.hashPassword(password),
          } as PrismaJson.UserMeta,
        },
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Unable to reset password');
    }
  }
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async comparePassword(
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, passwordHash);
  }
  private async generateToken<T extends object>(
    tokenData: T,
    options?: JwtSignOptions,
  ): Promise<string> {
    return await this.jwtService.signAsync(tokenData, options);
  }
  private async verifyToken(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }
  private async verifyTokenPayload(token: string): Promise<ITokenPayload> {
    const { uid, type } = (await this.verifyToken(token)) as ITokenPayload;
    if (!uid || !type) {
      throw new BadRequestException('Invalid token');
    }
    return { uid, type };
  }
}
