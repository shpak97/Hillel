/** Build absolute guest URL on the current frontend origin. */
export function toAbsoluteGuestUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (typeof window === 'undefined') {
    return normalized;
  }

  return `${window.location.origin}${normalized}`;
}
