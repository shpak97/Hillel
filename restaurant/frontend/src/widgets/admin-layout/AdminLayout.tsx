import type { ReactNode } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

type AdminLayoutProps = {
  activeHref: string;
  title: string;
  headerAction?: ReactNode;
  sidebarFooter?: ReactNode;
  restaurantUuid?: string;
  children: ReactNode;
};

export function AdminLayout({
  activeHref,
  title,
  headerAction,
  sidebarFooter,
  restaurantUuid,
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-paper-50 lg:grid lg:grid-cols-[268px_1fr]">
      <AdminSidebar
        activeHref={activeHref}
        footer={sidebarFooter}
        restaurantUuid={restaurantUuid}
      />
      <section className="min-w-0">
        <AdminHeader title={title} action={headerAction} />
        <main className="mx-auto max-w-6xl px-5 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </section>
    </div>
  );
}
