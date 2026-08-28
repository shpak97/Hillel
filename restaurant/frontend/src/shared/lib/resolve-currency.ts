import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from '@/shared/model/currency';

export function resolveRestaurantCurrency(
  currency: string | null | undefined,
): SupportedCurrency {
  if (
    currency &&
    SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)
  ) {
    return currency as SupportedCurrency;
  }

  return DEFAULT_CURRENCY;
}
