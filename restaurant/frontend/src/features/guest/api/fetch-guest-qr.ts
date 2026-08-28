import { API_URL } from '@/shared/config/env';
import type { GuestQrResponse } from '@/features/guest/model/types';

export async function fetchGuestQr(
  slug: string,
  qrUuid: string,
): Promise<GuestQrResponse | null> {
  try {
    const response = await fetch(
      `${API_URL}/guest/r/${encodeURIComponent(slug)}/q/${encodeURIComponent(qrUuid)}`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as GuestQrResponse;
  } catch {
    return null;
  }
}
