import type { SendEmailData } from '../types/send-email-data.type';

export interface EmailProvider {
  sendEmail(data: SendEmailData): Promise<void>;
}
