import { cookies } from 'next/headers';
import { API_URL } from '@/shared/config/env';
import { AUTH_COOKIES } from '@/shared/config/cookies';
import type { Restaurant } from '@/features/restaurant/model/types';

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.accessToken)?.value;
}

export async function fetchRestaurantByUuid(
  uuid: string,
): Promise<Restaurant | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/restaurants/${uuid}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Restaurant;
  } catch {
    return null;
  }
}
