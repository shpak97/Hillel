import { cn } from '@/shared/lib/cn';
import type { InputHTMLAttributes, ReactNode } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  labelExtra?: ReactNode;
};

export function Input({
  className,
  label,
  error,
  hint,
  labelExtra,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="w-full">
      {labelExtra ? (
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor={inputId}
            className="block text-sm font-bold text-ink-800"
          >
            {label}
          </label>
          {labelExtra}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-bold text-ink-800"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'h-14 w-full rounded-field border bg-white px-4 text-[16px] font-medium text-ink-950 outline-none transition',
          'placeholder:text-ink-400 hover:border-paper-200',
          error
            ? 'border-danger bg-danger-50 focus:border-danger focus:bg-white focus:ring-4 focus:ring-danger/15'
            : 'border-line focus:border-brand focus:ring-4 focus:ring-brand/15',
          className,
        )}
        {...props}
      />

      {error ? (
        <p className="mt-2 rounded-2xl bg-danger-50 px-3 py-2 text-[13px] font-bold leading-5 text-danger ring-1 ring-danger/10">
          {error}
        </p>
      ) : null}

      {!error && hint ? (
        <p className="mt-2 text-[13px] font-semibold leading-5 text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
