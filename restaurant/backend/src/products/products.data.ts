import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export type ProductWithRecipe = Product & {
  ingredients: {
    ingredientId: string;
    quantity: Prisma.Decimal;
    unit: Product['baseUnit'];
    ingredient: { uuid: string; name: string; baseUnit: Product['baseUnit'] };
  }[];
};

@Injectable()
export class ProductsData {
  constructor(private readonly prisma: PrismaService) {}

  findManyByRestaurant(restaurantId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { restaurantId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  findManyByRestaurantWithRecipe(
    restaurantId: string,
  ): Promise<ProductWithRecipe[]> {
    return this.prisma.product.findMany({
      where: { restaurantId, deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        ingredients: {
          orderBy: { ingredient: { name: 'asc' } },
          include: { ingredient: true },
        },
      },
    });
  }

  findByUuid(uuid: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { uuid } });
  }

  findByUuidWithRecipe(uuid: string): Promise<ProductWithRecipe | null> {
    return this.prisma.product.findUnique({
      where: { uuid },
      include: {
        ingredients: {
          orderBy: { ingredient: { name: 'asc' } },
          include: { ingredient: true },
        },
      },
    });
  }

  create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  update(uuid: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({ where: { uuid }, data });
  }

  async replaceRecipe(
    productId: string,
    items: {
      ingredientId: string;
      quantity: number;
      unit: Product['baseUnit'];
    }[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.productIngredient.deleteMany({ where: { productId } });

      if (items.length === 0) {
        return;
      }

      await tx.productIngredient.createMany({
        data: items.map((item) => ({
          productId,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          unit: item.unit,
        })),
      });
    });
  }
}
