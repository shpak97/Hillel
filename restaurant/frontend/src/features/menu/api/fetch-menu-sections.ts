import { serverFetch } from '@/shared/api/server-api';
import type { MenuSection } from '@/features/menu/model/section-types';

export async function fetchMenuSections(
  restaurantUuid: string,
  menuUuid: string,
): Promise<MenuSection[]> {
  const result = await serverFetch<MenuSection[]>(
    `/restaurants/${restaurantUuid}/menus/${menuUuid}/sections`,
  );

  if (!result.ok || !result.data) {
    return [];
  }

  return result.data;
}
