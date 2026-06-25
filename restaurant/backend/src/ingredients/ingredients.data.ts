import { Injectable } from '@nestjs/common';
import { Ingredient, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class IngredientsData {
  constructor(private readonly prisma: PrismaService) {}

  findManyByRestaurant(restaurantId: string): Promise<Ingredient[]> {
    return this.prisma.ingredient.findMany({
      where: { restaurantId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  findByUuid(uuid: string): Promise<Ingredient | null> {
    return this.prisma.ingredient.findUnique({ where: { uuid } });
  }

  create(data: Prisma.IngredientCreateInput): Promise<Ingredient> {
    return this.prisma.ingredient.create({ data });
  }

  update(uuid: string, data: Prisma.IngredientUpdateInput): Promise<Ingredient> {
    return this.prisma.ingredient.update({ where: { uuid }, data });
  }
}
