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

export function toMoneyNumber(
  value: { toNumber(): number } | number | string,
): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : value.toNumber();

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.round(parsed * 100) / 100;
}
