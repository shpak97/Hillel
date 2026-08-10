'use client';

import { useEffect, useState } from 'react';
import { StyledQrPanel } from '@/features/qr-code/components/StyledQrPanel';
import { toAbsoluteGuestUrl } from '@/features/qr-code/lib/guest-absolute-url';
import { ROUTES } from '@/shared/config/routes';

type TableQrPanelProps = {
  restaurantUuid: string;
  restaurantSlug: string;
  tableUuid: string;
};

export function TableQrPanel({
  restaurantUuid,
  restaurantSlug,
  tableUuid,
}: TableQrPanelProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(
      toAbsoluteGuestUrl(ROUTES.guestTable(restaurantSlug, tableUuid)),
    );
  }, [restaurantSlug, tableUuid]);

  return (
    <StyledQrPanel
      restaurantUuid={restaurantUuid}
      url={url}
      filenameBase={`table-${tableUuid}-qr`}
      title="QR-код столика"
      description="Гість одразу потрапляє на цей столик без вибору. Можна показати на екрані або скачати як PNG / SVG."
    />
  );
}
