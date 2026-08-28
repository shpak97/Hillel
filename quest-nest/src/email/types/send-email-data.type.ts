export type SendEmailData = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

export type MailProviderType = 'sendgrid' | 'gmail';
