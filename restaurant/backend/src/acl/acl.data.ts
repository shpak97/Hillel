import { Injectable } from '@nestjs/common';
import { Acl, Prisma } from '@prisma/client';
import {
  ACL_PERMISSION_WRITE,
  ACL_RESOURCE_ID_ALL,
  ACL_RESOURCE_RESTAURANT,
} from './acl.constants';
import { PrismaService } from '../prisma.service';

export type FindPermissionsQuery = {
  userId: number;
  restaurantId: string;
};

export type IsRestaurantOwnerQuery = {
  userId: number;
  restaurantId: string;
};

@Injectable()
export class AclData {
  constructor(private readonly prisma: PrismaService) {}

  createOwnerAccess(
    userId: number,
    restaurantId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Acl> {
    const client = tx ?? this.prisma;
    return client.acl.create({
      data: {
        userId,
        restaurantId,
        resource: ACL_RESOURCE_RESTAURANT,
        resourceId: ACL_RESOURCE_ID_ALL,
        permission: ACL_PERMISSION_WRITE,
      },
    });
  }

  findPermissions(query: FindPermissionsQuery): Promise<Acl[]> {
    return this.prisma.acl.findMany({ where: query });
  }

  async isRestaurantOwner(query: IsRestaurantOwnerQuery): Promise<boolean> {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        uuid: query.restaurantId,
        ownerId: query.userId,
        deletedAt: null,
      },
      select: { uuid: true },
    });

    return restaurant !== null;
  }
}
