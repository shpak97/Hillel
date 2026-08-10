import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MenuItem } from '@prisma/client';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
} from 'src/acl/acl.constants';
import {
  activeStateFromFlag,
  isEntityActive,
} from 'src/common/utils/entity-active.util';
import { toMoneyNumber } from 'src/common/utils/money.util';
import { ProductsData } from 'src/products/products.data';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import {
  CreateMenuItemDto,
  ReplaceMenuItemProductsDto,
  UpdateMenuItemDto,
} from './dto/menu-item.dto';
import { MenuItemsData } from './menu-items.data';
import { MENU_ITEMS_ERRORS } from './menu-items.errors';

export type MenuItemProductResponse = {
  productId: string;
  productName: string;
  quantity: number;
  priceOverride: number | null;
  unitPrice: number;
  linePrice: number;
  sortOrder: number;
};

export type MenuItemResponse = {
  uuid: string;
  restaurantId: string;
  name: string;
  description: string | null;
  photo: string | null;
  isActive: boolean;
  calculatedPrice: number;
  priceOverride: number | null;
  totalPrice: number;
  products: MenuItemProductResponse[];
};

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly menuItemsData: MenuItemsData,
    private readonly productsData: ProductsData,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async findAll(
    userId: number,
    restaurantId: string,
  ): Promise<MenuItemResponse[]> {
    await this.assertRestaurantAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
    );
    const items =
      await this.menuItemsData.findManyByRestaurantWithProducts(restaurantId);

    return items.map((item) => this.toResponse(item, item.products));
  }

  async findOne(
    userId: number,
    restaurantId: string,
    itemUuid: string,
  ): Promise<MenuItemResponse> {
    const item = await this.getAccessibleItem(
      userId,
      restaurantId,
      itemUuid,
      ACL_PERMISSION_READ,
    );
    const withProducts = await this.menuItemsData.findByUuidWithProducts(
      item.uuid,
    );
    return this.toResponse(withProducts ?? item, withProducts?.products);
  }

  async create(
    userId: number,
    restaurantId: string,
    dto: CreateMenuItemDto,
    photo?: string,
  ): Promise<MenuItemResponse> {
    await this.assertRestaurantAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_WRITE,
    );

    try {
      const item = await this.menuItemsData.create({
        name: dto.name,
        description: dto.description,
        photo,
        ...(dto.priceOverride !== undefined
          ? { priceOverride: dto.priceOverride }
          : {}),
        restaurant: { connect: { uuid: restaurantId } },
      });
      return this.toResponse(item, []);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(MENU_ITEMS_ERRORS.CREATE_FAILED);
    }
  }

  async update(
    userId: number,
    restaurantId: string,
    itemUuid: string,
    dto: UpdateMenuItemDto,
    photoPatch?: string | null,
  ): Promise<MenuItemResponse> {
    await this.getAccessibleItem(
      userId,
      restaurantId,
      itemUuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      const item = await this.menuItemsData.update(itemUuid, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(photoPatch !== undefined ? { photo: photoPatch } : {}),
        ...(dto.isActive !== undefined
          ? activeStateFromFlag(dto.isActive)
          : {}),
        ...(dto.priceOverride !== undefined
          ? { priceOverride: dto.priceOverride }
          : {}),
      });

      const withProducts = await this.menuItemsData.findByUuidWithProducts(
        item.uuid,
      );
      return this.toResponse(withProducts ?? item, withProducts?.products);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(MENU_ITEMS_ERRORS.UPDATE_FAILED);
    }
  }

  async replaceProducts(
    userId: number,
    restaurantId: string,
    itemUuid: string,
    dto: ReplaceMenuItemProductsDto,
  ): Promise<MenuItemResponse> {
    await this.getAccessibleItem(
      userId,
      restaurantId,
      itemUuid,
      ACL_PERMISSION_WRITE,
    );

    const productIds = new Set<string>();
    for (const item of dto.products) {
      if (productIds.has(item.productId)) {
        throw new BadRequestException(MENU_ITEMS_ERRORS.DUPLICATE_PRODUCT);
      }
      productIds.add(item.productId);

      const product = await this.productsData.findByUuid(item.productId);
      if (
        !product ||
        product.deletedAt ||
        product.restaurantId !== restaurantId
      ) {
        throw new BadRequestException(
          MENU_ITEMS_ERRORS.productNotFoundInRestaurant(item.productId),
        );
      }

      if (product.deactivatedAt) {
        throw new BadRequestException(
          MENU_ITEMS_ERRORS.productInactive(item.productId),
        );
      }
    }

    try {
      await this.menuItemsData.replaceProducts(
        itemUuid,
        dto.products.map((item) => ({
          productId: item.productId,
          quantity: item.quantity ?? 1,
          priceOverride: item.priceOverride ?? null,
        })),
      );

      const withProducts =
        await this.menuItemsData.findByUuidWithProducts(itemUuid);

      if (!withProducts) {
        throw new NotFoundException(MENU_ITEMS_ERRORS.NOT_FOUND);
      }

      return this.toResponse(withProducts, withProducts.products);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        MENU_ITEMS_ERRORS.PRODUCTS_UPDATE_FAILED,
      );
    }
  }

  async remove(
    userId: number,
    restaurantId: string,
    itemUuid: string,
  ): Promise<void> {
    await this.getAccessibleItem(
      userId,
      restaurantId,
      itemUuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      await this.menuItemsData.update(itemUuid, { deletedAt: new Date() });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(MENU_ITEMS_ERRORS.DELETE_FAILED);
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

  private async getAccessibleItem(
    userId: number,
    restaurantId: string,
    itemUuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<MenuItem> {
    await this.assertRestaurantAccess(userId, restaurantId, permission);

    const item = await this.menuItemsData.findByUuid(itemUuid);
    if (!item || item.deletedAt || item.restaurantId !== restaurantId) {
      throw new NotFoundException(MENU_ITEMS_ERRORS.NOT_FOUND);
    }

    return item;
  }

  toResponse(
    item: MenuItem,
    products:
      | {
          productId: string;
          sortOrder: number;
          quantity: { toNumber(): number };
          priceOverride: { toNumber(): number } | null;
          product: { name: string; basePrice: { toNumber(): number } };
        }[]
      | undefined,
  ): MenuItemResponse {
    const productLines = (products ?? []).map((line) => {
      const quantity = Number(line.quantity);
      const unitPrice = toMoneyNumber(
        line.priceOverride !== null
          ? line.priceOverride
          : line.product.basePrice,
      );
      return {
        productId: line.productId,
        productName: line.product.name,
        quantity,
        priceOverride:
          line.priceOverride !== null
            ? toMoneyNumber(line.priceOverride)
            : null,
        unitPrice,
        linePrice: toMoneyNumber(unitPrice * quantity),
        sortOrder: line.sortOrder,
      };
    });

    const calculatedPrice = toMoneyNumber(
      productLines.reduce((sum, line) => sum + line.linePrice, 0),
    );
    const priceOverride =
      item.priceOverride !== null ? toMoneyNumber(item.priceOverride) : null;

    return {
      uuid: item.uuid,
      restaurantId: item.restaurantId,
      name: item.name,
      description: item.description,
      photo: item.photo,
      isActive: isEntityActive(item.deactivatedAt, item.deletedAt),
      calculatedPrice,
      priceOverride,
      totalPrice: priceOverride ?? calculatedPrice,
      products: productLines,
    };
  }
}
