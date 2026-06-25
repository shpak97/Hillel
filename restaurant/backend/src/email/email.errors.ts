import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const EMAIL_ERRORS = {
  NOT_CONFIGURED_MAIL_FROM: {
    code: 'EMAIL_NOT_CONFIGURED',
    message: 'Email delivery is not configured (MAIL_FROM).',
  },
  NOT_CONFIGURED_SENDGRID: {
    code: 'EMAIL_NOT_CONFIGURED',
    message: 'Email delivery is not configured (SEND_GRID_API_KEY / MAIL_FROM).',
  },
  SEND_FAILED: {
    code: 'EMAIL_SEND_FAILED',
    message: 'Could not send email via the mail provider.',
  },
  UNKNOWN_PROVIDER_ERROR: {
    code: 'EMAIL_PROVIDER_ERROR',
    message: 'Unknown mail provider error.',
  },
} as const satisfies Record<string, ApiErrorBody>;
