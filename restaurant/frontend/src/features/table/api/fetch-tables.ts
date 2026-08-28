import { cookies } from 'next/headers';
import { API_URL } from '@/shared/config/env';
import { AUTH_COOKIES } from '@/shared/config/cookies';
import type { Table } from '@/features/table/model/types';

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.accessToken)?.value;
}

export async function fetchTablesForRestaurant(
  restaurantUuid: string,
): Promise<Table[]> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${restaurantUuid}/tables`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as Table[];
  } catch {
    return [];
  }
}

export async function fetchTableByUuid(
  restaurantUuid: string,
  tableUuid: string,
): Promise<Table | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${restaurantUuid}/tables/${tableUuid}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Table;
  } catch {
    return null;
  }
}
