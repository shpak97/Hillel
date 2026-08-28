import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MenuSectionItemsData {
  constructor(private readonly prisma: PrismaService) {}

  findManyBySection(sectionId: string) {
    return this.prisma.menuSectionItem.findMany({
      where: { sectionId },
      orderBy: { sortOrder: 'asc' },
      include: {
        menuItem: {
          include: {
            products: {
              orderBy: { sortOrder: 'asc' },
              include: { product: true },
            },
          },
        },
      },
    });
  }

  async replaceSectionItems(
    sectionId: string,
    itemIds: string[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.menuSectionItem.deleteMany({ where: { sectionId } });

      if (itemIds.length === 0) {
        return;
      }

      await tx.menuSectionItem.createMany({
        data: itemIds.map((menuItemId, index) => ({
          sectionId,
          menuItemId,
          sortOrder: index,
        })),
      });
    });
  }
}
