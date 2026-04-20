import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import {
  EmailVerificationEmailDto,
  VerifyEmailQueryDto,
} from './dto/email-verification.dto';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  /** Запитати лист із посиланням для підтвердження пошти */
  @Post('request')
  async request(@Body() dto: EmailVerificationEmailDto) {
    await this.emailVerificationService.sendVerificationEmail(dto.email);
    return {
      message:
        'Якщо обліковий запис існує та пошту ще не підтверджено, лист буде надіслано.',
    };
  }

  /** Повторно надіслати лист */
  @Post('resend')
  async resend(@Body() dto: EmailVerificationEmailDto) {
    await this.emailVerificationService.sendVerificationEmail(dto.email);
    return {
      message:
        'Якщо обліковий запис існує та пошту ще не підтверджено, лист буде надіслано.',
    };
  }

  /** Підтвердження за токеном із листа */
  @Get('verify')
  async verify(@Query() query: VerifyEmailQueryDto) {
    await this.emailVerificationService.verifyEmail(query.token);
    return { ok: true };
  }
}
