import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CLOSED_INTERVAL_CLOSES,
  CLOSED_INTERVAL_OPENS,
} from 'src/common/utils/hours-interval.util';
import { parseDateOnly } from './time.util';
import { PrismaService } from '../../prisma.service';
import type {
  HoursOverrideDto,
  WeeklyDayHoursDto,
} from './dto/update-restaurant-hours.dto';
import type {
  HoursRecord,
  RestaurantTimezoneRow,
} from './restaurant-hours.types';

@Injectable()
export class RestaurantHoursData {
  constructor(private readonly prisma: PrismaService) {}

  findByRestaurant(restaurantId: string): Promise<HoursRecord[]> {
    return this.prisma.restaurantHours.findMany({
      where: { restaurantId },
      orderBy: [{ dayOfWeek: 'asc' }, { date: 'asc' }, { id: 'asc' }],
    });
  }

  async replaceAll(
    restaurantId: string,
    weekly: WeeklyDayHoursDto[],
    overrides: HoursOverrideDto[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.restaurantHours.deleteMany({ where: { restaurantId } });

      const rows: Prisma.RestaurantHoursCreateManyInput[] = [];

      for (const day of weekly) {
        for (const interval of day.intervals) {
          rows.push({
            restaurantId,
            dayOfWeek: day.dayOfWeek,
            date: null,
            opensAt: interval.opensAt,
            closesAt: interval.closesAt,
          });
        }
      }

      for (const override of overrides) {
        if (override.isClosed) {
          rows.push({
            restaurantId,
            dayOfWeek: null,
            date: parseDateOnly(override.date),
            opensAt: CLOSED_INTERVAL_OPENS,
            closesAt: CLOSED_INTERVAL_CLOSES,
          });
          continue;
        }

        for (const interval of override.intervals) {
          rows.push({
            restaurantId,
            dayOfWeek: null,
            date: parseDateOnly(override.date),
            opensAt: interval.opensAt,
            closesAt: interval.closesAt,
          });
        }
      }

      if (rows.length > 0) {
        await tx.restaurantHours.createMany({ data: rows });
      }
    });
  }

  getTimezone(restaurantId: string): Promise<RestaurantTimezoneRow> {
    return this.prisma.restaurant.findUnique({
      where: { uuid: restaurantId },
      select: { timezone: true },
    });
  }
}
