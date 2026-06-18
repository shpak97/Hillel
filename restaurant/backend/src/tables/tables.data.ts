import { Injectable } from '@nestjs/common';
import { Prisma, Table } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TablesData {
  constructor(private readonly prisma: PrismaService) {}

  findManyByRestaurant(restaurantId: string): Promise<Table[]> {
    return this.prisma.table.findMany({
      where: { restaurantId, deletedAt: null },
      orderBy: [{ zone: 'asc' }, { label: 'asc' }],
    });
  }

  findByUuid(uuid: string): Promise<Table | null> {
    return this.prisma.table.findUnique({ where: { uuid } });
  }

  create(
    data: Prisma.TableCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Table> {
    const client = tx ?? this.prisma;
    return client.table.create({ data });
  }

  update(uuid: string, data: Prisma.TableUpdateInput): Promise<Table> {
    return this.prisma.table.update({ where: { uuid }, data });
  }

  findMenuLinks(tableId: string) {
    return this.prisma.tableMenu.findMany({
      where: { tableId },
      orderBy: { sortOrder: 'asc' },
      include: { menu: true },
    });
  }

  async replaceMenuLinks(
    tableId: string,
    menuIds: string[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.tableMenu.deleteMany({ where: { tableId } });

      if (menuIds.length === 0) {
        return;
      }

      await tx.tableMenu.createMany({
        data: menuIds.map((menuId, index) => ({
          tableId,
          menuId,
          sortOrder: index,
        })),
      });
    });
  }
}
