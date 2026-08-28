import { BadRequestException, Injectable } from '@nestjs/common';
import type { EmailProvider } from '../interfaces/email-provider.interface';
import type { MailProviderType } from '../types/send-email-data.type';
import { GmailEmailProvider } from '../providers/gmail-email.provider';
import { SendGridEmailProvider } from '../providers/sendgrid-email.provider';

@Injectable()
export class EmailProviderFactory {
  constructor(
    private readonly sendGridEmailProvider: SendGridEmailProvider,
    private readonly gmailEmailProvider: GmailEmailProvider,
  ) {}

  getProvider(providerType?: MailProviderType): EmailProvider {
    const fromEnv = process.env.MAIL_PROVIDER?.trim();
    const selectedProvider =
      providerType ?? (fromEnv ? (fromEnv as MailProviderType) : 'sendgrid');

    switch (selectedProvider) {
      case 'sendgrid':
        return this.sendGridEmailProvider;
      case 'gmail':
        return this.gmailEmailProvider;
      default:
        throw new BadRequestException(
          `Unsupported mail provider: ${String(selectedProvider)}`,
        );
    }
  }
}
