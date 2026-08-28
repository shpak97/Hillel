import { serverFetch } from '@/shared/api/server-api';
import type { RestaurantQrStyleResponse } from '@/features/restaurant/model/qr-style';
import { DEFAULT_QR_STYLE } from '@/features/restaurant/model/qr-style';

export async function fetchRestaurantQrStyle(
  restaurantUuid: string,
): Promise<RestaurantQrStyleResponse> {
  const result = await serverFetch<RestaurantQrStyleResponse>(
    `/restaurants/${restaurantUuid}/qr-style`,
  );

  if (!result.ok || !result.data) {
    return { style: DEFAULT_QR_STYLE, logo: null };
  }

  return result.data;
}
