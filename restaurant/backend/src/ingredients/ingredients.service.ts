import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Ingredient } from '@prisma/client';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
} from 'src/acl/acl.constants';
import {
  activeStateFromFlag,
  isEntityActive,
} from 'src/common/utils/entity-active.util';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { CreateIngredientDto, UpdateIngredientDto } from './dto/ingredient.dto';
import { IngredientsData } from './ingredients.data';
import { INGREDIENTS_ERRORS } from './ingredients.errors';

export type IngredientResponse = {
  uuid: string;
  restaurantId: string;
  name: string;
  baseUnit: string;
  isActive: boolean;
};

@Injectable()
export class IngredientsService {
  constructor(
    private readonly ingredientsData: IngredientsData,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async findAll(
    userId: number,
    restaurantId: string,
  ): Promise<IngredientResponse[]> {
    await this.assertRestaurantAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
    );
    const ingredients =
      await this.ingredientsData.findManyByRestaurant(restaurantId);
    return ingredients.map((ingredient) => this.toResponse(ingredient));
  }

  async findOne(
    userId: number,
    restaurantId: string,
    uuid: string,
  ): Promise<IngredientResponse> {
    const ingredient = await this.getAccessibleIngredient(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_READ,
    );
    return this.toResponse(ingredient);
  }

  async create(
    userId: number,
    restaurantId: string,
    dto: CreateIngredientDto,
  ): Promise<IngredientResponse> {
    await this.assertRestaurantAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_WRITE,
    );

    try {
      const ingredient = await this.ingredientsData.create({
        name: dto.name,
        baseUnit: dto.baseUnit,
        restaurant: { connect: { uuid: restaurantId } },
      });
      return this.toResponse(ingredient);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(INGREDIENTS_ERRORS.CREATE_FAILED);
    }
  }

  async update(
    userId: number,
    restaurantId: string,
    uuid: string,
    dto: UpdateIngredientDto,
  ): Promise<IngredientResponse> {
    await this.getAccessibleIngredient(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      const ingredient = await this.ingredientsData.update(uuid, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.baseUnit !== undefined ? { baseUnit: dto.baseUnit } : {}),
        ...(dto.isActive !== undefined
          ? activeStateFromFlag(dto.isActive)
          : {}),
      });
      return this.toResponse(ingredient);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(INGREDIENTS_ERRORS.UPDATE_FAILED);
    }
  }

  async remove(
    userId: number,
    restaurantId: string,
    uuid: string,
  ): Promise<void> {
    await this.getAccessibleIngredient(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      await this.ingredientsData.update(uuid, { deletedAt: new Date() });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(INGREDIENTS_ERRORS.DELETE_FAILED);
    }
  }

  private async assertRestaurantAccess(
    userId: number,
    restaurantId: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<void> {
    await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      permission,
    );
  }

  private async getAccessibleIngredient(
    userId: number,
    restaurantId: string,
    uuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<Ingredient> {
    await this.assertRestaurantAccess(userId, restaurantId, permission);

    const ingredient = await this.ingredientsData.findByUuid(uuid);
    if (
      !ingredient ||
      ingredient.deletedAt ||
      ingredient.restaurantId !== restaurantId
    ) {
      throw new NotFoundException(INGREDIENTS_ERRORS.NOT_FOUND);
    }

    return ingredient;
  }

  private toResponse(ingredient: Ingredient): IngredientResponse {
    return {
      uuid: ingredient.uuid,
      restaurantId: ingredient.restaurantId,
      name: ingredient.name,
      baseUnit: ingredient.baseUnit,
      isActive: isEntityActive(ingredient.deactivatedAt, ingredient.deletedAt),
    };
  }
}
