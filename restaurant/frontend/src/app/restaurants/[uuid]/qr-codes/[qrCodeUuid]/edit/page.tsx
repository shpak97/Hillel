import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { fetchMenusForRestaurant } from '@/features/menu/api/fetch-menus';
import { fetchQrCodeByUuid } from '@/features/qr-code/api/fetch-qr-codes';
import { QrCodeForm } from '@/features/qr-code/components/QrCodeForm';
import { QrCodePanel } from '@/features/qr-code/components/QrCodePanel';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

type EditQrCodePageProps = {
  params: Promise<{ uuid: string; qrCodeUuid: string }>;
};

export default async function EditQrCodePage({ params }: EditQrCodePageProps) {
  const { uuid, qrCodeUuid } = await params;
  const [restaurant, qrCode, menus] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchQrCodeByUuid(uuid, qrCodeUuid),
    fetchMenusForRestaurant(uuid),
  ]);

  if (!restaurant || !qrCode) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantQrCodes(uuid)}
      restaurantUuid={uuid}
      title="Редагувати QR-код"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
            {qrCode.name}
          </h2>
          <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
            {restaurant.title}
          </p>
        </div>
        <Link
          href={ROUTES.restaurantQrCodes(uuid)}
          className="inline-flex h-12 items-center justify-center rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50"
        >
          Назад
        </Link>
      </div>

      <div className="grid gap-6">
        <QrCodeForm restaurantUuid={uuid} menus={menus} qrCode={qrCode} />
        <QrCodePanel
          restaurantUuid={uuid}
          restaurantSlug={restaurant.slug}
          qrCodeUuid={qrCode.uuid}
        />
      </div>
    </AdminLayout>
  );
}
