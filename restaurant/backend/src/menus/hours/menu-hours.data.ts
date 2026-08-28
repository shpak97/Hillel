import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CLOSED_INTERVAL_CLOSES,
  CLOSED_INTERVAL_OPENS,
} from 'src/common/utils/hours-interval.util';
import { parseDateOnly } from 'src/restaurants/hours/time.util';
import { PrismaService } from '../../prisma.service';
import type {
  HoursOverrideDto,
  WeeklyDayHoursDto,
} from './dto/update-menu-hours.dto';
import type { HoursRecord } from './menu-hours.types';

@Injectable()
export class MenuHoursData {
  constructor(private readonly prisma: PrismaService) {}

  findByMenu(menuId: string): Promise<HoursRecord[]> {
    return this.prisma.menuHours.findMany({
      where: { menuId },
      orderBy: [{ dayOfWeek: 'asc' }, { date: 'asc' }, { id: 'asc' }],
    });
  }

  getRestaurantTimezone(menuId: string): Promise<{ timezone: string } | null> {
    return this.prisma.menu
      .findUnique({
        where: { uuid: menuId },
        select: { restaurant: { select: { timezone: true } } },
      })
      .then((menu) => (menu ? { timezone: menu.restaurant.timezone } : null));
  }

  async replaceAll(
    menuId: string,
    weekly: WeeklyDayHoursDto[],
    overrides: HoursOverrideDto[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.menuHours.deleteMany({ where: { menuId } });

      const rows: Prisma.MenuHoursCreateManyInput[] = [];

      for (const day of weekly) {
        for (const interval of day.intervals) {
          rows.push({
            menuId,
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
            menuId,
            dayOfWeek: null,
            date: parseDateOnly(override.date),
            opensAt: CLOSED_INTERVAL_OPENS,
            closesAt: CLOSED_INTERVAL_CLOSES,
          });
          continue;
        }

        for (const interval of override.intervals) {
          rows.push({
            menuId,
            dayOfWeek: null,
            date: parseDateOnly(override.date),
            opensAt: interval.opensAt,
            closesAt: interval.closesAt,
          });
        }
      }

      if (rows.length > 0) {
        await tx.menuHours.createMany({ data: rows });
      }
    });
  }
}
