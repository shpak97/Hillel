import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import {
  fetchMenuByUuid,
  fetchMenuHours,
} from '@/features/menu/api/fetch-menus';
import { fetchTablesForRestaurant } from '@/features/table/api/fetch-tables';
import { MenuForm } from '@/features/menu/components/MenuForm';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

type EditMenuPageProps = {
  params: Promise<{ uuid: string; menuUuid: string }>;
};

export default async function EditMenuPage({ params }: EditMenuPageProps) {
  const { uuid, menuUuid } = await params;
  const [restaurant, menu, tables, hours] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchMenuByUuid(uuid, menuUuid),
    fetchTablesForRestaurant(uuid),
    fetchMenuHours(uuid, menuUuid),
  ]);

  if (!restaurant || !menu) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantMenus(uuid)}
      restaurantUuid={uuid}
      title="Редагування меню"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
            {menu.name}
          </h2>
          <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
            {restaurant.title}
          </p>
        </div>
        <Link
          href={ROUTES.restaurantMenus(uuid)}
          className="inline-flex h-12 items-center justify-center rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50"
        >
          Назад
        </Link>
      </div>

      <MenuForm
        restaurantUuid={uuid}
        menu={menu}
        tables={tables}
        initialHours={hours}
      />
    </AdminLayout>
  );
}
