'use client';

import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import type { QrCode } from '@/features/qr-code/model/types';

type QrCodeListProps = {
  restaurantUuid: string;
  qrCodes: QrCode[];
};

export function QrCodeList({ restaurantUuid, qrCodes }: QrCodeListProps) {
  return (
    <section className="rounded-[30px] bg-card shadow-[0_24px_70px_-55px_rgba(23,21,18,0.75)] ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 sm:p-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            QR codes
          </p>
          <h2 className="mt-2 text-3xl font-black text-ink-950">QR-коди</h2>
        </div>
        <Link
          href={ROUTES.restaurantQrCodeNew(restaurantUuid)}
          className="inline-flex h-12 items-center justify-center rounded-field bg-ink-950 px-5 text-sm font-extrabold text-white transition hover:bg-brand-700"
        >
          Створити QR
        </Link>
      </div>

      {qrCodes.length === 0 ? (
        <p className="p-6 text-sm font-semibold text-ink-500">
          Ще немає QR-кодів. Створіть перший набір меню.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {qrCodes.map((qrCode) => (
            <article
              key={qrCode.uuid}
              className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-ink-950">
                    {qrCode.name}
                  </h3>
                  {!qrCode.isActive ? (
                    <span className="rounded-pill bg-paper-100 px-3 py-1 text-xs font-black text-ink-400">
                      Вимкнено
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold text-ink-500">
                  {qrCode.menus.length === 1
                    ? '1 меню'
                    : `${qrCode.menus.length} меню`}
                  {qrCode.menus.length > 0
                    ? ` · ${qrCode.menus.map((menu) => menu.menuName).join(', ')}`
                    : null}
                </p>
              </div>
              <Link
                href={ROUTES.restaurantQrCodeEdit(restaurantUuid, qrCode.uuid)}
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
