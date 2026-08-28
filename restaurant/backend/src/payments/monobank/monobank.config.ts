export function getMonobankToken(): string {
  const token = process.env.MONOBANK_TOKEN?.trim();
  if (!token) {
    throw new Error('MONOBANK_TOKEN environment variable is required');
  }
  return token;
}

/** Public base URL of this API (for Mono webhooks). */
export function getBackendPublicUrl(): string {
  const baseUrl =
    process.env.BACKEND_PUBLIC_URL?.trim() ||
    `http://localhost:${process.env.PORT?.trim() || '3101'}`;
  return baseUrl.replace(/\/$/, '');
}

export function currencyCodeToIso4217(currency: string): number {
  const map: Record<string, number> = {
    UAH: 980,
    USD: 840,
    EUR: 978,
  };
  const code = map[currency.toUpperCase()];
  if (!code) {
    throw new Error(`Unsupported currency for Monobank: ${currency}`);
  }
  return code;
}

/** Convert major units (e.g. 42.00 UAH) to minor units (4200 kopiyky). */
export function toMinorUnits(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}
