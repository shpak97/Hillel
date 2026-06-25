export const SUPPORTED_CURRENCIES = [
  'UAH',
  'USD',
  'EUR',
  'PLN',
  'GBP',
  'CZK',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrency = 'UAH';

export const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  UAH: 'Гривня (UAH)',
  USD: 'Долар США (USD)',
  EUR: 'Євро (EUR)',
  PLN: 'Злотий (PLN)',
  GBP: 'Фунт (GBP)',
  CZK: 'Корона (CZK)',
};

export const CURRENCY_DISPLAY: Record<SupportedCurrency, string> = {
  UAH: 'грн',
  USD: 'USD',
  EUR: 'EUR',
  PLN: 'PLN',
  GBP: 'GBP',
  CZK: 'CZK',
};
