'use client';

import { useEffect, useState } from 'react';
import { StyledQrPanel } from '@/features/qr-code/components/StyledQrPanel';
import { toAbsoluteGuestUrl } from '@/features/qr-code/lib/guest-absolute-url';
import { ROUTES } from '@/shared/config/routes';

type MenuQrPanelProps = {
  restaurantUuid: string;
  restaurantSlug: string;
  menuUuid: string;
};

export function MenuQrPanel({
  restaurantUuid,
  restaurantSlug,
  menuUuid,
}: MenuQrPanelProps) {
  const [selectTable, setSelectTable] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(
      toAbsoluteGuestUrl(
        ROUTES.guestMenu(restaurantSlug, menuUuid, selectTable),
      ),
    );
  }, [restaurantSlug, menuUuid, selectTable]);

  return (
    <StyledQrPanel
      restaurantUuid={restaurantUuid}
      url={url}
      filenameBase={`menu-${menuUuid}-qr`}
      title="QR-код меню"
      description="Гість відкриє це меню за посиланням з QR. Можна показати на екрані або скачати як PNG / SVG."
      headerExtra={
        <label className="inline-flex cursor-pointer items-center gap-3 rounded-field border border-line bg-paper-50 px-4 py-3">
          <input
            type="checkbox"
            checked={selectTable}
            onChange={(event) => setSelectTable(event.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          <span className="text-sm font-extrabold text-ink-950">
            Гість обирає столик
          </span>
        </label>
      }
    />
  );
}
