import { Injectable } from '@nestjs/common';
import { Acl, Prisma } from '@prisma/client';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
  ACL_RESOURCE_ID_ALL,
  ACL_RESOURCE_RESTAURANT,
  type AclPermission,
  type AclResource,
} from './acl.constants';
import { PrismaService } from '../prisma.service';

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

  findByUserAndRestaurant(
    userId: number,
    restaurantId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Acl[]> {
    const client = tx ?? this.prisma;
    return client.acl.findMany({
      where: { userId, restaurantId },
    });
  }

  isRestaurantOwner(
    userId: number,
    restaurantId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const client = tx ?? this.prisma;
    return client.restaurant
      .findFirst({
        where: { uuid: restaurantId, ownerId: userId, deletedAt: null },
        select: { uuid: true },
      })
      .then((restaurant) => restaurant !== null);
  }
}
