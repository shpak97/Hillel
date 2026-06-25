import { serverFetch } from '@/shared/api/server-api';
import type { SectionMenuItem } from '@/features/menu/model/item-types';

export async function fetchSectionMenuItems(
  restaurantUuid: string,
  menuUuid: string,
  sectionUuid: string,
): Promise<SectionMenuItem[]> {
  const result = await serverFetch<SectionMenuItem[]>(
    `/restaurants/${restaurantUuid}/menus/${menuUuid}/sections/${sectionUuid}/items`,
  );

  if (!result.ok || !result.data) {
    return [];
  }

  return result.data;
}
