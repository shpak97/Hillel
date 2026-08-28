import { ForbiddenException } from '@nestjs/common';
import { ACCESS_ERRORS } from 'src/common/errors/access.errors';
import {
  ACL_PERMISSION_WRITE,
  ACL_RESOURCE_MENU,
  ACL_RESOURCE_RESTAURANT,
  ACL_RESOURCE_TABLE,
} from 'src/acl/acl.constants';
import { AclService } from 'src/acl/acl.service';

export type TableMenuLinkAccessQuery = {
  userId: number;
  restaurantId: string;
  tableUuid: string;
  menuUuid: string;
};

export async function hasTableMenuLinkAccess(
  aclService: AclService,
  query: TableMenuLinkAccessQuery,
): Promise<boolean> {
  const { userId, restaurantId, tableUuid, menuUuid } = query;

  if (
    await aclService.hasPermission({
      userId,
      restaurantId,
      permission: ACL_PERMISSION_WRITE,
      resource: ACL_RESOURCE_RESTAURANT,
    })
  ) {
    return true;
  }

  const hasTableWriteAccess = await aclService.hasPermission({
    userId,
    restaurantId,
    permission: ACL_PERMISSION_WRITE,
    resource: ACL_RESOURCE_TABLE,
    resourceId: tableUuid,
  });

  if (!hasTableWriteAccess) {
    return false;
  }

  return aclService.hasPermission({
    userId,
    restaurantId,
    permission: ACL_PERMISSION_WRITE,
    resource: ACL_RESOURCE_MENU,
    resourceId: menuUuid,
  });
}

export async function assertTableMenuLinkAccess(
  aclService: AclService,
  query: TableMenuLinkAccessQuery,
): Promise<void> {
  const allowed = await hasTableMenuLinkAccess(aclService, query);

  if (!allowed) {
    throw new ForbiddenException(ACCESS_ERRORS.TABLE_MENU_LINK_DENIED);
  }
}
