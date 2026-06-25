import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { EMAIL_ERRORS } from '../email.errors';
import type { EmailProvider } from '../interfaces/email-provider.interface';
import type { SendEmailData } from '../types/send-email-data.type';

function sendGridApiKey(): string | undefined {
  return (
    process.env.SEND_GRID_API_KEY?.trim() ||
    process.env.SENDGRID_API_KEY?.trim()
  );
}

@Injectable()
export class SendGridEmailProvider implements EmailProvider {
  constructor() {
    const apiKey = sendGridApiKey();
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(data: SendEmailData): Promise<void> {
    const apiKey = sendGridApiKey();
    const from = process.env.MAIL_FROM?.trim();
    if (!apiKey || !from) {
      throw new ServiceUnavailableException(
        EMAIL_ERRORS.NOT_CONFIGURED_SENDGRID,
      );
    }

    try {
      const mail: sgMail.MailDataRequired = {
        to: data.to,
        from,
        subject: data.subject,
        ...(data.html !== undefined
          ? { html: data.html }
          : { text: data.text ?? '' }),
      };
      await sgMail.send(mail);
    } catch (err: unknown) {
      const detail = this.sendGridErrorDetail(err);
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          error: 'Bad Gateway',
          message: EMAIL_ERRORS.SEND_FAILED.message,
          detail,
        },
        HttpStatus.BAD_GATEWAY,
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
    return EMAIL_ERRORS.UNKNOWN_PROVIDER_ERROR.message;
  }
}
