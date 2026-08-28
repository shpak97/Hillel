'use client';

import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import type { Table } from '@/features/table/model/types';

type TableListProps = {
  restaurantUuid: string;
  tables: Table[];
};

export function TableList({ restaurantUuid, tables }: TableListProps) {
  return (
    <section className="rounded-[30px] bg-card shadow-[0_24px_70px_-55px_rgba(23,21,18,0.75)] ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 sm:p-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            Tables
          </p>
          <h2 className="mt-2 text-3xl font-black text-ink-950">Столики</h2>
        </div>
        <Link
          href={ROUTES.restaurantTableNew(restaurantUuid)}
          className="inline-flex h-12 items-center justify-center rounded-field bg-ink-950 px-5 text-sm font-extrabold text-white transition hover:bg-brand-700"
        >
          Додати столик
        </Link>
      </div>

      {tables.length === 0 ? (
        <p className="p-6 text-sm font-semibold text-ink-500">
          Ще немає столиків. Додайте перший.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {tables.map((table) => (
            <article
              key={table.uuid}
              className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-ink-950">
                    {table.label}
                  </h3>
                  <span className="rounded-pill bg-paper-100 px-3 py-1 text-xs font-black text-ink-600">
                    {table.zone}
                  </span>
                  {!table.isActive ? (
                    <span className="rounded-pill bg-paper-100 px-3 py-1 text-xs font-black text-ink-400">
                      Вимкнено
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold text-ink-500">
                  {table.seats} місць · меню: {table.menuUuids.length}
                </p>
              </div>
              <Link
                href={ROUTES.restaurantTableEdit(restaurantUuid, table.uuid)}
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
