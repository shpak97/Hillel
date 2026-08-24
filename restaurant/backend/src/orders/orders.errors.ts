import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const ORDERS_ERRORS = {
  NOT_FOUND: {
    code: 'ORDER_NOT_FOUND',
    message: 'Order not found.',
  } satisfies ApiErrorBody,
  INVALID_STATUS: {
    code: 'ORDER_INVALID_STATUS',
    message: 'Invalid order status filter.',
  } satisfies ApiErrorBody,
} as const;
