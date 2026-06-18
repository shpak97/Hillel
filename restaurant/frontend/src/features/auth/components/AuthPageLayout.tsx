import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { AuthHeader } from './AuthHeader';

export type AuthBackgroundVariant =
  | 'login'
  | 'registration'
  | 'error'
  | 'email-sent'
  | 'verify';

type AuthPageLayoutProps = {
  activeTab: 'login' | 'registration';
  aside: ReactNode;
  background?: AuthBackgroundVariant;
  children: ReactNode;
};

const BACKGROUNDS: Record<AuthBackgroundVariant, string> = {
  login:
    'linear-gradient(135deg, rgba(233, 80, 47, 0.08), transparent 34%), radial-gradient(circle at 82% 18%, rgba(40, 121, 93, 0.1), transparent 32%), #fbfaf7',
  registration:
    'linear-gradient(135deg, rgba(40, 121, 93, 0.1), transparent 34%), radial-gradient(circle at 84% 20%, rgba(233, 80, 47, 0.1), transparent 32%), #fbfaf7',
  error:
    'linear-gradient(135deg, rgba(217, 45, 32, 0.08), transparent 34%), radial-gradient(circle at 84% 20%, rgba(233, 80, 47, 0.1), transparent 32%), #fbfaf7',
  'email-sent':
    'linear-gradient(135deg, rgba(40, 121, 93, 0.1), transparent 34%), radial-gradient(circle at 84% 20%, rgba(242, 173, 46, 0.13), transparent 32%), #fbfaf7',
  verify:
    'linear-gradient(135deg, rgba(40, 121, 93, 0.1), transparent 34%), radial-gradient(circle at 84% 20%, rgba(242, 173, 46, 0.13), transparent 32%), #fbfaf7',
};

export function AuthPageLayout({
  activeTab,
  aside,
  background = 'login',
  children,
}: AuthPageLayoutProps) {
  return (
    <main
      className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 px-5 py-5 lg:grid-cols-[0.94fr_1.06fr] lg:px-8"
      style={{ background: BACKGROUNDS[background] }}
    >
      <section className="flex min-h-[calc(100vh-40px)] flex-col rounded-[32px] bg-card/92 p-5 shadow-[0_30px_90px_-52px_rgba(23,21,18,0.65)] ring-1 ring-line/80 sm:p-7 lg:p-8">
        <AuthHeader activeTab={activeTab} />

        <div className="flex flex-1 items-center justify-center py-12 sm:py-16">
          <div className="w-full max-w-[430px]">{children}</div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-[13px] font-semibold text-ink-500">
          <span>RestoQR owner console</span>
          <span>v0.1</span>
        </footer>
      </section>

      <aside className="hidden min-h-[calc(100vh-40px)] items-center justify-center px-8 lg:flex">
        {aside}
      </aside>
    </main>
  );
}

type AuthHeroProps = {
  badge: ReactNode;
  title: string;
  description: ReactNode;
  centered?: boolean;
};

export function AuthHero({
  badge,
  title,
  description,
  centered = false,
}: AuthHeroProps) {
  return (
    <div className={cn('mb-8', centered && 'text-center')}>
      <div className={cn('mb-3', centered && 'flex justify-center')}>{badge}</div>
      <h1 className="text-[34px] font-black leading-[1.05] tracking-normal text-ink-950 sm:text-[42px]">
        {title}
      </h1>
      <p
        className={cn(
          'mt-4 text-[16px] leading-7 text-ink-600',
          centered ? 'mx-auto max-w-[390px]' : 'max-w-sm',
        )}
      >
        {description}
      </p>
    </div>
  );
}

export function AuthBadge({
  children,
  tone = 'brand',
}: {
  children: ReactNode;
  tone?: 'brand' | 'herb' | 'danger';
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700 ring-brand/10',
    herb: 'bg-herb-50 text-herb ring-herb/10',
    danger: 'bg-danger-50 text-danger ring-danger/10',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-3 py-1 text-[13px] font-bold ring-1',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function AuthFooterLink({
  prompt,
  linkText,
  href,
}: {
  prompt: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="mt-7 text-center text-[15px] font-medium text-ink-500">
      {prompt}{' '}
      <Link
        href={href}
        className="font-extrabold text-ink-950 underline-offset-4 hover:underline"
      >
        {linkText}
      </Link>
    </p>
  );
}
