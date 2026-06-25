import { serverFetch } from '@/shared/api/server-api';
import type { MenuItem } from '@/features/menu/model/item-types';

export async function fetchMenuItemsForRestaurant(
  restaurantUuid: string,
): Promise<MenuItem[]> {
  const result = await serverFetch<MenuItem[]>(
    `/restaurants/${restaurantUuid}/menu-items`,
  );

  if (!result.ok || !result.data) {
    return [];
  }

  return result.data;
}

export async function fetchMenuItemByUuid(
  restaurantUuid: string,
  itemUuid: string,
): Promise<MenuItem | null> {
  const result = await serverFetch<MenuItem>(
    `/restaurants/${restaurantUuid}/menu-items/${itemUuid}`,
  );

  if (!result.ok || !result.data) {
    return null;
  }

  return result.data;
}
