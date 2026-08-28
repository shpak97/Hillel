import type { ZonedNow } from './restaurant-hours.types';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const DAY_MAP: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

export function isValidTime(value: string): boolean {
  return TIME_REGEX.test(value);
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getZonedNow(timezone: string): ZonedNow {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA', { timeZone: timezone });
  const time = now.toLocaleTimeString('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const weekday = now.toLocaleDateString('en-US', {
    timeZone: timezone,
    weekday: 'short',
  });

  return {
    date,
    dayOfWeek: DAY_MAP[weekday] ?? 1,
    minutes: timeToMinutes(time),
  };
}

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export {
  CLOSED_INTERVAL_CLOSES,
  CLOSED_INTERVAL_OPENS,
  isClosedInterval,
} from '../../common/utils/hours-interval.util';
