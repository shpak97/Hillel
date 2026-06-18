import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { getAdminNavItems, ROUTES } from '@/shared/config/routes';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

type AdminSidebarProps = {
  activeHref: string;
  footer?: React.ReactNode;
  restaurantUuid?: string;
};

export function AdminSidebar({
  activeHref,
  footer,
  restaurantUuid,
}: AdminSidebarProps) {
  const navItems = getAdminNavItems(restaurantUuid);
  return (
    <aside className="hidden border-r border-line bg-card lg:flex lg:min-h-screen lg:w-[268px] lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-line px-6">
        <Link
          href={ROUTES.home}
          className="grid size-11 place-items-center rounded-2xl bg-ink-950 text-[17px] font-black text-white"
        >
          RQ
        </Link>
        <div>
          <p className="text-[15px] font-black leading-tight text-ink-950">
            RestoQR
          </p>
          <p className="text-[12px] font-semibold leading-tight text-ink-400">
            Admin console
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-5 text-[14px] font-bold text-ink-600">
        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <span
                key={item.label}
                className="rounded-2xl px-4 py-3 text-ink-400"
              >
                {item.label}
              </span>
            );
          }

          const isActive = item.href === activeHref;

          return (
            <Link
              key={item.label}
              href={item.href!}
              className={cn(
                'rounded-2xl px-4 py-3 transition',
                isActive
                  ? item.href === ROUTES.restaurants
                    ? 'bg-brand-50 text-brand-700'
                    : 'bg-paper-100 text-ink-950'
                  : 'hover:bg-paper-50 hover:text-ink-950',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4 space-y-3">
        {footer}
        <LogoutButton className="w-full" />
      </div>
    </aside>
  );
}
