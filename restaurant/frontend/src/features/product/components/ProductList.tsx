'use client';

import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import { formatMoney } from '@/shared/lib/format-money';
import { getMeasureUnitLabel } from '@/shared/model/measure-unit';
import type { SupportedCurrency } from '@/shared/model/currency';
import { getRestaurantPhotoUrl } from '@/features/restaurant/lib/photo-url';
import type { Product } from '@/features/product/model/types';

type ProductListProps = {
  restaurantUuid: string;
  currency: SupportedCurrency;
  products: Product[];
};

export function ProductList({ restaurantUuid, currency, products }: ProductListProps) {
  return (
    <section className="rounded-[30px] bg-card shadow-[0_24px_70px_-55px_rgba(23,21,18,0.75)] ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 sm:p-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            Products
          </p>
          <h2 className="mt-2 text-3xl font-black text-ink-950">Продукти</h2>
        </div>
        <Link
          href={ROUTES.restaurantProductNew(restaurantUuid)}
          className="inline-flex h-12 items-center justify-center rounded-field bg-ink-950 px-5 text-sm font-extrabold text-white transition hover:bg-brand-700"
        >
          Додати продукт
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="p-6 text-sm font-semibold text-ink-500">
          Ще немає продуктів. Додайте перший.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {products.map((product) => (
            <article
              key={product.uuid}
              className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                {product.photo ? (
                  <img
                    src={getRestaurantPhotoUrl(product.photo)}
                    alt={product.name}
                    className="size-14 rounded-3xl object-cover ring-1 ring-line"
                  />
                ) : (
                  <div className="grid size-14 place-items-center rounded-3xl bg-paper-100 text-lg font-black text-ink-500">
                    P
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-ink-950">
                      {product.name}
                    </h3>
                    {!product.isActive ? (
                      <span className="rounded-pill bg-paper-100 px-3 py-1 text-xs font-black text-ink-400">
                        Вимкнено
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink-500">
                    {formatMoney(product.basePrice, currency)} /{' '}
                    {getMeasureUnitLabel(product.baseUnit)}
                    {' · '}інгредієнтів: {product.recipe.length}
                  </p>
                </div>
              </div>
              <Link
                href={ROUTES.restaurantProductEdit(restaurantUuid, product.uuid)}
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
