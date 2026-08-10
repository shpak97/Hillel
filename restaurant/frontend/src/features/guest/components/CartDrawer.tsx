'use client';

import { useCart } from '@/features/guest/context/CartContext';
import { getRestaurantPhotoUrl } from '@/features/restaurant/lib/photo-url';
import { formatMoney } from '@/shared/lib/format-money';
import type { SupportedCurrency } from '@/shared/model/currency';

type CartDrawerProps = {
  currency: SupportedCurrency;
  onClose: () => void;
};

export function CartDrawer({ currency, onClose }: CartDrawerProps) {
  const { items, totalPrice, setQuantity, clear } = useCart();

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
          Це попередній список без оформлення — надсилання замовлення скоро
          зʼявиться.
        </p>

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
          <button
            type="button"
            onClick={clear}
            className="mt-4 w-full rounded-field border border-line px-4 py-3 text-sm font-extrabold text-ink-700"
          >
            Очистити кошик
          </button>
        ) : null}
      </div>
    </div>
  );
}
