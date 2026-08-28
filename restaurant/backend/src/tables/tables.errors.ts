import type { ApiErrorBody } from 'src/common/errors/api-error.type';

export const TABLES_ERRORS = {
  NOT_FOUND: {
    code: 'TABLE_NOT_FOUND',
    message: 'Table not found.',
  },
  ACCESS_DENIED: {
    code: 'TABLE_ACCESS_DENIED',
    message: 'Access to this table is denied.',
  },
  LABEL_ALREADY_EXISTS: {
    code: 'TABLE_LABEL_ALREADY_EXISTS',
    message: 'A table with this label already exists in this restaurant.',
  },
  CREATE_FAILED: {
    code: 'TABLE_CREATE_FAILED',
    message: 'Could not create table.',
  },
  UPDATE_FAILED: {
    code: 'TABLE_UPDATE_FAILED',
    message: 'Could not update table.',
  },
  DELETE_FAILED: {
    code: 'TABLE_DELETE_FAILED',
    message: 'Could not delete table.',
  },
} as const satisfies Record<string, ApiErrorBody>;
