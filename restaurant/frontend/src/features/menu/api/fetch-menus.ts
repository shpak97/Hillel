import { cookies } from 'next/headers';
import { API_URL } from '@/shared/config/env';
import { AUTH_COOKIES } from '@/shared/config/cookies';
import type { Menu } from '@/features/menu/model/types';
import type { RestaurantHours } from '@/features/restaurant/model/hours';

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.accessToken)?.value;
}

export async function fetchMenusForRestaurant(
  restaurantUuid: string,
): Promise<Menu[]> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${restaurantUuid}/menus`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as Menu[];
  } catch {
    return [];
  }
}

export async function fetchMenuByUuid(
  restaurantUuid: string,
  menuUuid: string,
): Promise<Menu | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${restaurantUuid}/menus/${menuUuid}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Menu;
  } catch {
    return null;
  }
}

export async function fetchMenuHours(
  restaurantUuid: string,
  menuUuid: string,
): Promise<RestaurantHours | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${restaurantUuid}/menus/${menuUuid}/hours`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as RestaurantHours;
  } catch {
    return null;
  }
}
