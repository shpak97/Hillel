import { serverFetch } from '@/shared/api/server-api';
import type { QrCode } from '@/features/qr-code/model/types';

export async function fetchQrCodesForRestaurant(
  restaurantUuid: string,
): Promise<QrCode[]> {
  const result = await serverFetch<QrCode[]>(
    `/restaurants/${restaurantUuid}/qr-codes`,
  );

  if (!result.ok || !result.data) {
    return [];
  }

  return result.data;
}

export async function fetchQrCodeByUuid(
  restaurantUuid: string,
  qrCodeUuid: string,
): Promise<QrCode | null> {
  const result = await serverFetch<QrCode>(
    `/restaurants/${restaurantUuid}/qr-codes/${qrCodeUuid}`,
  );

  if (!result.ok || !result.data) {
    return null;
  }

  return result.data;
}
