import { cn } from '@/shared/lib/cn';
import type { ReactNode } from 'react';

type FormAlertProps = {
  children: ReactNode;
  className?: string;
};

export function FormAlert({ children, className }: FormAlertProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-danger-50 px-3 py-2 text-[13px] font-bold leading-5 text-danger ring-1 ring-danger/10',
        className,
      )}
    >
      {children}
    </div>
  );
}

type InfoAlertProps = {
  children: ReactNode;
  className?: string;
};

export function InfoAlert({ children, className }: InfoAlertProps) {
  return (
    <p
      className={cn(
        'rounded-2xl bg-paper-100 px-3 py-2 text-[13px] font-semibold leading-5 text-ink-600 ring-1 ring-line',
        className,
      )}
    >
      {children}
    </p>
  );
}
