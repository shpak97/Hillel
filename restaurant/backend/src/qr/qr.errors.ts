import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const QR_ERRORS = {
  GENERATION_FAILED: {
    code: 'QR_GENERATION_FAILED',
    message: 'Could not generate QR code.',
  },
  INVALID_FORMAT: {
    code: 'QR_INVALID_FORMAT',
    message: 'QR format must be png, svg, or json.',
  },
} as const satisfies Record<string, ApiErrorBody>;
