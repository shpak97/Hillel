import {
  MEASURE_UNITS,
  MEASURE_UNIT_LABELS,
  type MeasureUnit,
} from '@/shared/model/measure-unit';

type MeasureUnitSelectProps = {
  value: MeasureUnit;
  onChange: (value: MeasureUnit) => void;
  label?: string;
  hint?: string;
};

export function MeasureUnitSelect({
  value,
  onChange,
  label = 'Базова одиниця',
  hint,
}: MeasureUnitSelectProps) {
  return (
    <div className="w-full">
      <label
        htmlFor="baseUnit"
        className="mb-2 block text-sm font-black text-ink-800"
      >
        {label}
      </label>
      <select
        id="baseUnit"
        name="baseUnit"
        value={value}
        onChange={(event) => onChange(event.target.value as MeasureUnit)}
        className="h-14 w-full rounded-field border border-line bg-white px-4 text-[16px] font-medium text-ink-950 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
      >
        {MEASURE_UNITS.map((unit) => (
          <option key={unit} value={unit}>
            {MEASURE_UNIT_LABELS[unit]}
          </option>
        ))}
      </select>
      {hint ? (
        <p className="mt-2 text-[13px] font-semibold leading-5 text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
