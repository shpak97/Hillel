'use client';

import { useEffect, useState } from 'react';
import { StyledQrPanel } from '@/features/qr-code/components/StyledQrPanel';
import { toAbsoluteGuestUrl } from '@/features/qr-code/lib/guest-absolute-url';
import { ROUTES } from '@/shared/config/routes';

type QrCodePanelProps = {
  restaurantUuid: string;
  restaurantSlug: string;
  qrCodeUuid: string;
};

export function QrCodePanel({
  restaurantUuid,
  restaurantSlug,
  qrCodeUuid,
}: QrCodePanelProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(toAbsoluteGuestUrl(ROUTES.guestQr(restaurantSlug, qrCodeUuid)));
  }, [restaurantSlug, qrCodeUuid]);

  return (
    <StyledQrPanel
      restaurantUuid={restaurantUuid}
      url={url}
      filenameBase={`qr-code-${qrCodeUuid}`}
      title="QR-код"
      description="Гість побачить список меню з цього QR і обере потрібне."
    />
  );
}
