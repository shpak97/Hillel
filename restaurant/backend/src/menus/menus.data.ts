import { Injectable } from '@nestjs/common';
import { Menu, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MenusData {
  constructor(private readonly prisma: PrismaService) {}

  findManyByRestaurant(restaurantId: string): Promise<Menu[]> {
    return this.prisma.menu.findMany({
      where: { restaurantId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  findByUuid(uuid: string): Promise<Menu | null> {
    return this.prisma.menu.findUnique({ where: { uuid } });
  }

  create(
    data: Prisma.MenuCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Menu> {
    const client = tx ?? this.prisma;
    return client.menu.create({ data });
  }

  update(uuid: string, data: Prisma.MenuUpdateInput): Promise<Menu> {
    return this.prisma.menu.update({ where: { uuid }, data });
  }

  findTableLinks(menuId: string) {
    return this.prisma.tableMenu.findMany({
      where: { menuId },
      orderBy: { sortOrder: 'asc' },
      include: { table: true },
    });
  }

  async replaceTableLinks(menuId: string, tableIds: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.tableMenu.deleteMany({ where: { menuId } });

      if (tableIds.length === 0) {
        return;
      }

      await tx.tableMenu.createMany({
        data: tableIds.map((tableId, index) => ({
          tableId,
          menuId,
          sortOrder: index,
        })),
      });
    });
  }
}
