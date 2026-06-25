import { Injectable } from '@nestjs/common';
import { MenuItem, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export type MenuItemWithProducts = MenuItem & {
  products: {
    productId: string;
    sortOrder: number;
    quantity: Prisma.Decimal;
    priceOverride: Prisma.Decimal | null;
    product: {
      uuid: string;
      name: string;
      baseUnit: string;
      basePrice: Prisma.Decimal;
    };
  }[];
};

@Injectable()
export class MenuItemsData {
  constructor(private readonly prisma: PrismaService) {}

  findManyByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      where: { restaurantId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  findManyByRestaurantWithProducts(
    restaurantId: string,
  ): Promise<MenuItemWithProducts[]> {
    return this.prisma.menuItem.findMany({
      where: { restaurantId, deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        products: {
          orderBy: { sortOrder: 'asc' },
          include: { product: true },
        },
      },
    });
  }

  findByUuid(uuid: string): Promise<MenuItem | null> {
    return this.prisma.menuItem.findUnique({ where: { uuid } });
  }

  findByUuidWithProducts(uuid: string): Promise<MenuItemWithProducts | null> {
    return this.prisma.menuItem.findUnique({
      where: { uuid },
      include: {
        products: {
          orderBy: { sortOrder: 'asc' },
          include: { product: true },
        },
      },
    });
  }

  create(data: Prisma.MenuItemCreateInput): Promise<MenuItem> {
    return this.prisma.menuItem.create({ data });
  }

  update(uuid: string, data: Prisma.MenuItemUpdateInput): Promise<MenuItem> {
    return this.prisma.menuItem.update({ where: { uuid }, data });
  }

  async replaceProducts(
    menuItemId: string,
    items: {
      productId: string;
      quantity: number;
      priceOverride: number | null;
    }[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.menuItemProduct.deleteMany({ where: { menuItemId } });

      if (items.length === 0) {
        return;
      }

      await tx.menuItemProduct.createMany({
        data: items.map((item, index) => ({
          menuItemId,
          productId: item.productId,
          sortOrder: index,
          quantity: item.quantity,
          priceOverride: item.priceOverride,
        })),
      });
    });
  }
}
