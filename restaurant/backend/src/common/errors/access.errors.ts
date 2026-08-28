import type { ApiErrorBody } from './api-error.type';

export const ACCESS_ERRORS = {
  DENIED: {
    code: 'ACCESS_DENIED',
    message: 'Access denied.',
  },
  TABLE_MENU_LINK_DENIED: {
    code: 'TABLE_MENU_LINK_DENIED',
    message: 'Cannot link this table and menu.',
  },
} as const satisfies Record<string, ApiErrorBody>;
