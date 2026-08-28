import { cn } from '@/shared/lib/cn';
import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'success';
  fullWidth?: boolean;
};

export function Button({
  className,
  variant = 'primary',
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex h-14 items-center justify-center rounded-field px-5 text-[16px] font-extrabold transition',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
        'focus:outline-none focus:ring-4',
        variant === 'primary' &&
          'bg-ink-950 text-white shadow-[0_18px_38px_-22px_rgba(23,21,18,0.95)] hover:-translate-y-0.5 hover:bg-brand-700 focus:ring-brand/20',
        variant === 'secondary' &&
          'border border-line bg-white text-ink-950 shadow-[0_16px_36px_-28px_rgba(23,21,18,0.8)] hover:-translate-y-0.5 hover:border-herb/30 hover:bg-herb-50 focus:ring-brand/20',
        variant === 'success' &&
          'bg-ink-950 text-white shadow-[0_18px_38px_-22px_rgba(23,21,18,0.95)] hover:-translate-y-0.5 hover:bg-herb focus:ring-herb/20',
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
