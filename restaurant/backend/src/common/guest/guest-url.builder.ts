import { getFrontendPublicUrl } from 'src/common/config/frontend-public.url';

export type GuestMenuUrlQuery = {
  restaurantSlug: string;
  menuUuid: string;
  selectTable: boolean;
};

export type GuestTableUrlQuery = {
  restaurantSlug: string;
  tableUuid: string;
};

export type GuestQrUrlQuery = {
  restaurantSlug: string;
  qrUuid: string;
};

export function buildGuestMenuUrl(query: GuestMenuUrlQuery): string {
  const baseUrl = getFrontendPublicUrl();
  const path = `/r/${encodeURIComponent(query.restaurantSlug)}/m/${encodeURIComponent(query.menuUuid)}`;
  const params = new URLSearchParams({
    selectTable: query.selectTable ? '1' : '0',
  });

  return `${baseUrl}${path}?${params.toString()}`;
}

export function buildGuestTableUrl(query: GuestTableUrlQuery): string {
  const baseUrl = getFrontendPublicUrl();
  const path = `/r/${encodeURIComponent(query.restaurantSlug)}/t/${encodeURIComponent(query.tableUuid)}`;

  return `${baseUrl}${path}`;
}

export function buildGuestQrUrl(query: GuestQrUrlQuery): string {
  const baseUrl = getFrontendPublicUrl();
  const path = `/r/${encodeURIComponent(query.restaurantSlug)}/q/${encodeURIComponent(query.qrUuid)}`;

  return `${baseUrl}${path}`;
}
