import { cookies } from 'next/headers';
import { API_URL } from '@/shared/config/env';
import { AUTH_COOKIES } from '@/shared/config/cookies';
import type { Restaurant } from '@/features/restaurant/model/types';

export async function fetchRestaurantsForUser(): Promise<Restaurant[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIES.accessToken)?.value;

  if (!accessToken) {
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/restaurants`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as Restaurant[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
