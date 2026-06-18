import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ACL_PERMISSION_READ, ACL_PERMISSION_WRITE } from 'src/acl/acl.constants';
import { RestaurantsService } from '../restaurants.service';
import type {
  HoursOverrideDto,
  TimeIntervalDto,
  UpdateRestaurantHoursDto,
} from './dto/update-restaurant-hours.dto';
import { RestaurantHoursData } from './restaurant-hours.data';
import type {
  HoursOverride,
  HoursRecord,
  ResolvedDayHours,
  RestaurantHoursResponse,
  TimeInterval,
  WeeklyDayHours,
  ZonedNow,
} from './restaurant-hours.types';
import {
  isOverrideHoursRecord,
  isWeeklyHoursRecord,
} from './restaurant-hours.types';
import {
  formatDateOnly,
  getZonedNow,
  isClosedInterval,
  isValidTime,
  timeToMinutes,
} from './time.util';

export type {
  HoursOverride,
  ResolvedDayHours,
  RestaurantHoursResponse,
  TimeInterval,
  WeeklyDayHours,
} from './restaurant-hours.types';

@Injectable()
export class RestaurantHoursService {
  constructor(
    private readonly restaurantHoursData: RestaurantHoursData,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async getHours(
    userId: number,
    restaurantId: string,
  ): Promise<RestaurantHoursResponse> {
    await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
    );

    return this.buildResponse(restaurantId);
  }

  async updateHours(
    userId: number,
    restaurantId: string,
    dto: UpdateRestaurantHoursDto,
  ): Promise<RestaurantHoursResponse> {
    await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_WRITE,
    );

    this.validateHoursPayload(dto);

    await this.restaurantHoursData.replaceAll(
      restaurantId,
      dto.weekly,
      dto.overrides,
    );

    return this.buildResponse(restaurantId);
  }

  private async buildResponse(
    restaurantId: string,
  ): Promise<RestaurantHoursResponse> {
    const [rows, restaurant] = await Promise.all([
      this.restaurantHoursData.findByRestaurant(restaurantId),
      this.restaurantHoursData.getTimezone(restaurantId),
    ]);

    const timezone = restaurant?.timezone ?? 'Europe/Kyiv';
    const weekly = this.groupWeeklyRows(
      rows.filter((row) => isWeeklyHoursRecord(row)),
    );
    const overrides = this.groupOverrideRows(
      rows.filter((row) => isOverrideHoursRecord(row)),
    );
    const resolvedToday = this.resolveForDate(
      timezone,
      weekly,
      overrides,
      getZonedNow(timezone),
    );

    return {
      timezone,
      weekly,
      overrides,
      resolvedToday,
    };
  }

  private groupWeeklyRows(rows: HoursRecord[]): WeeklyDayHours[] {
    const byDay = new Map<number, TimeInterval[]>();

    for (const row of rows) {
      if (isClosedInterval(row.opensAt, row.closesAt)) {
        continue;
      }

      const current = byDay.get(row.dayOfWeek!) ?? [];
      current.push({ opensAt: row.opensAt, closesAt: row.closesAt });
      byDay.set(row.dayOfWeek!, current);
    }

    return Array.from(byDay.entries())
      .sort(([a], [b]) => a - b)
      .map(([dayOfWeek, intervals]) => ({ dayOfWeek, intervals }));
  }

  private groupOverrideRows(rows: HoursRecord[]): HoursOverride[] {
    const byDate = new Map<string, { isClosed: boolean; intervals: TimeInterval[] }>();

    for (const row of rows) {
      const date = formatDateOnly(row.date!);

      if (isClosedInterval(row.opensAt, row.closesAt)) {
        byDate.set(date, { isClosed: true, intervals: [] });
        continue;
      }

      const current = byDate.get(date) ?? { isClosed: false, intervals: [] };
      current.intervals.push({ opensAt: row.opensAt, closesAt: row.closesAt });
      byDate.set(date, current);
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date,
        isClosed: value.isClosed,
        intervals: value.intervals,
      }));
  }

  resolveForDate(
    _timezone: string,
    weekly: WeeklyDayHours[],
    overrides: HoursOverride[],
    target: ZonedNow,
  ): ResolvedDayHours {

    const override = overrides.find((item) => item.date === target.date);

    if (override) {
      return {
        date: target.date,
        dayOfWeek: target.dayOfWeek,
        isClosed: override.isClosed,
        intervals: override.intervals,
        source: 'override',
        isOpenNow: this.isOpenNow(
          target.minutes,
          override.isClosed,
          override.intervals,
        ),
      };
    }

    const weeklyDay = weekly.find((item) => item.dayOfWeek === target.dayOfWeek);
    const intervals = weeklyDay?.intervals ?? [];
    const isClosed = intervals.length === 0;

    return {
      date: target.date,
      dayOfWeek: target.dayOfWeek,
      isClosed,
      intervals,
      source: 'weekly',
      isOpenNow: this.isOpenNow(target.minutes, isClosed, intervals),
    };
  }

  private isOpenNow(
    minutes: number,
    isClosed: boolean,
    intervals: TimeInterval[],
  ): boolean {
    if (isClosed) {
      return false;
    }

    return intervals.some((interval) => {
      const opens = timeToMinutes(interval.opensAt);
      const closes = timeToMinutes(interval.closesAt);
      return minutes >= opens && minutes < closes;
    });
  }

  private validateHoursPayload(dto: UpdateRestaurantHoursDto): void {
    const weeklyDays = new Set<number>();

    for (const day of dto.weekly) {
      if (weeklyDays.has(day.dayOfWeek)) {
        throw new BadRequestException(
          `Дубльований день тижня: ${day.dayOfWeek}`,
        );
      }
      weeklyDays.add(day.dayOfWeek);
      this.validateIntervals(day.intervals, `день ${day.dayOfWeek}`);
    }

    const overrideDates = new Set<string>();

    for (const override of dto.overrides) {
      if (overrideDates.has(override.date)) {
        throw new BadRequestException(
          `Дубльована дата винятку: ${override.date}`,
        );
      }
      overrideDates.add(override.date);

      if (override.isClosed) {
        if (override.intervals.length > 0) {
          throw new BadRequestException(
            `Для закритої дати ${override.date} не можна вказувати інтервали`,
          );
        }
        continue;
      }

      if (override.intervals.length === 0) {
        throw new BadRequestException(
          `Для дати ${override.date} потрібен хоча б один інтервал або isClosed`,
        );
      }

      this.validateIntervals(override.intervals, `дата ${override.date}`);
    }
  }

  private validateIntervals(
    intervals: TimeIntervalDto[],
    label: string,
  ): void {
    for (const interval of intervals) {
      if (!isValidTime(interval.opensAt) || !isValidTime(interval.closesAt)) {
        throw new BadRequestException(`Некоректний час для ${label}`);
      }

      if (timeToMinutes(interval.opensAt) >= timeToMinutes(interval.closesAt)) {
        if (!isClosedInterval(interval.opensAt, interval.closesAt)) {
          throw new BadRequestException(
            `Час відкриття має бути раніше закриття (${label})`,
          );
        }
      }
    }
  }
}
