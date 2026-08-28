import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProviderFactory } from './factories/email-provider.factory';
import { GmailEmailProvider } from './providers/gmail-email.provider';
import { SendGridEmailProvider } from './providers/sendgrid-email.provider';

@Module({
  providers: [
    SendGridEmailProvider,
    GmailEmailProvider,
    EmailProviderFactory,
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
