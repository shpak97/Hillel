import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { fetchMenuItemsForRestaurant } from '@/features/menu/api/fetch-menu-items';
import { MenuItemList } from '@/features/menu/components/MenuItemList';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';
import { resolveRestaurantCurrency } from '@/shared/lib/resolve-currency';

type MenuItemsPageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function RestaurantMenuItemsPage({
  params,
}: MenuItemsPageProps) {
  const { uuid } = await params;
  const [restaurant, items] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchMenuItemsForRestaurant(uuid),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantMenuItems(uuid)}
      restaurantUuid={uuid}
      title="Позиції меню"
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
          Каталог позицій для QR-меню. Додавайте їх до розділів у налаштуваннях меню.
        </p>
      </div>

      <MenuItemList
        restaurantUuid={uuid}
        currency={resolveRestaurantCurrency(restaurant.currency)}
        items={items}
      />
    </AdminLayout>
  );
}
