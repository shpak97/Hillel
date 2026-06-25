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
import { isUserAccountActive } from 'src/common/utils/entity-active.util';
import { isPrismaErrorCode } from 'src/common/utils/prisma-error.util';
import { ILoginResponse, IAccessTokenResponse } from 'src/types/interfaces';
import { RefreshAccessTokenRequestDto } from './dto/refresh-access-token-request.dto';
import { AUTH_ERRORS } from './auth.errors';
import { JWT_TOKEN_EXPIRATION } from './jwt.config';
import { AUTH_MESSAGES, buildEmailVerificationHtml, buildPasswordResetHtml } from './auth.messages';

const RESEND_COOLDOWN_MS = 60_000;

type ActionTokenType =
  | typeof TOKEN_TYPE.EMAIL
  | typeof TOKEN_TYPE.PASSWORD_RESET;

type ActionTokenPayload = {
  uid: number;
  type: ActionTokenType;
};

export type SendVerificationOptions = {
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
      if (!user || !isUserAccountActive(user)) {
        throw new UnauthorizedException(AUTH_ERRORS.ACCESS_DENIED);
      }

      const meta = (user.meta ?? {}) as PrismaJson.UserMeta;
      if (!meta.emailVerified) {
        throw new UnauthorizedException(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
      }

      const isValidPassword = await this.comparePassword(
        loginRequestDto.password,
        meta.password,
      );
      if (!isValidPassword) {
        throw new UnauthorizedException(AUTH_ERRORS.ACCESS_DENIED);
      }

      const accessToken = await this.generateToken(
        {
          uid: user.id,
          type: TOKEN_TYPE.ACCESS,
        },
        { expiresIn: JWT_TOKEN_EXPIRATION.ACCESS },
      );
      const refreshToken = await this.generateToken(
        {
          uid: user.id,
          type: TOKEN_TYPE.REFRESH,
        },
        { expiresIn: JWT_TOKEN_EXPIRATION.REFRESH },
      );

      await this.usersData.update(
        { id: user.id },
        {
          meta: {
            ...meta,
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
      throw new InternalServerErrorException(AUTH_ERRORS.LOGIN_FAILED);
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
        throw new ConflictException(AUTH_ERRORS.USER_ALREADY_EXISTS);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(AUTH_ERRORS.REGISTRATION_FAILED);
    }
  }

  async sendVerificationEmail(
    email: string,
    options?: SendVerificationOptions,
  ): Promise<void> {
    try {
      const user = await this.usersData.findUnique({ email });
      if (!user || !isUserAccountActive(user)) {
        return;
      }

      const meta = (user.meta ?? {}) as PrismaJson.UserMeta;
      if (meta.emailVerified) {
        return;
      }

      const lastSent = meta.verifyEmailLastSentAt;
      if (
        !options?.ignoreCooldown &&
        typeof lastSent === 'number' &&
        Date.now() - lastSent < RESEND_COOLDOWN_MS
      ) {
        throw new HttpException(
          AUTH_ERRORS.RESEND_COOLDOWN,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const token = await this.jwtService.signAsync(
        {
          uid: user.id,
          type: TOKEN_TYPE.EMAIL,
        },
        { expiresIn: JWT_TOKEN_EXPIRATION.EMAIL },
      );

      const baseUrl = process.env.VERIFY_EMAIL_URL ?? '';
      const verifyUrl = `${baseUrl.replace(/\/$/, '')}?token=${encodeURIComponent(token)}`;

      await this.emailService.sendEmail({
        to: email,
        subject: AUTH_MESSAGES.EMAIL_VERIFICATION_SUBJECT,
        html: buildEmailVerificationHtml(verifyUrl),
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
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        AUTH_ERRORS.VERIFICATION_EMAIL_FAILED,
      );
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const userId = await this.verifyActionToken(token, TOKEN_TYPE.EMAIL);
    const user = await this.usersData.findUnique({ id: userId });

    if (!user || !isUserAccountActive(user)) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN);
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
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const user = await this.usersData.findUnique({ email });
      if (!user || !isUserAccountActive(user)) {
        return;
      }

      const meta = (user.meta ?? {}) as PrismaJson.UserMeta;
      if (!meta.emailVerified) {
        return;
      }

      const lastSent = meta.passwordResetLastSentAt;
      if (
        typeof lastSent === 'number' &&
        Date.now() - lastSent < RESEND_COOLDOWN_MS
      ) {
        throw new HttpException(
          AUTH_ERRORS.RESEND_COOLDOWN,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const token = await this.jwtService.signAsync(
        {
          uid: user.id,
          type: TOKEN_TYPE.PASSWORD_RESET,
        },
        { expiresIn: JWT_TOKEN_EXPIRATION.PASSWORD_RESET },
      );

      const baseUrl = process.env.PASSWORD_RESET_URL ?? '';
      const resetUrl = `${baseUrl.replace(/\/$/, '')}?token=${encodeURIComponent(token)}`;

      await this.emailService.sendEmail({
        to: email,
        subject: AUTH_MESSAGES.PASSWORD_RESET_SUBJECT,
        html: buildPasswordResetHtml(resetUrl),
      });

      await this.usersData.update(
        { id: user.id },
        {
          meta: {
            ...meta,
            passwordResetLastSentAt: Date.now(),
          } as PrismaJson.UserMeta,
        },
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        AUTH_ERRORS.PASSWORD_RESET_EMAIL_FAILED,
      );
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const userId = await this.verifyActionToken(
      token,
      TOKEN_TYPE.PASSWORD_RESET,
    );
    const user = await this.usersData.findUnique({ id: userId });

    if (!user || !isUserAccountActive(user)) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN);
    }

    const meta = (user.meta ?? {}) as PrismaJson.UserMeta;
    await this.usersData.update(
      { id: user.id },
      {
        meta: {
          ...meta,
          password: await this.hashPassword(password),
          accessToken: '',
          refreshToken: '',
        } as PrismaJson.UserMeta,
      },
    );
  }

  async refreshAccessToken(
    refreshAccessTokenRequestDto: RefreshAccessTokenRequestDto,
  ): Promise<IAccessTokenResponse> {
    try {
      const { refreshToken } = refreshAccessTokenRequestDto;
      const { uid, type } = await this.verifyTokenPayload(refreshToken);
      if (type !== TOKEN_TYPE.REFRESH) {
        throw new BadRequestException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
      }

      const user = await this.usersData.findUnique({
        id: Number(uid),
      });
      if (!user || !isUserAccountActive(user)) {
        throw new NotFoundException(AUTH_ERRORS.USER_NOT_FOUND);
      }

      const accessToken = await this.generateToken(
        {
          uid: user.id,
          type: TOKEN_TYPE.ACCESS,
        },
        { expiresIn: JWT_TOKEN_EXPIRATION.ACCESS },
      );

      const meta = (user.meta ?? {}) as PrismaJson.UserMeta;
      await this.usersData.update(
        { id: user.id },
        {
          meta: {
            ...meta,
            accessToken,
          } as PrismaJson.UserMeta,
        },
      );
      return { accessToken };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(AUTH_ERRORS.REFRESH_TOKEN_FAILED);
    }
  }

  private async createUser(registerRequestDto: RegisterRequestDto) {
    const data: Prisma.UserCreateInput = {
      email: registerRequestDto.email,
      meta: {
        password: await this.hashPassword(registerRequestDto.password),
        accessToken: '',
        emailVerified: false,
      } as PrismaJson.UserMeta,
    };
    return await this.usersData.create(data);
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

  private async verifyActionToken(
    token: string,
    expectedType: ActionTokenType,
  ): Promise<number> {
    try {
      const payload =
        await this.jwtService.verifyAsync<ActionTokenPayload>(token);

      if (payload.type !== expectedType || typeof payload.uid !== 'number') {
        throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN);
      }

      return payload.uid;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException(this.getTokenVerificationError(error));
    }
  }

  private getTokenVerificationError(
    error: unknown,
  ): (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS] {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return AUTH_ERRORS.TOKEN_EXPIRED;
    }

    return AUTH_ERRORS.INVALID_TOKEN;
  }

  private async verifyToken(token: string): Promise<ITokenPayload> {
    return await this.jwtService.verifyAsync<ITokenPayload>(token);
  }

  private async verifyTokenPayload(token: string): Promise<ITokenPayload> {
    const { uid, type } = await this.verifyToken(token);
    if (!uid || !type) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN);
    }
    return { uid, type };
  }
}
