import { API_URL } from '@/shared/config/env';
import type { GuestRestaurantResponse } from '@/features/guest/model/types';

export async function fetchGuestRestaurant(
  slug: string,
): Promise<GuestRestaurantResponse | null> {
  try {
    const response = await fetch(
      `${API_URL}/guest/r/${encodeURIComponent(slug)}`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as GuestRestaurantResponse;
  } catch {
    return null;
  }
}
