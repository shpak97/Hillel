import { serverFetch } from '@/shared/api/server-api';
import type { AdminOrder, OrderStatus } from '@/features/order/model/types';

export async function fetchOrdersForRestaurant(
  restaurantUuid: string,
  statuses?: OrderStatus[],
): Promise<AdminOrder[]> {
  const query =
    statuses && statuses.length > 0
      ? `?status=${encodeURIComponent(statuses.join(','))}`
      : '';

  const result = await serverFetch<AdminOrder[]>(
    `/restaurants/${restaurantUuid}/orders${query}`,
  );

  if (!result.ok || !result.data) {
    return [];
  }

  return result.data;
}
