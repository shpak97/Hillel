import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Restaurant } from '@prisma/client';
import { AclData } from 'src/acl/acl.data';
import { AclService } from 'src/acl/acl.service';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
  ACL_RESOURCE_RESTAURANT,
} from 'src/acl/acl.constants';
import { isPrismaErrorCode } from 'src/common/utils/prisma-error.util';
import {
  activeStateFromFlag,
  isEntityActive,
} from 'src/common/utils/entity-active.util';
import { PrismaService } from 'src/prisma.service';
import { RESTAURANTS_ERRORS } from './restaurants.errors';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantsData } from './restaurants.data';

export type RestaurantStatus = 'active' | 'setup';

export type RestaurantResponse = {
  uuid: string;
  slug: string;
  title: string;
  description: string;
  address: string | null;
  photos: string[];
  timezone: string;
  currency: string;
  isActive: boolean;
  deactivatedAt: string | null;
  ownerId: number;
  status: RestaurantStatus;
};

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly restaurantsData: RestaurantsData,
    private readonly aclData: AclData,
    private readonly aclService: AclService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(userId: number): Promise<RestaurantResponse[]> {
    const restaurants =
      await this.restaurantsData.findManyAccessibleByUser(userId);
    return restaurants.map((restaurant) => this.toResponse(restaurant));
  }

  async findOne(userId: number, uuid: string): Promise<RestaurantResponse> {
    const restaurant = await this.getAccessibleRestaurant(
      userId,
      uuid,
      ACL_PERMISSION_READ,
    );
    return this.toResponse(restaurant);
  }

  async assertAccess(
    userId: number,
    uuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<Restaurant> {
    return this.getAccessibleRestaurant(userId, uuid, permission);
  }

  async create(
    ownerId: number,
    dto: CreateRestaurantDto,
    photos: string[] = [],
  ): Promise<RestaurantResponse> {
    try {
      const restaurant = await this.prisma.$transaction(async (tx) => {
        const created = await this.restaurantsData.create(
          {
            title: dto.title,
            slug: dto.slug,
            description: dto.description,
            ...(dto.address !== undefined
              ? { address: this.normalizeOptionalString(dto.address) }
              : {}),
            photos,
            ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
            ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
            owner: { connect: { id: ownerId } },
          },
          tx,
        );

        await this.aclData.createOwnerAccess(ownerId, created.uuid, tx);
        return created;
      });

      return this.toResponse(restaurant);
    } catch (error: unknown) {
      if (isPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException(RESTAURANTS_ERRORS.SLUG_ALREADY_EXISTS);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(RESTAURANTS_ERRORS.CREATE_FAILED);
    }
  }

  async update(
    userId: number,
    uuid: string,
    dto: UpdateRestaurantDto,
    newPhotos: string[] = [],
  ): Promise<RestaurantResponse> {
    await this.getAccessibleRestaurant(userId, uuid, ACL_PERMISSION_WRITE);

    const photos =
      dto.photos !== undefined
        ? [...dto.photos, ...newPhotos].slice(0, 20)
        : undefined;

    try {
      const restaurant = await this.restaurantsData.update(uuid, {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.address !== undefined
          ? { address: this.normalizeOptionalString(dto.address) }
          : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(photos !== undefined ? { photos } : {}),
      });
      return this.toResponse(restaurant);
    } catch (error: unknown) {
      if (isPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException(RESTAURANTS_ERRORS.SLUG_ALREADY_EXISTS);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(RESTAURANTS_ERRORS.UPDATE_FAILED);
    }
  }

  async deactivate(userId: number, uuid: string): Promise<RestaurantResponse> {
    await this.getAccessibleRestaurant(userId, uuid, ACL_PERMISSION_WRITE);

    try {
      const restaurant = await this.restaurantsData.update(uuid, {
        deactivatedAt: new Date(),
      });
      return this.toResponse(restaurant);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        RESTAURANTS_ERRORS.DEACTIVATE_FAILED,
      );
    }
  }

  async activate(userId: number, uuid: string): Promise<RestaurantResponse> {
    await this.getAccessibleRestaurant(userId, uuid, ACL_PERMISSION_WRITE);

    try {
      const restaurant = await this.restaurantsData.update(uuid, {
        deactivatedAt: null,
      });
      return this.toResponse(restaurant);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        RESTAURANTS_ERRORS.ACTIVATE_FAILED,
      );
    }
  }

  async remove(userId: number, uuid: string): Promise<void> {
    await this.getAccessibleRestaurant(userId, uuid, ACL_PERMISSION_WRITE);

    try {
      await this.restaurantsData.update(uuid, {
        deletedAt: new Date(),
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(RESTAURANTS_ERRORS.DELETE_FAILED);
    }
  }

  private async getAccessibleRestaurant(
    userId: number,
    uuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantsData.findByUuid(uuid);

    if (!restaurant || restaurant.deletedAt) {
      throw new NotFoundException(RESTAURANTS_ERRORS.NOT_FOUND);
    }

    if (restaurant.ownerId === userId) {
      return restaurant;
    }

    const hasRestaurantAccess = await this.aclService.hasPermission({
      userId,
      restaurantId: uuid,
      permission,
      resource: ACL_RESOURCE_RESTAURANT,
    });

    if (hasRestaurantAccess) {
      return restaurant;
    }

    if (permission === ACL_PERMISSION_READ) {
      const permissions = await this.aclService.findPermissions({
        userId,
        restaurantId: uuid,
      });

      if (permissions.length > 0) {
        return restaurant;
      }
    }

    throw new ForbiddenException(RESTAURANTS_ERRORS.ACCESS_DENIED);
  }

  private normalizeOptionalString(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toResponse(restaurant: Restaurant): RestaurantResponse {
    return {
      uuid: restaurant.uuid,
      slug: restaurant.slug,
      title: restaurant.title,
      description: restaurant.description,
      address: restaurant.address,
      photos: restaurant.photos,
      timezone: restaurant.timezone,
      currency: restaurant.currency,
      isActive: isEntityActive(restaurant.deactivatedAt, restaurant.deletedAt),
      deactivatedAt: restaurant.deactivatedAt?.toISOString() ?? null,
      ownerId: restaurant.ownerId,
      status: restaurant.photos.length > 0 ? 'active' : 'setup',
    };
  }
}
