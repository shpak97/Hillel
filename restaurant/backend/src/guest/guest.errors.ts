import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const GUEST_ERRORS = {
  RESTAURANT_NOT_FOUND: {
    code: 'GUEST_RESTAURANT_NOT_FOUND',
    message: 'Restaurant not found.',
  } satisfies ApiErrorBody,
  QR_CODE_NOT_FOUND: {
    code: 'GUEST_QR_CODE_NOT_FOUND',
    message: 'QR code not found.',
  } satisfies ApiErrorBody,
  MENU_NOT_FOUND: {
    code: 'GUEST_MENU_NOT_FOUND',
    message: 'Menu not found.',
  } satisfies ApiErrorBody,
  TABLE_NOT_FOUND: {
    code: 'GUEST_TABLE_NOT_FOUND',
    message: 'Table not found.',
  } satisfies ApiErrorBody,
} as const;
