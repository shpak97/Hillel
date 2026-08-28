import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const MONOBANK_ERRORS = {
  NOT_CONFIGURED: {
    code: 'MONOBANK_NOT_CONFIGURED',
    message: 'Monobank payment is not configured.',
  } satisfies ApiErrorBody,
  UNSUPPORTED_CURRENCY: {
    code: 'MONOBANK_UNSUPPORTED_CURRENCY',
    message: 'Currency is not supported by Monobank.',
  } satisfies ApiErrorBody,
  INVALID_AMOUNT: {
    code: 'MONOBANK_INVALID_AMOUNT',
    message: 'Payment amount must be greater than zero.',
  } satisfies ApiErrorBody,
  REQUEST_FAILED: {
    code: 'MONOBANK_REQUEST_FAILED',
    message: 'Could not reach Monobank.',
  } satisfies ApiErrorBody,
  CREATE_FAILED: {
    code: 'MONOBANK_CREATE_FAILED',
    message: 'Could not create Monobank invoice.',
  } satisfies ApiErrorBody,
  STATUS_FAILED: {
    code: 'MONOBANK_STATUS_FAILED',
    message: 'Could not fetch Monobank invoice status.',
  } satisfies ApiErrorBody,
  PUBKEY_FAILED: {
    code: 'MONOBANK_PUBKEY_FAILED',
    message: 'Could not fetch Monobank public key.',
  } satisfies ApiErrorBody,
  INVALID_SIGNATURE: {
    code: 'MONOBANK_INVALID_SIGNATURE',
    message: 'Invalid Monobank webhook signature.',
  } satisfies ApiErrorBody,
} as const;
