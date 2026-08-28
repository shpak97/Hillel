import Link from 'next/link';
import type { ReactNode } from 'react';
import { ROUTES } from '@/shared/config/routes';

type AdminHeaderProps = {
  title: string;
  action?: ReactNode;
};

export function AdminHeader({ title, action }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-line bg-paper-50/90 px-5 backdrop-blur-xl lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={ROUTES.home}
          className="grid size-10 place-items-center rounded-2xl bg-ink-950 text-[15px] font-black text-white lg:hidden"
        >
          RQ
        </Link>
        <div className="min-w-0">
          <p className="text-[13px] font-black uppercase tracking-[0.14em] text-ink-400">
            Admin
          </p>
          <h1 className="truncate text-2xl font-black text-ink-950">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {action}
        <div className="grid size-10 place-items-center rounded-2xl bg-white text-sm font-black text-ink-950 ring-1 ring-line">
          OR
        </div>
      </div>
    </header>
  );
}
