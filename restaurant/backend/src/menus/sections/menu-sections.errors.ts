import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const MENU_SECTIONS_ERRORS = {
  NOT_FOUND: {
    code: 'MENU_SECTION_NOT_FOUND',
    message: 'Menu section not found.',
  },
  CREATE_FAILED: {
    code: 'MENU_SECTION_CREATE_FAILED',
    message: 'Could not create menu section.',
  },
  UPDATE_FAILED: {
    code: 'MENU_SECTION_UPDATE_FAILED',
    message: 'Could not update menu section.',
  },
  DELETE_FAILED: {
    code: 'MENU_SECTION_DELETE_FAILED',
    message: 'Could not delete menu section.',
  },
  DUPLICATE_ITEM: {
    code: 'DUPLICATE_SECTION_ITEM',
    message: 'A menu item cannot appear twice in a section.',
  },
  itemNotFoundInRestaurant: (itemId: string): ApiErrorBody => ({
    code: 'MENU_ITEM_NOT_FOUND_IN_RESTAURANT',
    message: `Menu item ${itemId} was not found in this restaurant.`,
  }),
  ITEMS_UPDATE_FAILED: {
    code: 'MENU_SECTION_ITEMS_UPDATE_FAILED',
    message: 'Could not update section items.',
  },
} as const;
