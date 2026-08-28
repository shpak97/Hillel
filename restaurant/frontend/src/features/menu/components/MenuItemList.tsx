'use client';

import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import { formatMoney } from '@/shared/lib/format-money';
import type { SupportedCurrency } from '@/shared/model/currency';
import { getRestaurantPhotoUrl } from '@/features/restaurant/lib/photo-url';
import type { MenuItem } from '@/features/menu/model/item-types';

type MenuItemListProps = {
  restaurantUuid: string;
  currency: SupportedCurrency;
  items: MenuItem[];
};

export function MenuItemList({
  restaurantUuid,
  currency,
  items,
}: MenuItemListProps) {
  return (
    <section className="rounded-[30px] bg-card shadow-[0_24px_70px_-55px_rgba(23,21,18,0.75)] ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 sm:p-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            Menu items
          </p>
          <h2 className="mt-2 text-3xl font-black text-ink-950">Позиції меню</h2>
        </div>
        <Link
          href={ROUTES.restaurantMenuItemNew(restaurantUuid)}
          className="inline-flex h-12 items-center justify-center rounded-field bg-ink-950 px-5 text-sm font-extrabold text-white transition hover:bg-brand-700"
        >
          Додати позицію
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="p-6 text-sm font-semibold text-ink-500">
          Ще немає позицій. Додайте першу — потім прив&apos;яжіть її до розділів у меню.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {items.map((item) => (
            <article
              key={item.uuid}
              className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                {item.photo ? (
                  <img
                    src={getRestaurantPhotoUrl(item.photo)}
                    alt={item.name}
                    className="size-14 rounded-3xl object-cover ring-1 ring-line"
                  />
                ) : (
                  <div className="grid size-14 place-items-center rounded-3xl bg-paper-100 text-lg font-black text-ink-500">
                    M
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-ink-950">{item.name}</h3>
                    {!item.isActive ? (
                      <span className="rounded-pill bg-paper-100 px-3 py-1 text-xs font-black text-ink-400">
                        Вимкнено
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink-500">
                    {formatMoney(item.totalPrice, currency)}
                    {item.priceOverride !== null &&
                    Math.abs(item.priceOverride - item.calculatedPrice) >= 0.005
                      ? ` (розрахунок ${formatMoney(item.calculatedPrice, currency)})`
                      : ''}
                    {' · '}продуктів: {item.products.length}
                  </p>
                </div>
              </div>
              <Link
                href={ROUTES.restaurantMenuItemEdit(restaurantUuid, item.uuid)}
                className="inline-flex h-12 items-center justify-center rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50"
              >
                Редагувати
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
