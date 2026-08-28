import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const QR_CODES_ERRORS = {
  NOT_FOUND: {
    code: 'QR_CODE_NOT_FOUND',
    message: 'QR code not found.',
  },
  CREATE_FAILED: {
    code: 'QR_CODE_CREATE_FAILED',
    message: 'Could not create QR code.',
  },
  UPDATE_FAILED: {
    code: 'QR_CODE_UPDATE_FAILED',
    message: 'Could not update QR code.',
  },
  DELETE_FAILED: {
    code: 'QR_CODE_DELETE_FAILED',
    message: 'Could not delete QR code.',
  },
  DUPLICATE_MENU: {
    code: 'QR_CODE_DUPLICATE_MENU',
    message: 'A menu cannot appear twice in the same QR code.',
  },
  menuNotFoundInRestaurant: (menuId: string): ApiErrorBody => ({
    code: 'MENU_NOT_FOUND_IN_RESTAURANT',
    message: `Menu ${menuId} was not found in this restaurant.`,
  }),
  menuInactive: (menuId: string): ApiErrorBody => ({
    code: 'MENU_INACTIVE',
    message: `Menu ${menuId} is inactive.`,
  }),
} as const;
