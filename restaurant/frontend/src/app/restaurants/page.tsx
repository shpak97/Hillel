import Link from 'next/link';
import { fetchRestaurantsForUser } from '@/features/restaurant/api/fetch-restaurants-for-user';
import { RestaurantList } from '@/features/restaurant/components/RestaurantList';
import {
  StatCard,
  StatsGrid,
} from '@/features/restaurant/components/StatsGrid';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

export default async function RestaurantsPage() {
  const restaurants = await fetchRestaurantsForUser();
  const hasRestaurants = restaurants.length > 0;

  return (
    <AdminLayout
      activeHref={ROUTES.restaurants}
      title="Ресторани"
      headerAction={
        <Link
          href={ROUTES.restaurantsNew}
          className="hidden rounded-pill bg-ink-950 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-700 sm:inline-flex"
        >
          Створити ресторан
        </Link>
      }
      sidebarFooter={
        !hasRestaurants ? (
          <Link
            href={ROUTES.home}
            className="block rounded-[24px] bg-paper-50 p-4 text-sm font-bold leading-5 text-ink-600 ring-1 ring-line transition hover:bg-white hover:text-ink-950"
          >
            Повернутися до дашборду
          </Link>
        ) : null
      }
    >
      <StatsGrid>
        <StatCard label="Ресторани" value={restaurants.length} />
        <StatCard label="Меню" value={0} />
        <StatCard label="QR столи" value={0} />
      </StatsGrid>

      {hasRestaurants ? (
        <RestaurantList restaurants={restaurants} />
      ) : (
        <section className="rounded-[30px] bg-card p-8 text-center ring-1 ring-line sm:p-10">
          <p className="mb-4 inline-flex rounded-pill bg-brand-50 px-3 py-1 text-sm font-black text-brand-700 ring-1 ring-brand/10">
            Поки порожньо
          </p>
          <h2 className="text-3xl font-black text-ink-950">Ресторанів ще немає</h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] font-semibold leading-7 text-ink-600">
            Створіть перший ресторан на дашборді, щоб з&apos;явився список і
            статистика.
          </p>
          <Link
            href={ROUTES.home}
            className="mt-8 inline-flex h-14 items-center justify-center rounded-field bg-ink-950 px-6 text-[15px] font-extrabold text-white transition hover:bg-brand-700"
          >
            Перейти до дашборду
          </Link>
        </section>
      )}
    </AdminLayout>
  );
}
