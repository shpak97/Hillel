import { Injectable } from '@nestjs/common';
import { Prisma, Restaurant } from '@prisma/client';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
  ACL_RESOURCE_MENU,
  ACL_RESOURCE_RESTAURANT,
  ACL_RESOURCE_TABLE,
} from 'src/acl/acl.constants';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RestaurantsData {
  constructor(private readonly prisma: PrismaService) {}

  findManyAccessibleByUser(userId: number): Promise<Restaurant[]> {
    return this.prisma.restaurant.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          {
            acls: {
              some: {
                userId,
                permission: { in: [ACL_PERMISSION_READ, ACL_PERMISSION_WRITE] },
                resource: {
                  in: [
                    ACL_RESOURCE_RESTAURANT,
                    ACL_RESOURCE_TABLE,
                    ACL_RESOURCE_MENU,
                  ],
                },
              },
            },
          },
        ],
      },
      orderBy: { title: 'asc' },
    });
  }

  findByUuid(uuid: string): Promise<Restaurant | null> {
    return this.prisma.restaurant.findUnique({ where: { uuid } });
  }

  create(
    data: Prisma.RestaurantCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Restaurant> {
    const client = tx ?? this.prisma;
    return client.restaurant.create({ data });
  }

  update(
    uuid: string,
    data: Prisma.RestaurantUpdateInput,
  ): Promise<Restaurant> {
    return this.prisma.restaurant.update({
      where: { uuid },
      data,
    });
  }
}
