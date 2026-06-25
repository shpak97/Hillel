import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const INGREDIENTS_ERRORS = {
  NOT_FOUND: {
    code: 'INGREDIENT_NOT_FOUND',
    message: 'Ingredient not found.',
  },
  CREATE_FAILED: {
    code: 'INGREDIENT_CREATE_FAILED',
    message: 'Could not create ingredient.',
  },
  UPDATE_FAILED: {
    code: 'INGREDIENT_UPDATE_FAILED',
    message: 'Could not update ingredient.',
  },
  DELETE_FAILED: {
    code: 'INGREDIENT_DELETE_FAILED',
    message: 'Could not delete ingredient.',
  },
} as const satisfies Record<string, ApiErrorBody>;
