import { Injectable } from '@nestjs/common';
import { EmailProviderFactory } from './factories/email-provider.factory';
import type {
  MailProviderType,
  SendEmailData,
} from './types/send-email-data.type';

@Injectable()
export class EmailService {
  constructor(private readonly emailProviderFactory: EmailProviderFactory) {}

  async sendEmail(
    data: SendEmailData,
    providerType?: MailProviderType,
  ): Promise<void> {
    const provider = this.emailProviderFactory.getProvider(providerType);
    await provider.sendEmail(data);
  }
}
