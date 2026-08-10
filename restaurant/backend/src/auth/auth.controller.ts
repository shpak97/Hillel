import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AUTH_MESSAGES } from './auth.messages';
import { AuthService } from './auth.service';
import {
  AccessTokenResponseDto,
  LoginResponseDto,
  MessageResponseDto,
} from './dto/auth-response.dto';
import {
  EmailVerificationEmailDto,
  VerifyEmailQueryDto,
} from './dto/email-verification.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { RefreshAccessTokenRequestDto } from './dto/refresh-access-token-request.dto';
import { PasswordResetEmailDto } from './dto/password-reset-email.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { validateResponseDto } from 'src/common/utils/validate-response.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(
    @Body() registerRequestDto: RegisterRequestDto,
  ): Promise<void> {
    await this.authService.register(registerRequestDto);
  }

  @Post('login')
  async login(@Body() loginRequestDto: LoginRequestDto) {
    const result = await this.authService.login(loginRequestDto);
    return validateResponseDto(LoginResponseDto, result);
  }

  @Post('refresh-access-token')
  async refreshAccessToken(
    @Body() refreshAccessTokenRequestDto: RefreshAccessTokenRequestDto,
  ) {
    const result = await this.authService.refreshAccessToken(
      refreshAccessTokenRequestDto,
    );
    return validateResponseDto(AccessTokenResponseDto, result);
  }

  @Post('email-verification/send')
  async sendVerificationEmail(@Body() dto: EmailVerificationEmailDto) {
    await this.authService.sendVerificationEmail(dto.email);
    return validateResponseDto(MessageResponseDto, {
      message: AUTH_MESSAGES.EMAIL_VERIFICATION_SENT,
    });
  }

  @Get('email-verification/verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(@Query() query: VerifyEmailQueryDto): Promise<void> {
    await this.authService.verifyEmail(query.token);
  }

  @Post('password-reset/send')
  async sendPasswordResetEmail(@Body() dto: PasswordResetEmailDto) {
    await this.authService.sendPasswordResetEmail(dto.email);
    return validateResponseDto(MessageResponseDto, {
      message: AUTH_MESSAGES.PASSWORD_RESET_SENT,
    });
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body() dto: PasswordResetDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.password);
  }
}
