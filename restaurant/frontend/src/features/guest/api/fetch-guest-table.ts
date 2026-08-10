import { API_URL } from '@/shared/config/env';
import type { GuestTableResponse } from '@/features/guest/model/types';

export async function fetchGuestTable(
  slug: string,
  tableUuid: string,
): Promise<GuestTableResponse | null> {
  try {
    const response = await fetch(
      `${API_URL}/guest/r/${encodeURIComponent(slug)}/t/${encodeURIComponent(tableUuid)}`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as GuestTableResponse;
  } catch {
    return null;
  }
}
