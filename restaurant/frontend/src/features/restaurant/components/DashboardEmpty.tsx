import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';

export function DashboardEmpty() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-[30px] bg-card p-6 shadow-[0_24px_70px_-50px_rgba(23,21,18,0.75)] ring-1 ring-line sm:p-8">
        <p className="mb-4 inline-flex rounded-pill bg-brand-50 px-3 py-1 text-sm font-black text-brand-700 ring-1 ring-brand/10">
          Перший крок
        </p>
        <h2 className="max-w-2xl text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
          Створіть ресторан, щоб запустити QR-меню
        </h2>
        <p className="mt-5 max-w-2xl text-[16px] font-semibold leading-7 text-ink-600">
          Після створення ресторану ви зможете додати страви, столи, QR-коди та
          приймати замовлення від гостей.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={ROUTES.restaurantsNew}
            className="inline-flex h-14 items-center justify-center rounded-field bg-ink-950 px-6 text-[15px] font-extrabold text-white shadow-[0_18px_38px_-22px_rgba(23,21,18,0.95)] transition hover:-translate-y-0.5 hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand/20"
          >
            Створити ресторан
          </Link>
          <Link
            href={ROUTES.restaurants}
            className="inline-flex h-14 items-center justify-center rounded-field border border-line bg-white px-6 text-[15px] font-extrabold text-ink-950 transition hover:bg-paper-50"
          >
            Перейти до списку
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { title: '1. Профіль', text: 'Назва, місто, контакти.' },
            { title: '2. Меню', text: 'Категорії, страви, ціни.' },
            { title: '3. QR', text: 'Столи та посилання.' },
          ].map((step) => (
            <div
              key={step.title}
              className="rounded-[24px] bg-paper-50 p-4 ring-1 ring-line"
            >
              <p className="text-sm font-black text-ink-950">{step.title}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink-500">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-[30px] bg-ink-950 p-5 text-white shadow-[0_28px_80px_-52px_rgba(23,21,18,0.9)]">
        <div className="rounded-[24px] bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-[12px] font-black uppercase tracking-[0.14em] text-white/55">
            Preview
          </p>
          <h3 className="mt-2 text-2xl font-black">Bistro 21</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
            Так виглядатиме ресторан після створення.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-[22px] bg-white p-4 text-ink-950">
            <p className="text-[12px] font-bold text-ink-400">Меню</p>
            <p className="mt-1 text-lg font-black">0 позицій</p>
          </div>
          <div className="rounded-[22px] bg-white p-4 text-ink-950">
            <p className="text-[12px] font-bold text-ink-400">Столи</p>
            <p className="mt-1 text-lg font-black">0 QR-кодів</p>
          </div>
          <div className="rounded-[22px] bg-herb-50 p-4 text-herb">
            <p className="text-[12px] font-bold text-herb/70">Статус</p>
            <p className="mt-1 text-lg font-black">готовий до налаштування</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
