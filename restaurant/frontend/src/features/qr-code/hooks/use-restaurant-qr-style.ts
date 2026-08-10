'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseApiError } from '@/shared/api/error-message';
import { getUploadPublicUrl } from '@/features/qr-code/lib/upload-public-url';
import {
  DEFAULT_QR_STYLE,
  normalizeQrStyleForEditor,
  type RestaurantQrStyle,
  type RestaurantQrStyleResponse,
} from '@/features/restaurant/model/qr-style';

type UseRestaurantQrStyleResult = {
  style: RestaurantQrStyle;
  logoUrl: string | null;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
};

export function useRestaurantQrStyle(
  restaurantUuid: string,
): UseRestaurantQrStyleResult {
  const [style, setStyle] = useState<RestaurantQrStyle>(DEFAULT_QR_STYLE);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/restaurants/${restaurantUuid}/qr-style`,
      );

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setStyle(DEFAULT_QR_STYLE);
        setLogoUrl(null);
        setError(
          parseApiError(body, 'Не вдалося завантажити стиль QR').message,
        );
        return;
      }

      const data = (await response.json()) as RestaurantQrStyleResponse;
      setStyle(normalizeQrStyleForEditor(data.style ?? DEFAULT_QR_STYLE));
      setLogoUrl(data.logo ? getUploadPublicUrl(data.logo) : null);
    } catch {
      setStyle(DEFAULT_QR_STYLE);
      setLogoUrl(null);
      setError('Не вдалося завантажити стиль QR');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantUuid]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { style, logoUrl, isLoading, error, reload };
}
