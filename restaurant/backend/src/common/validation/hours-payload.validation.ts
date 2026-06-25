import { BadRequestException } from '@nestjs/common';
import { HOURS_ERRORS } from 'src/common/errors/hours.errors';
import {
  isClosedInterval,
  isValidTime,
  timeToMinutes,
} from 'src/restaurants/hours/time.util';

type TimeIntervalInput = {
  opensAt: string;
  closesAt: string;
};

type WeeklyDayInput = {
  dayOfWeek: number;
  intervals: TimeIntervalInput[];
};

type HoursOverrideInput = {
  date: string;
  isClosed: boolean;
  intervals: TimeIntervalInput[];
};

type HoursPayloadInput = {
  weekly: WeeklyDayInput[];
  overrides: HoursOverrideInput[];
};

function validateIntervals(
  intervals: TimeIntervalInput[],
  label: string,
): void {
  for (const interval of intervals) {
    if (!isValidTime(interval.opensAt) || !isValidTime(interval.closesAt)) {
      throw new BadRequestException(HOURS_ERRORS.invalidTime(label));
    }

    if (timeToMinutes(interval.opensAt) >= timeToMinutes(interval.closesAt)) {
      if (!isClosedInterval(interval.opensAt, interval.closesAt)) {
        throw new BadRequestException(HOURS_ERRORS.opensAfterCloses(label));
      }
    }
  }
}

export function validateHoursPayload(dto: HoursPayloadInput): void {
  const weeklyDays = new Set<number>();

  for (const day of dto.weekly) {
    if (weeklyDays.has(day.dayOfWeek)) {
      throw new BadRequestException(
        HOURS_ERRORS.duplicateWeekday(day.dayOfWeek),
      );
    }
    weeklyDays.add(day.dayOfWeek);
    validateIntervals(day.intervals, `weekday ${day.dayOfWeek}`);
  }

  const overrideDates = new Set<string>();

  for (const override of dto.overrides) {
    if (overrideDates.has(override.date)) {
      throw new BadRequestException(
        HOURS_ERRORS.duplicateOverrideDate(override.date),
      );
    }
    overrideDates.add(override.date);

    if (override.isClosed) {
      if (override.intervals.length > 0) {
        throw new BadRequestException(
          HOURS_ERRORS.closedDateWithIntervals(override.date),
        );
      }
      continue;
    }

    if (override.intervals.length === 0) {
      throw new BadRequestException(
        HOURS_ERRORS.overrideRequiresIntervals(override.date),
      );
    }

    validateIntervals(override.intervals, `date ${override.date}`);
  }
}
