import type { ApiErrorBody } from './api-error.type';

export const HOURS_ERRORS = {
  duplicateWeekday: (dayOfWeek: number): ApiErrorBody => ({
    code: 'DUPLICATE_WEEKDAY',
    message: `Duplicate weekday: ${dayOfWeek}.`,
  }),
  duplicateOverrideDate: (date: string): ApiErrorBody => ({
    code: 'DUPLICATE_OVERRIDE_DATE',
    message: `Duplicate override date: ${date}.`,
  }),
  closedDateWithIntervals: (date: string): ApiErrorBody => ({
    code: 'CLOSED_DATE_WITH_INTERVALS',
    message: `Closed date ${date} cannot include time intervals.`,
  }),
  overrideRequiresIntervals: (date: string): ApiErrorBody => ({
    code: 'OVERRIDE_REQUIRES_INTERVALS',
    message: `Date ${date} requires at least one interval or isClosed.`,
  }),
  invalidTime: (label: string): ApiErrorBody => ({
    code: 'INVALID_TIME',
    message: `Invalid time for ${label}.`,
  }),
  opensAfterCloses: (label: string): ApiErrorBody => ({
    code: 'OPENS_AFTER_CLOSES',
    message: `Opening time must be earlier than closing time (${label}).`,
  }),
} as const;
