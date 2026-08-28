import {
  CURRENCY_LABELS,
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from '@/shared/model/currency';

type CurrencySelectProps = {
  value: SupportedCurrency;
  onChange: (value: SupportedCurrency) => void;
  label?: string;
  hint?: string;
};

export function CurrencySelect({
  value,
  onChange,
  label = 'Валюта',
  hint,
}: CurrencySelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-ink-800">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SupportedCurrency)}
        className="h-12 w-full rounded-field border border-line bg-white px-3 text-sm font-medium text-ink-950"
      >
        {SUPPORTED_CURRENCIES.map((currency) => (
          <option key={currency} value={currency}>
            {CURRENCY_LABELS[currency]}
          </option>
        ))}
      </select>
      {hint ? (
        <p className="mt-2 text-sm font-semibold text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}
