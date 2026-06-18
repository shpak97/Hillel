import { redirect } from 'next/navigation';
import { fetchRestaurantsForUser } from '@/features/restaurant/api/fetch-restaurants-for-user';
import { DashboardEmpty } from '@/features/restaurant/components/DashboardEmpty';
import {
  StatCard,
  StatsGrid,
} from '@/features/restaurant/components/StatsGrid';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';

export default async function DashboardPage() {
  const restaurants = await fetchRestaurantsForUser();

  if (restaurants.length > 0) {
    redirect(ROUTES.restaurants);
  }

  return (
    <AdminLayout
      activeHref={ROUTES.home}
      title="Дашборд"
      sidebarFooter={
        <div className="rounded-[24px] bg-paper-50 p-4 ring-1 ring-line">
          <p className="text-[12px] font-black uppercase tracking-[0.12em] text-brand-700">
            Next
          </p>
          <p className="mt-2 text-sm font-bold leading-5 text-ink-600">
            Додайте ресторан, щоб відкрити меню, столи й QR-коди.
          </p>
        </div>
      }
    >
      <StatsGrid>
        <StatCard label="Ресторани" value={0} />
        <StatCard label="Меню" value={0} />
        <StatCard label="QR столи" value={0} />
      </StatsGrid>
      <DashboardEmpty />
    </AdminLayout>
  );
}
