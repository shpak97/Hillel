import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { fetchProductsForRestaurant } from '@/features/product/api/fetch-products';
import { fetchMenuItemByUuid } from '@/features/menu/api/fetch-menu-items';
import { MenuItemForm } from '@/features/menu/components/MenuItemForm';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';
import { resolveRestaurantCurrency } from '@/shared/lib/resolve-currency';

type EditMenuItemPageProps = {
  params: Promise<{ uuid: string; itemUuid: string }>;
};

export default async function EditMenuItemPage({ params }: EditMenuItemPageProps) {
  const { uuid, itemUuid } = await params;
  const [restaurant, item, products] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchMenuItemByUuid(uuid, itemUuid),
    fetchProductsForRestaurant(uuid),
  ]);

  if (!restaurant || !item) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantMenuItems(uuid)}
      restaurantUuid={uuid}
      title="Редагувати позицію"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
            {item.name}
          </h2>
          <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
            {restaurant.title}
          </p>
        </div>
        <Link
          href={ROUTES.restaurantMenuItems(uuid)}
          className="inline-flex h-12 items-center justify-center rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50"
        >
          Назад
        </Link>
      </div>

      <MenuItemForm
        restaurantUuid={uuid}
        currency={resolveRestaurantCurrency(restaurant.currency)}
        products={products}
        item={item}
      />
    </AdminLayout>
  );
}
