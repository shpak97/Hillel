import { notFound } from 'next/navigation';
import { fetchGuestTable } from '@/features/guest/api/fetch-guest-table';
import { GuestMenuLinkList } from '@/features/guest/components/GuestMenuLinkList';
import { ROUTES } from '@/shared/config/routes';

type GuestTablePageProps = {
  params: Promise<{ slug: string; tableUuid: string }>;
};

export default async function GuestTablePage({ params }: GuestTablePageProps) {
  const { slug, tableUuid } = await params;
  const data = await fetchGuestTable(slug, tableUuid);

  if (!data) {
    notFound();
  }

  return (
    <section className="rounded-[28px] border border-line bg-white p-6 shadow-[0_18px_40px_-32px_rgba(23,21,18,0.45)] sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-700">
        {data.restaurant.title}
      </p>
      <h1 className="mt-3 text-[34px] font-black leading-[1.05] text-ink-950">
        Столик {data.table.label}
      </h1>
      <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
        Оберіть меню, щоб переглянути страви.
      </p>

      <GuestMenuLinkList
        menus={data.menus.map((menu) => ({
          menuId: menu.menuId,
          menuName: menu.menuName,
          url: ROUTES.guestMenu(data.restaurant.slug, menu.menuId, false),
        }))}
        emptyMessage="Для цього столика зараз немає доступних меню."
      />
    </section>
  );
}
