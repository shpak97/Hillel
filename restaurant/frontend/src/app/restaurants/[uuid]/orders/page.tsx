import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchOrdersForRestaurant } from '@/features/order/api/fetch-orders';
import { OrderList } from '@/features/order/components/OrderList';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

type OrdersPageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function RestaurantOrdersPage({ params }: OrdersPageProps) {
  const { uuid } = await params;
  const [restaurant, orders] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchOrdersForRestaurant(uuid),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantOrders(uuid)}
      restaurantUuid={uuid}
      title="Замовлення"
      headerAction={
        <Link
          href={ROUTES.restaurantPayments(uuid)}
          className="hidden rounded-pill border border-line bg-white px-4 py-2 text-sm font-bold text-ink-600 transition hover:border-brand/30 hover:bg-brand-50 hover:text-brand-700 sm:inline-flex"
        >
          Оплати
        </Link>
      }
    >
      <div className="mb-6">
        <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
          Замовлення
        </h2>
        <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
          {restaurant.title}. Усі гостьові замовлення зі складом позицій.
        </p>
      </div>

      <OrderList
        orders={orders}
        emptyMessage="Ще немає замовлень. Вони зʼявляться після оплати з гостьового меню."
      />
    </AdminLayout>
  );
}
