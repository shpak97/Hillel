import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { EMAIL_ERRORS } from '../email.errors';
import type { EmailProvider } from '../interfaces/email-provider.interface';
import type { SendEmailData } from '../types/send-email-data.type';

@Injectable()
export class GmailEmailProvider implements EmailProvider {
  async sendEmail(data: SendEmailData): Promise<void> {
    const from = process.env.MAIL_FROM?.trim();
    if (!from) {
      throw new ServiceUnavailableException(
        EMAIL_ERRORS.NOT_CONFIGURED_MAIL_FROM,
      );
    }

    console.log('Send email via Gmail:', {
      to: data.to,
      from,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
    await Promise.resolve();
  }
}
