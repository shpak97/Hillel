import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const RESTAURANTS_ERRORS = {
  NOT_FOUND: {
    code: 'RESTAURANT_NOT_FOUND',
    message: 'Restaurant not found.',
  },
  ACCESS_DENIED: {
    code: 'RESTAURANT_ACCESS_DENIED',
    message: 'Access to this restaurant is denied.',
  },
  SLUG_ALREADY_EXISTS: {
    code: 'RESTAURANT_SLUG_ALREADY_EXISTS',
    message: 'A restaurant with this slug already exists.',
  },
  CREATE_FAILED: {
    code: 'RESTAURANT_CREATE_FAILED',
    message: 'Could not create restaurant.',
  },
  UPDATE_FAILED: {
    code: 'RESTAURANT_UPDATE_FAILED',
    message: 'Could not update restaurant.',
  },
  DEACTIVATE_FAILED: {
    code: 'RESTAURANT_DEACTIVATE_FAILED',
    message: 'Could not deactivate restaurant.',
  },
  ACTIVATE_FAILED: {
    code: 'RESTAURANT_ACTIVATE_FAILED',
    message: 'Could not activate restaurant.',
  },
  DELETE_FAILED: {
    code: 'RESTAURANT_DELETE_FAILED',
    message: 'Could not delete restaurant.',
  },
} as const satisfies Record<string, ApiErrorBody>;
