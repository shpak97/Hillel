import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { fetchMenusForRestaurant } from '@/features/menu/api/fetch-menus';
import { TableForm } from '@/features/table/components/TableForm';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

type NewTablePageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function NewTablePage({ params }: NewTablePageProps) {
  const { uuid } = await params;
  const [restaurant, menus] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchMenusForRestaurant(uuid),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantTables(uuid)}
      restaurantUuid={uuid}
      title="Новий столик"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
            Новий столик
          </h2>
          <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
            {restaurant.title}
          </p>
        </div>
        <Link
          href={ROUTES.restaurantTables(uuid)}
          className="inline-flex h-12 items-center justify-center rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50"
        >
          Назад
        </Link>
      </div>

      <TableForm restaurantUuid={uuid} menus={menus} />
    </AdminLayout>
  );
}
