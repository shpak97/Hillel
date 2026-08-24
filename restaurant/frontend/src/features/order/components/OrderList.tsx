import { formatOrderDate, ORDER_STATUS_LABEL } from '@/features/order/lib/order-labels';
import type { AdminOrder } from '@/features/order/model/types';
import { formatMoney } from '@/shared/lib/format-money';
import { resolveRestaurantCurrency } from '@/shared/lib/resolve-currency';
import { cn } from '@/shared/lib/cn';

type OrderListProps = {
  orders: AdminOrder[];
  emptyMessage?: string;
  /** Show payment fields (invoice id). */
  showPaymentMeta?: boolean;
};

function statusClass(status: AdminOrder['status']): string {
  switch (status) {
    case 'PAID':
      return 'bg-herb-50 text-herb-700';
    case 'FAILED':
      return 'bg-danger-50 text-danger';
    case 'CANCELLED':
      return 'bg-paper-100 text-ink-400';
    default:
      return 'bg-saffron/20 text-ink-800';
  }
}

export function OrderList({
  orders,
  emptyMessage = 'Поки немає замовлень.',
  showPaymentMeta = false,
}: OrderListProps) {
  if (orders.length === 0) {
    return (
      <section className="rounded-[30px] bg-card p-6 shadow-[0_24px_70px_-55px_rgba(23,21,18,0.75)] ring-1 ring-line">
        <p className="text-sm font-semibold text-ink-500">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[30px] bg-card shadow-[0_24px_70px_-55px_rgba(23,21,18,0.75)] ring-1 ring-line">
      <div className="divide-y divide-line">
        {orders.map((order) => {
          const currency = resolveRestaurantCurrency(order.currency);
          return (
            <article key={order.uuid} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-ink-950">
                      {order.table
                        ? `Стіл ${order.table.label}`
                        : 'Без столика'}
                    </h3>
                    <span
                      className={cn(
                        'rounded-pill px-3 py-1 text-xs font-black',
                        statusClass(order.status),
                      )}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink-500">
                    {formatOrderDate(order.createdAt)}
                    {order.paidAt
                      ? ` · оплачено ${formatOrderDate(order.paidAt)}`
                      : ''}
                  </p>
                </div>
                <p className="text-xl font-black text-ink-950">
                  {formatMoney(order.totalAmount, currency)}
                </p>
              </div>

              <ul className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[16px] bg-paper-50 px-3 py-2 text-sm"
                  >
                    <span className="font-extrabold text-ink-950">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-semibold text-ink-600">
                      {formatMoney(item.unitPrice * item.quantity, currency)}
                    </span>
                  </li>
                ))}
              </ul>

              {showPaymentMeta ? (
                <p className="mt-3 break-all text-xs font-bold text-ink-400">
                  Invoice:{' '}
                  {order.monoInvoiceId ?? '—'}
                </p>
              ) : null}

              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">
                {order.uuid}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
