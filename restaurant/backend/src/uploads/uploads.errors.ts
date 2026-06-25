import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const UPLOADS_ERRORS = {
  INVALID_IMAGE_TYPE: {
    code: 'INVALID_IMAGE_TYPE',
    message: 'Only images are allowed (JPEG, PNG, WebP, GIF).',
  },
} as const satisfies Record<string, ApiErrorBody>;
