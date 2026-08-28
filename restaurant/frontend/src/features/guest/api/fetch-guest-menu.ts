import { API_URL } from '@/shared/config/env';
import type { GuestMenuResponse } from '@/features/guest/model/types';

export async function fetchGuestMenu(
  slug: string,
  menuUuid: string,
): Promise<GuestMenuResponse | null> {
  try {
    const response = await fetch(
      `${API_URL}/guest/r/${encodeURIComponent(slug)}/m/${encodeURIComponent(menuUuid)}`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as GuestMenuResponse;
  } catch {
    return null;
  }
}
