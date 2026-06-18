import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { fetchRestaurantHours } from '@/features/restaurant/api/fetch-restaurant-hours';
import { RestaurantEditForm } from '@/features/restaurant/components/RestaurantEditForm';
import { RestaurantHoursForm } from '@/features/restaurant/components/RestaurantHoursForm';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

type RestaurantEditPageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function RestaurantEditPage({
  params,
}: RestaurantEditPageProps) {
  const { uuid } = await params;
  const [restaurant, hours] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchRestaurantHours(uuid),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurants}
      restaurantUuid={uuid}
      title="Редагування ресторану"
      headerAction={
        <Link
          href={ROUTES.restaurants}
          className="hidden rounded-pill border border-line bg-white px-4 py-2 text-sm font-bold text-ink-600 transition hover:border-brand/30 hover:bg-brand-50 hover:text-brand-700 sm:inline-flex"
        >
          До списку
        </Link>
      }
      sidebarFooter={
        <div className="rounded-[24px] bg-danger-50 p-4 ring-1 ring-danger/10">
          <p className="text-[12px] font-black uppercase tracking-[0.12em] text-danger">
            Danger zone
          </p>
          <p className="mt-2 text-sm font-bold leading-5 text-ink-600">
            Вимкнення приховує ресторан із публічного меню.
          </p>
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className={`inline-flex rounded-pill px-3 py-1 text-sm font-black ring-1 ${
              restaurant.isActive
                ? 'bg-herb-50 text-herb ring-herb/10'
                : 'bg-paper-100 text-ink-500 ring-line'
            }`}
          >
            {restaurant.isActive ? 'Active restaurant' : 'Disabled restaurant'}
          </p>
          <h2 className="mt-4 text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
            {restaurant.title}
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] font-semibold leading-7 text-ink-600">
            Редагування полів ресторану та керування активністю.
          </p>
        </div>
        <Link
          href={ROUTES.restaurants}
          className="inline-flex h-12 items-center justify-center rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50"
        >
          Назад
        </Link>
      </div>

      <RestaurantEditForm restaurant={restaurant} />

      <div className="mt-6">
        <RestaurantHoursForm restaurantUuid={restaurant.uuid} initialHours={hours} />
      </div>
    </AdminLayout>
  );
}
