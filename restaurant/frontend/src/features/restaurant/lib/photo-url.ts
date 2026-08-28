import { API_URL } from '@/shared/config/env';

export function getRestaurantPhotoUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getPhotoFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] ?? path;
}
