export const ACL_RESOURCE_RESTAURANT = 'restaurant';
export const ACL_RESOURCE_TABLE = 'table';
export const ACL_RESOURCE_MENU = 'menu';

export const ACL_RESOURCE_ID_ALL = '*';

export const ACL_PERMISSION_READ = 'read';
export const ACL_PERMISSION_WRITE = 'write';

export type AclResource =
  | typeof ACL_RESOURCE_RESTAURANT
  | typeof ACL_RESOURCE_TABLE
  | typeof ACL_RESOURCE_MENU;

export type AclPermission =
  | typeof ACL_PERMISSION_READ
  | typeof ACL_PERMISSION_WRITE;

export const ACL_RESOURCES: AclResource[] = [
  ACL_RESOURCE_RESTAURANT,
  ACL_RESOURCE_TABLE,
  ACL_RESOURCE_MENU,
];
