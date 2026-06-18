import { cn } from '@/shared/lib/cn';
import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Textarea({
  className,
  label,
  error,
  hint,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div className="w-full">
      <label
        htmlFor={textareaId}
        className="mb-2 block text-sm font-black text-ink-800"
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'w-full resize-none rounded-field border bg-white px-4 py-4 text-[16px] font-medium leading-7 text-ink-950 outline-none transition',
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
