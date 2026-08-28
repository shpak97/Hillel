import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const MENU_ITEMS_ERRORS = {
  NOT_FOUND: {
    code: 'MENU_ITEM_NOT_FOUND',
    message: 'Menu item not found.',
  },
  CREATE_FAILED: {
    code: 'MENU_ITEM_CREATE_FAILED',
    message: 'Could not create menu item.',
  },
  UPDATE_FAILED: {
    code: 'MENU_ITEM_UPDATE_FAILED',
    message: 'Could not update menu item.',
  },
  PRODUCTS_UPDATE_FAILED: {
    code: 'MENU_ITEM_PRODUCTS_UPDATE_FAILED',
    message: 'Could not update menu item products.',
  },
  DELETE_FAILED: {
    code: 'MENU_ITEM_DELETE_FAILED',
    message: 'Could not delete menu item.',
  },
  DUPLICATE_PRODUCT: {
    code: 'DUPLICATE_MENU_ITEM_PRODUCT',
    message: 'A product cannot appear twice in a menu item.',
  },
  productNotFoundInRestaurant: (productId: string): ApiErrorBody => ({
    code: 'PRODUCT_NOT_FOUND_IN_RESTAURANT',
    message: `Product ${productId} was not found in this restaurant.`,
  }),
  productInactive: (productId: string): ApiErrorBody => ({
    code: 'PRODUCT_INACTIVE',
    message: `Product ${productId} is inactive.`,
  }),
} as const;
