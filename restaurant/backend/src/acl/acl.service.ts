import { ForbiddenException, Injectable } from '@nestjs/common';
import { ACCESS_ERRORS } from 'src/common/errors/access.errors';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
  ACL_RESOURCE_ID_ALL,
  ACL_RESOURCE_RESTAURANT,
  type AclPermission,
  type AclResource,
} from './acl.constants';
import { AclData, type FindPermissionsQuery } from './acl.data';

export type { FindPermissionsQuery };

export type HasPermissionQuery = {
  userId: number;
  restaurantId: string;
  permission: AclPermission;
  resource: AclResource;
  resourceId?: string;
};

type AclEntry = {
  resource: string;
  resourceId: string;
  permission: string;
};

@Injectable()
export class AclService {
  constructor(private readonly aclData: AclData) {}

  async hasPermission({
    userId,
    restaurantId,
    permission,
    resource,
    resourceId = ACL_RESOURCE_ID_ALL,
  }: HasPermissionQuery): Promise<boolean> {
    if (await this.aclData.isRestaurantOwner({ userId, restaurantId })) {
      return true;
    }

    const entries = await this.findPermissions({ userId, restaurantId });

    if (
      this.entryGrantsPermission(
        entries,
        ACL_RESOURCE_RESTAURANT,
        ACL_RESOURCE_ID_ALL,
        permission,
      )
    ) {
      return true;
    }

    if (
      this.entryGrantsPermission(
        entries,
        resource,
        ACL_RESOURCE_ID_ALL,
        permission,
      )
    ) {
      return true;
    }

    if (resourceId === ACL_RESOURCE_ID_ALL) {
      return false;
    }

    return this.entryGrantsPermission(
      entries,
      resource,
      resourceId,
      permission,
    );
  }

  async assertHasPermission(query: HasPermissionQuery): Promise<void> {
    const allowed = await this.hasPermission(query);

    if (!allowed) {
      throw new ForbiddenException(ACCESS_ERRORS.DENIED);
    }
  }

  async findPermissions(query: FindPermissionsQuery) {
    return this.aclData.findPermissions(query);
  }

  private entryGrantsPermission(
    entries: AclEntry[],
    resource: AclResource,
    resourceId: string,
    permission: AclPermission,
  ): boolean {
    const grants = entries.filter(
      (entry) => entry.resource === resource && entry.resourceId === resourceId,
    );

    if (grants.length === 0) {
      return false;
    }

    const grantedPermissions = new Set(
      grants.map((entry) => entry.permission).filter(Boolean),
    );

    if (grantedPermissions.has(permission)) {
      return true;
    }

    return (
      permission === ACL_PERMISSION_READ &&
      grantedPermissions.has(ACL_PERMISSION_WRITE)
    );
  }
}
