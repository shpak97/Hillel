import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import { fetchMenusForRestaurant } from '@/features/menu/api/fetch-menus';
import { QrCodeForm } from '@/features/qr-code/components/QrCodeForm';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

type NewQrCodePageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function NewQrCodePage({ params }: NewQrCodePageProps) {
  const { uuid } = await params;
  const [restaurant, menus] = await Promise.all([
    fetchRestaurantByUuid(uuid),
    fetchMenusForRestaurant(uuid),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantQrCodes(uuid)}
      restaurantUuid={uuid}
      title="Новий QR-код"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
            Новий QR-код
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

      <QrCodeForm restaurantUuid={uuid} menus={menus} />
    </AdminLayout>
  );
}
