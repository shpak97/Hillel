import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchOrdersForRestaurant } from '@/features/order/api/fetch-orders';
import { OrderList } from '@/features/order/components/OrderList';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';
import { formatMoney } from '@/shared/lib/format-money';
import { resolveRestaurantCurrency } from '@/shared/lib/resolve-currency';

type PaymentsPageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function RestaurantPaymentsPage({
  params,
}: PaymentsPageProps) {
  const { uuid } = await params;
  const [restaurant, orders] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchOrdersForRestaurant(uuid, ['PAID', 'FAILED']),
  ]);

  if (!restaurant) {
    notFound();
  }

  const currency = resolveRestaurantCurrency(restaurant.currency);
  const paidOrders = orders.filter((order) => order.status === 'PAID');
  const failedCount = orders.filter((order) => order.status === 'FAILED').length;
  const paidTotal = paidOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantPayments(uuid)}
      restaurantUuid={uuid}
      title="Оплати"
      headerAction={
        <Link
          href={ROUTES.restaurantOrders(uuid)}
          className="hidden rounded-pill border border-line bg-white px-4 py-2 text-sm font-bold text-ink-600 transition hover:border-brand/30 hover:bg-brand-50 hover:text-brand-700 sm:inline-flex"
        >
          Замовлення
        </Link>
      }
    >
      <div className="mb-6">
        <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
          Оплати
        </h2>
        <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
          {restaurant.title}. Успішні та неуспішні платежі Monobank.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[24px] border border-line bg-white p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-400">
            Оплачено
          </p>
          <p className="mt-2 text-2xl font-black text-ink-950">
            {formatMoney(paidTotal, currency)}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink-500">
            {paidOrders.length} платежів
          </p>
        </div>
        <div className="rounded-[24px] border border-line bg-white p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-400">
            Не пройшли
          </p>
          <p className="mt-2 text-2xl font-black text-ink-950">{failedCount}</p>
          <p className="mt-1 text-sm font-semibold text-ink-500">
            зі статусом FAILED
          </p>
        </div>
      </div>

      <OrderList
        orders={orders}
        showPaymentMeta
        emptyMessage="Ще немає платежів. Вони зʼявляться після спроб оплати з кошика."
      />
    </AdminLayout>
  );
}
