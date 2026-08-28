'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/features/guest/context/CartContext';
import { API_URL } from '@/shared/config/env';
import { formatMoney } from '@/shared/lib/format-money';
import { resolveRestaurantCurrency } from '@/shared/lib/resolve-currency';

type OrderStatusPayload = {
  orderUuid: string;
  status: string;
  currency: string;
  totalAmount: number;
  paidAt: string | null;
};

type GuestOrderResultClientProps = {
  slug: string;
  orderUuid: string;
};

export function GuestOrderResultClient({
  slug,
  orderUuid,
}: GuestOrderResultClientProps) {
  const router = useRouter();
  const { clear } = useCart();
  const clearedRef = useRef(false);
  const [order, setOrder] = useState<OrderStatusPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    async function load() {
      attempts += 1;
      try {
        const response = await fetch(
          `${API_URL}/guest/r/${encodeURIComponent(slug)}/orders/${encodeURIComponent(orderUuid)}`,
          { cache: 'no-store' },
        );
        if (!response.ok) {
          if (!cancelled) {
            setError('Не вдалося отримати статус замовлення');
          }
          return;
        }

        const data = (await response.json()) as OrderStatusPayload;
        if (cancelled) {
          return;
        }

        setOrder(data);
        setError('');

        if (data.status === 'PAID' && !clearedRef.current) {
          clearedRef.current = true;
          clear();
        }

        if (data.status === 'PENDING' && attempts < 20 && !cancelled) {
          timer = window.setTimeout(() => {
            void load();
          }, 2000);
        }
      } catch {
        if (!cancelled) {
          setError('Не вдалося отримати статус замовлення');
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [slug, orderUuid, clear]);

  const currency = resolveRestaurantCurrency(order?.currency);
  const status = order?.status ?? 'PENDING';

  return (
    <section className="rounded-[28px] border border-line bg-white p-6 shadow-[0_18px_40px_-32px_rgba(23,21,18,0.55)] sm:p-8">
      <h1 className="text-[28px] font-black leading-tight text-ink-950">
        {status === 'PAID'
          ? 'Оплату отримано'
          : status === 'FAILED'
            ? 'Оплата не пройшла'
            : 'Очікуємо підтвердження'}
      </h1>
      <p className="mt-3 text-sm font-semibold leading-6 text-ink-600">
        {status === 'PAID'
          ? 'Дякуємо! Замовлення оплачене.'
          : status === 'FAILED'
            ? 'Спробуйте ще раз з кошика або зверніться до персоналу.'
            : 'Якщо ви щойно сплатили, статус оновиться за кілька секунд.'}
      </p>

      {error ? (
        <p className="mt-4 rounded-field border border-danger/20 bg-danger-50 px-4 py-3 text-sm font-bold text-danger">
          {error}
        </p>
      ) : null}

      {order ? (
        <div className="mt-6 rounded-[22px] border border-line bg-paper-50 px-4 py-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-400">
            Сума
          </p>
          <p className="mt-1 text-2xl font-black text-ink-950">
            {formatMoney(order.totalAmount, currency)}
          </p>
          <p className="mt-3 text-xs font-bold text-ink-400">
            № {order.orderUuid}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => router.back()}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-field bg-ink-950 px-5 text-sm font-extrabold text-white"
      >
        Назад до меню
      </button>
    </section>
  );
}
