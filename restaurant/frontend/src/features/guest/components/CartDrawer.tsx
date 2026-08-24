'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/features/guest/context/CartContext';
import { getRestaurantPhotoUrl } from '@/features/restaurant/lib/photo-url';
import { parseApiError } from '@/shared/api/error-message';
import { API_URL } from '@/shared/config/env';
import { formatMoney } from '@/shared/lib/format-money';
import type { SupportedCurrency } from '@/shared/model/currency';

type CartDrawerProps = {
  currency: SupportedCurrency;
  onClose: () => void;
};

type CheckoutResponse = {
  orderUuid: string;
  pageUrl: string;
};

export function CartDrawer({ currency, onClose }: CartDrawerProps) {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { items, totalPrice, setQuantity, clear } = useCart();
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');

  async function handlePay() {
    if (!slug || items.length === 0 || isPaying) {
      return;
    }

    setIsPaying(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/guest/r/${encodeURIComponent(slug)}/orders`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
            })),
          }),
        },
      );

      const body: unknown = await response.json().catch(() => undefined);
      if (!response.ok) {
        setError(parseApiError(body, 'Не вдалося створити оплату').message);
        return;
      }

      const data = body as CheckoutResponse;
      if (!data.pageUrl) {
        setError('Не отримано посилання на оплату');
        return;
      }

      // Keep cart until payment result page confirms success.
      window.location.assign(data.pageUrl);
    } catch {
      setError('Не вдалося створити оплату');
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-white p-6 sm:rounded-[28px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-ink-950">Ваш вибір</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-extrabold text-ink-400"
          >
            Закрити
          </button>
        </div>
        <p className="mt-2 text-sm font-semibold text-ink-500">
          Перевірте замовлення і перейдіть до оплати через monobank.
        </p>

        {error ? (
          <p className="mt-4 rounded-field border border-danger/20 bg-danger-50 px-4 py-3 text-sm font-bold text-danger">
            {error}
          </p>
        ) : null}

        {items.length === 0 ? (
          <p className="mt-6 rounded-field border border-dashed border-line bg-paper-50 px-4 py-3 text-sm font-bold text-ink-700">
            Кошик порожній.
          </p>
        ) : (
          <div className="mt-6 space-y-2">
            {items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex items-center gap-3 rounded-[18px] border border-line p-3"
              >
                {item.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getRestaurantPhotoUrl(item.photo)}
                    alt={item.name}
                    className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-line"
                  />
                ) : (
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-paper-100 text-sm font-black text-ink-500">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-black text-ink-950">{item.name}</p>
                  <p className="text-sm font-semibold text-ink-500">
                    {formatMoney(item.unitPrice, currency)} / шт
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(item.menuItemId, item.quantity - 1)
                    }
                    aria-label="Зменшити кількість"
                    className="grid size-7 place-items-center rounded-full bg-paper-100 text-lg font-black text-ink-950"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-sm font-black text-ink-950">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(item.menuItemId, item.quantity + 1)
                    }
                    aria-label="Збільшити кількість"
                    className="grid size-7 place-items-center rounded-full bg-ink-950 text-lg font-black text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <span className="text-base font-extrabold text-ink-950">Разом</span>
          <span className="text-lg font-black text-ink-950">
            {formatMoney(totalPrice, currency)}
          </span>
        </div>

        {items.length > 0 ? (
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              disabled={isPaying}
              onClick={() => void handlePay()}
              className="w-full rounded-field bg-ink-950 px-4 py-3.5 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {isPaying ? 'Створюємо оплату…' : 'Оплатити'}
            </button>
            <button
              type="button"
              disabled={isPaying}
              onClick={clear}
              className="w-full rounded-field border border-line px-4 py-3 text-sm font-extrabold text-ink-700 disabled:opacity-60"
            >
              Очистити кошик
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
