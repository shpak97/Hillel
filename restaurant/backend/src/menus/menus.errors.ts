import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const MENUS_ERRORS = {
  NOT_FOUND: {
    code: 'MENU_NOT_FOUND',
    message: 'Menu not found.',
  },
  ACCESS_DENIED: {
    code: 'MENU_ACCESS_DENIED',
    message: 'Access to this menu is denied.',
  },
  CREATE_FAILED: {
    code: 'MENU_CREATE_FAILED',
    message: 'Could not create menu.',
  },
  UPDATE_FAILED: {
    code: 'MENU_UPDATE_FAILED',
    message: 'Could not update menu.',
  },
  DELETE_FAILED: {
    code: 'MENU_DELETE_FAILED',
    message: 'Could not delete menu.',
  },
} as const satisfies Record<string, ApiErrorBody>;
