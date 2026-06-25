import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '@prisma/client';
import { ACL_PERMISSION_READ, ACL_PERMISSION_WRITE } from 'src/acl/acl.constants';
import {
  activeStateFromFlag,
  isEntityActive,
} from 'src/common/utils/entity-active.util';
import { parseMoneyInput, toMoneyNumber } from 'src/common/utils/money.util';
import { IngredientsData } from 'src/ingredients/ingredients.data';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import {
  CreateProductDto,
  ReplaceProductRecipeDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductsData } from './products.data';
import { PRODUCTS_ERRORS } from './products.errors';

export type ProductRecipeItemResponse = {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
};

export type ProductResponse = {
  uuid: string;
  restaurantId: string;
  name: string;
  description: string | null;
  photo: string | null;
  baseUnit: string;
  basePrice: number;
  isActive: boolean;
  recipe: ProductRecipeItemResponse[];
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsData: ProductsData,
    private readonly ingredientsData: IngredientsData,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async findAll(userId: number, restaurantId: string): Promise<ProductResponse[]> {
    await this.assertRestaurantAccess(userId, restaurantId, ACL_PERMISSION_READ);
    const products =
      await this.productsData.findManyByRestaurantWithRecipe(restaurantId);

    return products.map((product) =>
      this.toResponse(product, product.ingredients),
    );
  }

  async findOne(
    userId: number,
    restaurantId: string,
    uuid: string,
  ): Promise<ProductResponse> {
    const product = await this.getAccessibleProduct(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_READ,
    );
    const withRecipe = await this.productsData.findByUuidWithRecipe(product.uuid);
    return this.toResponse(
      withRecipe ?? product,
      withRecipe?.ingredients,
    );
  }

  async create(
    userId: number,
    restaurantId: string,
    dto: CreateProductDto,
    photo?: string,
  ): Promise<ProductResponse> {
    await this.assertRestaurantAccess(userId, restaurantId, ACL_PERMISSION_WRITE);

    try {
      const product = await this.productsData.create({
        name: dto.name,
        description: dto.description,
        baseUnit: dto.baseUnit,
        basePrice: parseMoneyInput(dto.basePrice),
        photo,
        restaurant: { connect: { uuid: restaurantId } },
      });
      return this.toResponse(product, []);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(PRODUCTS_ERRORS.CREATE_FAILED);
    }
  }

  async update(
    userId: number,
    restaurantId: string,
    uuid: string,
    dto: UpdateProductDto,
    photoPatch?: string | null,
  ): Promise<ProductResponse> {
    await this.getAccessibleProduct(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      const product = await this.productsData.update(uuid, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.baseUnit !== undefined ? { baseUnit: dto.baseUnit } : {}),
        ...(dto.basePrice !== undefined
          ? { basePrice: parseMoneyInput(dto.basePrice) }
          : {}),
        ...(photoPatch !== undefined ? { photo: photoPatch } : {}),
        ...(dto.isActive !== undefined
          ? activeStateFromFlag(dto.isActive)
          : {}),
      });

      const withRecipe = await this.productsData.findByUuidWithRecipe(product.uuid);
      return this.toResponse(
        withRecipe ?? product,
        withRecipe?.ingredients,
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(PRODUCTS_ERRORS.UPDATE_FAILED);
    }
  }

  async replaceRecipe(
    userId: number,
    restaurantId: string,
    uuid: string,
    dto: ReplaceProductRecipeDto,
  ): Promise<ProductResponse> {
    await this.getAccessibleProduct(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_WRITE,
    );

    const ingredientIds = new Set<string>();
    for (const item of dto.ingredients) {
      if (ingredientIds.has(item.ingredientId)) {
        throw new BadRequestException(PRODUCTS_ERRORS.DUPLICATE_RECIPE_INGREDIENT);
      }
      ingredientIds.add(item.ingredientId);

      const ingredient = await this.ingredientsData.findByUuid(item.ingredientId);
      if (
        !ingredient ||
        ingredient.deletedAt ||
        ingredient.restaurantId !== restaurantId
      ) {
        throw new BadRequestException(
          PRODUCTS_ERRORS.ingredientNotFoundInRestaurant(item.ingredientId),
        );
      }

      if (ingredient.deactivatedAt) {
        throw new BadRequestException(
          PRODUCTS_ERRORS.ingredientInactive(item.ingredientId),
        );
      }

      if (item.unit !== ingredient.baseUnit) {
        throw new BadRequestException(
          PRODUCTS_ERRORS.ingredientUnitMismatch(
            ingredient.name,
            ingredient.baseUnit,
          ),
        );
      }
    }

    try {
      await this.productsData.replaceRecipe(uuid, dto.ingredients);
      const withRecipe = await this.productsData.findByUuidWithRecipe(uuid);

      if (!withRecipe) {
        throw new NotFoundException(PRODUCTS_ERRORS.NOT_FOUND);
      }

      return this.toResponse(withRecipe, withRecipe.ingredients);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(PRODUCTS_ERRORS.RECIPE_UPDATE_FAILED);
    }
  }

  async remove(
    userId: number,
    restaurantId: string,
    uuid: string,
  ): Promise<void> {
    await this.getAccessibleProduct(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      await this.productsData.update(uuid, { deletedAt: new Date() });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(PRODUCTS_ERRORS.DELETE_FAILED);
    }
  }

  private async assertRestaurantAccess(
    userId: number,
    restaurantId: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<void> {
    await this.restaurantsService.assertAccess(userId, restaurantId, permission);
  }

  private async getAccessibleProduct(
    userId: number,
    restaurantId: string,
    uuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<Product> {
    await this.assertRestaurantAccess(userId, restaurantId, permission);

    const product = await this.productsData.findByUuid(uuid);
    if (!product || product.deletedAt || product.restaurantId !== restaurantId) {
      throw new NotFoundException(PRODUCTS_ERRORS.NOT_FOUND);
    }

    return product;
  }

  private toResponse(
    product: Product,
    recipe:
      | {
          ingredientId: string;
          quantity: { toNumber(): number };
          unit: string;
          ingredient: { name: string };
        }[]
      | undefined,
  ): ProductResponse {
    return {
      uuid: product.uuid,
      restaurantId: product.restaurantId,
      name: product.name,
      description: product.description,
      photo: product.photo,
      baseUnit: product.baseUnit,
      basePrice: toMoneyNumber(product.basePrice),
      isActive: isEntityActive(product.deactivatedAt, product.deletedAt),
      recipe: (recipe ?? []).map((item) => ({
        ingredientId: item.ingredientId,
        ingredientName: item.ingredient.name,
        quantity: Number(item.quantity),
        unit: item.unit,
      })),
    };
  }
}
