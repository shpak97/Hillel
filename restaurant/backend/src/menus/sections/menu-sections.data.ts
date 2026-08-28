import { Injectable } from '@nestjs/common';
import { MenuSection, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MenuSectionsData {
  constructor(private readonly prisma: PrismaService) {}

  findManyByMenu(menuId: string): Promise<MenuSection[]> {
    return this.prisma.menuSection.findMany({
      where: { menuId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findByUuid(uuid: string): Promise<MenuSection | null> {
    return this.prisma.menuSection.findUnique({ where: { uuid } });
  }

  async getNextSortOrder(menuId: string): Promise<number> {
    const last = await this.prisma.menuSection.findFirst({
      where: { menuId, deletedAt: null },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? -1) + 1;
  }

  create(data: Prisma.MenuSectionCreateInput): Promise<MenuSection> {
    return this.prisma.menuSection.create({ data });
  }

  update(
    uuid: string,
    data: Prisma.MenuSectionUpdateInput,
  ): Promise<MenuSection> {
    return this.prisma.menuSection.update({ where: { uuid }, data });
  }
}
