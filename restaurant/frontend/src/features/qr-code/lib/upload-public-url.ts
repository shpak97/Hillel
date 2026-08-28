import { API_URL } from '@/shared/config/env';

/** Resolve stored upload path (or absolute/blob URL) for <img> / qr-code-styling. */
export function getUploadPublicUrl(path: string): string {
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
