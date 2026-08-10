import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { fetchQrCodesForRestaurant } from '@/features/qr-code/api/fetch-qr-codes';
import { QrCodeList } from '@/features/qr-code/components/QrCodeList';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

type QrCodesPageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function RestaurantQrCodesPage({
  params,
}: QrCodesPageProps) {
  const { uuid } = await params;
  const [restaurant, qrCodes] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchQrCodesForRestaurant(uuid),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantQrCodes(uuid)}
      restaurantUuid={uuid}
      title="QR-коди"
      headerAction={
        <Link
          href={ROUTES.restaurantEdit(uuid)}
          className="hidden rounded-pill border border-line bg-white px-4 py-2 text-sm font-bold text-ink-600 transition hover:border-brand/30 hover:bg-brand-50 hover:text-brand-700 sm:inline-flex"
        >
          Ресторан
        </Link>
      }
    >
      <div className="mb-6">
        <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
          {restaurant.title}
        </h2>
        <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
          Набори меню в одному QR. Гість після скану обирає меню зі списку.
        </p>
      </div>

      <QrCodeList restaurantUuid={uuid} qrCodes={qrCodes} />
    </AdminLayout>
  );
}
