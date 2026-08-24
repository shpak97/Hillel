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
  ORDER_EMPTY: {
    code: 'GUEST_ORDER_EMPTY',
    message: 'Order must contain at least one item.',
  } satisfies ApiErrorBody,
  ORDER_ITEMS_INVALID: {
    code: 'GUEST_ORDER_ITEMS_INVALID',
    message: 'Some cart items are unavailable.',
  } satisfies ApiErrorBody,
  ORDER_CREATE_FAILED: {
    code: 'GUEST_ORDER_CREATE_FAILED',
    message: 'Could not create order.',
  } satisfies ApiErrorBody,
  ORDER_NOT_FOUND: {
    code: 'GUEST_ORDER_NOT_FOUND',
    message: 'Order not found.',
  } satisfies ApiErrorBody,
} as const;
