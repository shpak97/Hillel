import type { SupportedCurrency } from '@/shared/model/currency';
import { CURRENCY_DISPLAY } from '@/shared/model/currency';

function formatAmount(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;

  if (Number.isInteger(rounded)) {
    return String(rounded);
  }

  return rounded.toFixed(2).replace('.', ',');
}

export function parseMoneyInput(value: string | number): number {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return Number.NaN;
    }

    return Math.round(value * 100) / 100;
  }

  const normalized = value.trim().replace(',', '.');
  if (!normalized) {
    return Number.NaN;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return Number.NaN;
  }

  return Math.round(parsed * 100) / 100;
}

export function formatMoneyInput(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export function formatMoney(
  amount: number,
  currency: SupportedCurrency,
): string {
  return `${formatAmount(amount)} ${CURRENCY_DISPLAY[currency]}`;
}
