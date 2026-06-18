import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
  ACL_RESOURCE_ID_ALL,
  ACL_RESOURCE_RESTAURANT,
  type AclPermission,
  type AclResource,
} from './acl.constants';
import { AclData } from './acl.data';

@Injectable()
export class AclService {
  constructor(private readonly aclData: AclData) {}

  async can(
    userId: number,
    restaurantId: string,
    permission: AclPermission,
    resource: AclResource,
    resourceId: string = ACL_RESOURCE_ID_ALL,
  ): Promise<boolean> {
    if (await this.aclData.isRestaurantOwner(userId, restaurantId)) {
      return true;
    }

    const entries = await this.aclData.findByUserAndRestaurant(
      userId,
      restaurantId,
    );

    if (this.matches(entries, ACL_RESOURCE_RESTAURANT, ACL_RESOURCE_ID_ALL, permission)) {
      return true;
    }

    if (
      permission === ACL_PERMISSION_READ &&
      this.matches(entries, ACL_RESOURCE_RESTAURANT, ACL_RESOURCE_ID_ALL, ACL_PERMISSION_WRITE)
    ) {
      return true;
    }

    if (this.matches(entries, resource, ACL_RESOURCE_ID_ALL, permission)) {
      return true;
    }

    if (
      permission === ACL_PERMISSION_READ &&
      this.matches(entries, resource, ACL_RESOURCE_ID_ALL, ACL_PERMISSION_WRITE)
    ) {
      return true;
    }

    if (resourceId !== ACL_RESOURCE_ID_ALL) {
      if (this.matches(entries, resource, resourceId, permission)) {
        return true;
      }

      if (
        permission === ACL_PERMISSION_READ &&
        this.matches(entries, resource, resourceId, ACL_PERMISSION_WRITE)
      ) {
        return true;
      }
    }

    return false;
  }

  async assertCan(
    userId: number,
    restaurantId: string,
    permission: AclPermission,
    resource: AclResource,
    resourceId: string = ACL_RESOURCE_ID_ALL,
  ): Promise<void> {
    const allowed = await this.can(
      userId,
      restaurantId,
      permission,
      resource,
      resourceId,
    );

    if (!allowed) {
      throw new ForbiddenException('Немає доступу до цього ресурсу.');
    }
  }

  async canLinkTableAndMenu(
    userId: number,
    restaurantId: string,
    tableId: string,
    menuId: string,
  ): Promise<boolean> {
    if (await this.aclData.isRestaurantOwner(userId, restaurantId)) {
      return true;
    }

    const canManageRestaurant = await this.can(
      userId,
      restaurantId,
      ACL_PERMISSION_WRITE,
      ACL_RESOURCE_RESTAURANT,
    );

    if (canManageRestaurant) {
      return true;
    }

    const [canTable, canMenu] = await Promise.all([
      this.can(
        userId,
        restaurantId,
        ACL_PERMISSION_WRITE,
        'table',
        tableId,
      ),
      this.can(
        userId,
        restaurantId,
        ACL_PERMISSION_WRITE,
        'menu',
        menuId,
      ),
    ]);

    return canTable && canMenu;
  }

  async assertCanLinkTableAndMenu(
    userId: number,
    restaurantId: string,
    tableId: string,
    menuId: string,
  ): Promise<void> {
    const allowed = await this.canLinkTableAndMenu(
      userId,
      restaurantId,
      tableId,
      menuId,
    );

    if (!allowed) {
      throw new ForbiddenException(
        'Немає доступу для прив’язки цього столика та меню.',
      );
    }
  }

  async canReadAnyTable(userId: number, restaurantId: string): Promise<boolean> {
    return this.can(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
      'table',
      ACL_RESOURCE_ID_ALL,
    );
  }

  async canReadAnyMenu(userId: number, restaurantId: string): Promise<boolean> {
    return this.can(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
      'menu',
      ACL_RESOURCE_ID_ALL,
    );
  }

  async hasAnyRestaurantAccess(
    userId: number,
    restaurantId: string,
  ): Promise<boolean> {
    if (await this.aclData.isRestaurantOwner(userId, restaurantId)) {
      return true;
    }

    const entries = await this.aclData.findByUserAndRestaurant(
      userId,
      restaurantId,
    );

    return entries.some(
      (entry) =>
        entry.permission === ACL_PERMISSION_READ ||
        entry.permission === ACL_PERMISSION_WRITE,
    );
  }

  private matches(
    entries: Array<{
      resource: string;
      resourceId: string;
      permission: string;
    }>,
    resource: AclResource,
    resourceId: string,
    permission: AclPermission,
  ): boolean {
    return entries.some(
      (entry) =>
        entry.resource === resource &&
        entry.resourceId === resourceId &&
        entry.permission === permission,
    );
  }
}
