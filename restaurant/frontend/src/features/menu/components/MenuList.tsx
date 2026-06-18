'use client';

import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import { getRestaurantPhotoUrl } from '@/features/restaurant/lib/photo-url';
import type { Menu } from '@/features/menu/model/types';

type MenuListProps = {
  restaurantUuid: string;
  menus: Menu[];
};

export function MenuList({ restaurantUuid, menus }: MenuListProps) {
  return (
    <section className="rounded-[30px] bg-card shadow-[0_24px_70px_-55px_rgba(23,21,18,0.75)] ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 sm:p-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            Menus
          </p>
          <h2 className="mt-2 text-3xl font-black text-ink-950">Меню</h2>
        </div>
        <Link
          href={ROUTES.restaurantMenuNew(restaurantUuid)}
          className="inline-flex h-12 items-center justify-center rounded-field bg-ink-950 px-5 text-sm font-extrabold text-white transition hover:bg-brand-700"
        >
          Додати меню
        </Link>
      </div>

      {menus.length === 0 ? (
        <p className="p-6 text-sm font-semibold text-ink-500">
          Ще немає меню. Додайте перше.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {menus.map((menu) => (
            <article
              key={menu.uuid}
              className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                {menu.photo ? (
                  <img
                    src={getRestaurantPhotoUrl(menu.photo)}
                    alt={menu.name}
                    className="size-14 rounded-3xl object-cover ring-1 ring-line"
                  />
                ) : (
                  <div className="grid size-14 place-items-center rounded-3xl bg-paper-100 text-lg font-black text-ink-500">
                    M
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-ink-950">
                      {menu.name}
                    </h3>
                    {!menu.isActive ? (
                      <span className="rounded-pill bg-paper-100 px-3 py-1 text-xs font-black text-ink-400">
                        Вимкнено
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink-500">
                    {menu.description ?? 'Без опису'} · столиків:{' '}
                    {menu.tableUuids.length}
                  </p>
                </div>
              </div>
              <Link
                href={ROUTES.restaurantMenuEdit(restaurantUuid, menu.uuid)}
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
