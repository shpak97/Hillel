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
