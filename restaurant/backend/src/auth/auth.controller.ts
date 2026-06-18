import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  EmailVerificationEmailDto,
  VerifyEmailQueryDto,
} from './dto/email-verification.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { RefreshAccessTokenRequestDto } from './dto/refresh-access-token-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerRequestDto: RegisterRequestDto) {
    await this.authService.register(registerRequestDto);
  }

  @Post('login')
  async login(@Body() loginRequestDto: LoginRequestDto) {
    return await this.authService.login(loginRequestDto);
  }

  @Post('refresh-access-token')
  async refreshAccessToken(
    @Body() refreshAccessTokenRequestDto: RefreshAccessTokenRequestDto,
  ) {
    return await this.authService.refreshAccessToken(
      refreshAccessTokenRequestDto,
    );
  }

  @Post('email-verification/send')
  async sendVerificationEmail(@Body() dto: EmailVerificationEmailDto) {
    await this.authService.sendVerificationEmail(dto.email);
    return {
      message:
        'Якщо обліковий запис існує та пошту ще не підтверджено, лист буде надіслано.',
    };
  }

  @Get('email-verification/verify')
  async verifyEmail(@Query() query: VerifyEmailQueryDto) {
    await this.authService.verifyEmail(query.token);
    return { ok: true };
  }
}
