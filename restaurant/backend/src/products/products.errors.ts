import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const PRODUCTS_ERRORS = {
  NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Product not found.',
  },
  CREATE_FAILED: {
    code: 'PRODUCT_CREATE_FAILED',
    message: 'Could not create product.',
  },
  UPDATE_FAILED: {
    code: 'PRODUCT_UPDATE_FAILED',
    message: 'Could not update product.',
  },
  RECIPE_UPDATE_FAILED: {
    code: 'PRODUCT_RECIPE_UPDATE_FAILED',
    message: 'Could not update recipe.',
  },
  DELETE_FAILED: {
    code: 'PRODUCT_DELETE_FAILED',
    message: 'Could not delete product.',
  },
  DUPLICATE_RECIPE_INGREDIENT: {
    code: 'DUPLICATE_RECIPE_INGREDIENT',
    message: 'An ingredient cannot appear twice in the recipe.',
  },
  ingredientNotFoundInRestaurant: (ingredientId: string): ApiErrorBody => ({
    code: 'INGREDIENT_NOT_FOUND_IN_RESTAURANT',
    message: `Ingredient ${ingredientId} was not found in this restaurant.`,
  }),
  ingredientUnitMismatch: (
    ingredientName: string,
    expectedUnit: string,
  ): ApiErrorBody => ({
    code: 'INGREDIENT_UNIT_MISMATCH',
    message: `Unit for ${ingredientName} must be ${expectedUnit}.`,
  }),
  ingredientInactive: (ingredientId: string): ApiErrorBody => ({
    code: 'INGREDIENT_INACTIVE',
    message: `Ingredient ${ingredientId} is inactive.`,
  }),
} as const;
