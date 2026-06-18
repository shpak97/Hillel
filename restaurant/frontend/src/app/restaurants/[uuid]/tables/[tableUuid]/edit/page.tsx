import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { fetchMenusForRestaurant } from '@/features/menu/api/fetch-menus';
import { fetchTableByUuid } from '@/features/table/api/fetch-tables';
import { TableForm } from '@/features/table/components/TableForm';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

type EditTablePageProps = {
  params: Promise<{ uuid: string; tableUuid: string }>;
};

export default async function EditTablePage({ params }: EditTablePageProps) {
  const { uuid, tableUuid } = await params;
  const [restaurant, table, menus] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchTableByUuid(uuid, tableUuid),
    fetchMenusForRestaurant(uuid),
  ]);

  if (!restaurant || !table) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantTables(uuid)}
      restaurantUuid={uuid}
      title="Редагування столика"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
            {table.label}
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

      <TableForm restaurantUuid={uuid} table={table} menus={menus} />
    </AdminLayout>
  );
}
