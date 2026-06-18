import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

type VerifyEmailStatusProps = {
  status: 'success' | 'error' | 'missing';
};

const STATUS_CONTENT = {
  success: {
    icon: '✓',
    tone: 'herb' as const,
    badge: 'Пошту підтверджено',
    title: 'Готово до входу',
    description: 'Email підтверджено. Тепер можна увійти в кабінет.',
  },
  error: {
    icon: '!',
    tone: 'danger' as const,
    badge: 'Помилка',
    title: 'Не вдалося підтвердити',
    description: 'Посилання недійсне або прострочене. Спробуйте надіслати лист ще раз.',
  },
  missing: {
    icon: '?',
    tone: 'danger' as const,
    badge: 'Токен відсутній',
    title: 'Невірне посилання',
    description: 'У посиланні немає токена підтвердження.',
  },
};

export function VerifyEmailStatus({ status }: VerifyEmailStatusProps) {
  const content = STATUS_CONTENT[status];
  const toneClasses = {
    herb: 'bg-herb-50 text-herb ring-herb/10',
    danger: 'bg-danger-50 text-danger ring-danger/10',
  };

  return (
    <div className="text-center">
      <div
        className={cn(
          'mx-auto mb-7 grid size-20 place-items-center rounded-[28px] text-3xl font-black ring-1',
          toneClasses[content.tone],
        )}
      >
        {content.icon}
      </div>

      <span
        className={cn(
          'mb-3 inline-flex items-center rounded-pill px-3 py-1 text-[13px] font-bold ring-1',
          toneClasses[content.tone],
        )}
      >
        {content.badge}
      </span>

      <h1 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[42px]">
        {content.title}
      </h1>
      <p className="mx-auto mt-4 max-w-[390px] text-[16px] leading-7 text-ink-600">
        {content.description}
      </p>

      <div className="mt-8">
        <Link
          href={ROUTES.login}
          className="inline-flex h-14 w-full items-center justify-center rounded-field bg-ink-950 px-5 text-[16px] font-extrabold text-white shadow-[0_18px_38px_-22px_rgba(23,21,18,0.95)] transition hover:-translate-y-0.5 hover:bg-herb focus:outline-none focus:ring-4 focus:ring-herb/20"
        >
          Перейти до входу
        </Link>
      </div>
    </div>
  );
}
