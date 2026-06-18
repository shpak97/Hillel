import type { MenuHours } from '@prisma/client';

export type HoursRecord = MenuHours;

export type TimeInterval = {
  opensAt: string;
  closesAt: string;
};

export type WeeklyDayHours = {
  dayOfWeek: number;
  intervals: TimeInterval[];
};

export type HoursOverride = {
  date: string;
  isClosed: boolean;
  intervals: TimeInterval[];
};

export type ResolvedDayHours = {
  date: string;
  dayOfWeek: number;
  isClosed: boolean;
  intervals: TimeInterval[];
  source: 'weekly' | 'override';
  isOpenNow: boolean;
};

export type MenuHoursResponse = {
  timezone: string;
  weekly: WeeklyDayHours[];
  overrides: HoursOverride[];
  resolvedToday: ResolvedDayHours;
};

export type ZonedNow = {
  date: string;
  dayOfWeek: number;
  minutes: number;
};

export function isWeeklyHoursRecord(row: HoursRecord): row is HoursRecord & {
  dayOfWeek: number;
  date: null;
} {
  return row.date === null && row.dayOfWeek !== null;
}

export function isOverrideHoursRecord(row: HoursRecord): row is HoursRecord & {
  date: Date;
  dayOfWeek: null;
} {
  return row.date !== null;
}
