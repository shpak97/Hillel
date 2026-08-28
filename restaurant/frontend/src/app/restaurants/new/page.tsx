import Link from 'next/link';
import { RestaurantCreateForm } from '@/features/restaurant/components/RestaurantCreateForm';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

export default function RestaurantCreatePage() {
  return (
    <AdminLayout
      activeHref={ROUTES.restaurants}
      title="Створення ресторану"
      headerAction={
        <Link
          href={ROUTES.restaurants}
          className="hidden rounded-pill border border-line bg-white px-4 py-2 text-sm font-bold text-ink-600 transition hover:border-brand/30 hover:bg-brand-50 hover:text-brand-700 sm:inline-flex"
        >
          До списку
        </Link>
      }
      sidebarFooter={
        <div className="rounded-[24px] bg-paper-50 p-4 ring-1 ring-line">
          <p className="text-[12px] font-black uppercase tracking-[0.12em] text-brand-700">
            Form
          </p>
          <p className="mt-2 text-sm font-bold leading-5 text-ink-600">
            Після створення ресторану відкриються меню, столи та QR-коди.
          </p>
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex rounded-pill bg-brand-50 px-3 py-1 text-sm font-black text-brand-700 ring-1 ring-brand/10">
            Restaurant model
          </p>
          <h2 className="mt-4 text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
            Дані ресторану
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] font-semibold leading-7 text-ink-600">
            Форма збирає поля з моделі ресторану. Системні значення
            генеруються автоматично або беруться з поточного користувача.
          </p>
        </div>
        <Link
          href={ROUTES.home}
          className="inline-flex h-12 items-center justify-center rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50"
        >
          Назад
        </Link>
      </div>

      <RestaurantCreateForm />
    </AdminLayout>
  );
}
