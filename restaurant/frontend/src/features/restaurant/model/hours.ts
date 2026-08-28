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

export type RestaurantHours = {
  timezone: string;
  weekly: WeeklyDayHours[];
  overrides: HoursOverride[];
  resolvedToday: ResolvedDayHours;
};

export type UpdateRestaurantHoursPayload = {
  weekly: WeeklyDayHours[];
  overrides: HoursOverride[];
};

export const DAY_LABELS: readonly string[] = [
  'Понеділок',
  'Вівторок',
  'Середа',
  'Четвер',
  'Пʼятниця',
  'Субота',
  'Неділя',
];

export { DEFAULT_TIMEZONE } from '@/shared/lib/timezone';

export function buildEmptyWeekly(): WeeklyDayHours[] {
  return Array.from({ length: 7 }, (_, index) => ({
    dayOfWeek: index + 1,
    intervals: [],
  }));
}

export function normalizeWeekly(weekly: WeeklyDayHours[]): WeeklyDayHours[] {
  const byDay = new Map<number, TimeInterval[]>(
    weekly.map((day) => [day.dayOfWeek, day.intervals]),
  );

  return buildEmptyWeekly().map((day) => ({
    dayOfWeek: day.dayOfWeek,
    intervals: byDay.get(day.dayOfWeek) ?? [],
  }));
}

export function isRestaurantHours(value: unknown): value is RestaurantHours {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.timezone === 'string' &&
    Array.isArray(record.weekly) &&
    Array.isArray(record.overrides) &&
    typeof record.resolvedToday === 'object' &&
    record.resolvedToday !== null
  );
}
