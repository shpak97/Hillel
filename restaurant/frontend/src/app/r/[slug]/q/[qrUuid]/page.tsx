import { notFound } from 'next/navigation';
import { fetchGuestQr } from '@/features/guest/api/fetch-guest-qr';
import { GuestMenuLinkList } from '@/features/guest/components/GuestMenuLinkList';
import { ROUTES } from '@/shared/config/routes';

type GuestQrPageProps = {
  params: Promise<{ slug: string; qrUuid: string }>;
};

export default async function GuestQrPage({ params }: GuestQrPageProps) {
  const { slug, qrUuid } = await params;
  const data = await fetchGuestQr(slug, qrUuid);

  if (!data) {
    notFound();
  }

  return (
    <section className="rounded-[28px] border border-line bg-white p-6 shadow-[0_18px_40px_-32px_rgba(23,21,18,0.45)] sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-700">
        {data.restaurant.title}
      </p>
      <h1 className="mt-3 text-[34px] font-black leading-[1.05] text-ink-950">
        Оберіть меню
      </h1>
      <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
        {data.qrCode.name}
      </p>

      <GuestMenuLinkList
        menus={data.menus.map((menu) => ({
          menuId: menu.menuId,
          menuName: menu.menuName,
          selectTable: menu.selectTable,
          url: ROUTES.guestMenu(data.restaurant.slug, menu.menuId, menu.selectTable),
        }))}
        showSelectTableBadge
        emptyMessage="У цьому QR зараз немає доступних меню."
      />
    </section>
  );
}
