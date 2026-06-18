import { cookies } from 'next/headers';
import { API_URL } from '@/shared/config/env';
import { AUTH_COOKIES } from '@/shared/config/cookies';
import type { RestaurantHours } from '@/features/restaurant/model/hours';
import { isRestaurantHours } from '@/features/restaurant/model/hours';

export async function fetchRestaurantHours(
  uuid: string,
): Promise<RestaurantHours | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIES.accessToken)?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/restaurants/${uuid}/hours`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data: unknown = await response.json();

    return isRestaurantHours(data) ? data : null;
  } catch {
    return null;
  }
}
