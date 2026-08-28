import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

type AuthHeaderProps = {
  activeTab: 'login' | 'registration';
};

export function AuthHeader({ activeTab }: AuthHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Link
        href={ROUTES.home}
        className="group inline-flex items-center gap-3 rounded-pill focus:outline-none focus:ring-4 focus:ring-brand/20"
      >
        <span className="grid size-11 place-items-center rounded-2xl bg-ink-950 text-[17px] font-black text-white shadow-[0_16px_34px_-22px_rgba(23,21,18,0.9)]">
          RQ
        </span>
        <span>
          <span className="block text-[15px] font-bold leading-tight text-ink-950">
            RestoQR
          </span>
          <span className="block text-[12px] font-medium leading-tight text-ink-400">
            Owner console
          </span>
        </span>
      </Link>

      <nav className="hidden items-center gap-2 rounded-pill border border-line bg-paper-50 p-1 text-sm font-semibold text-ink-600 sm:flex">
        <Link
          href={ROUTES.login}
          className={cn(
            'rounded-pill px-4 py-2 transition',
            activeTab === 'login'
              ? 'bg-white text-ink-950 shadow-sm'
              : 'hover:bg-white hover:text-ink-950',
          )}
        >
          Вхід
        </Link>
        <Link
          href={ROUTES.registration}
          className={cn(
            'rounded-pill px-4 py-2 transition',
            activeTab === 'registration'
              ? 'bg-white text-ink-950 shadow-sm'
              : 'hover:bg-white hover:text-ink-950',
          )}
        >
          Реєстрація
        </Link>
      </nav>
    </header>
  );
}
