import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { fetchTablesForRestaurant } from '@/features/table/api/fetch-tables';
import { TableList } from '@/features/table/components/TableList';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

type TablesPageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function RestaurantTablesPage({ params }: TablesPageProps) {
  const { uuid } = await params;
  const [restaurant, tables] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchTablesForRestaurant(uuid),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantTables(uuid)}
      restaurantUuid={uuid}
      title="Столики"
      headerAction={
        <Link
          href={ROUTES.restaurantEdit(uuid)}
          className="hidden rounded-pill border border-line bg-white px-4 py-2 text-sm font-bold text-ink-600 transition hover:border-brand/30 hover:bg-brand-50 hover:text-brand-700 sm:inline-flex"
        >
          Ресторан
        </Link>
      }
    >
      <div className="mb-6">
        <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
          {restaurant.title}
        </h2>
        <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
          Керування столиками та зонами.
        </p>
      </div>

      <TableList restaurantUuid={uuid} tables={tables} />
    </AdminLayout>
  );
}
