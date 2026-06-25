import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRestaurantByUuid } from '@/features/restaurant/api/fetch-restaurant-by-uuid';
import {
  fetchMenuByUuid,
  fetchMenuHours,
} from '@/features/menu/api/fetch-menus';
import { fetchMenuSections } from '@/features/menu/api/fetch-menu-sections';
import { fetchMenuItemsForRestaurant } from '@/features/menu/api/fetch-menu-items';
import { fetchSectionMenuItems } from '@/features/menu/api/fetch-section-menu-items';
import { fetchTablesForRestaurant } from '@/features/table/api/fetch-tables';
import { MenuForm } from '@/features/menu/components/MenuForm';
import { MenuSectionsPanel } from '@/features/menu/components/MenuSectionsPanel';
import { AdminLayout } from '@/widgets/admin-layout/AdminLayout';
import { ROUTES } from '@/shared/config/routes';
import { resolveRestaurantCurrency } from '@/shared/lib/resolve-currency';
import type { SectionMenuItem } from '@/features/menu/model/item-types';

type EditMenuPageProps = {
  params: Promise<{ uuid: string; menuUuid: string }>;
};

export default async function EditMenuPage({ params }: EditMenuPageProps) {
  const { uuid, menuUuid } = await params;
  const [restaurant, menu, tables, hours, sections, catalogItems] =
    await Promise.all([
      fetchRestaurantByUuid(uuid),
      fetchMenuByUuid(uuid, menuUuid),
      fetchTablesForRestaurant(uuid),
      fetchMenuHours(uuid, menuUuid),
      fetchMenuSections(uuid, menuUuid),
      fetchMenuItemsForRestaurant(uuid),
    ]);

  if (!restaurant || !menu) {
    notFound();
  }

  const linkedEntries = await Promise.all(
    sections.map(
      async (section) =>
        [
          section.uuid,
          await fetchSectionMenuItems(uuid, menuUuid, section.uuid),
        ] as const,
    ),
  );
  const initialLinkedItemsBySection = Object.fromEntries(
    linkedEntries,
  ) as Record<string, SectionMenuItem[]>;

  return (
    <AdminLayout
      activeHref={ROUTES.restaurantMenus(uuid)}
      restaurantUuid={uuid}
      title="Редагування меню"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[34px] font-black leading-[1.05] text-ink-950 sm:text-[44px]">
            {menu.name}
          </h2>
          <p className="mt-4 text-[16px] font-semibold leading-7 text-ink-600">
            {restaurant.title}
          </p>
        </div>
        <Link
          href={ROUTES.restaurantMenus(uuid)}
          className="inline-flex h-12 items-center justify-center rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50"
        >
          Назад
        </Link>
      </div>

      <MenuForm
        restaurantUuid={uuid}
        menu={menu}
        tables={tables}
        initialHours={hours}
        afterContent={
          <div className="mt-6">
            <MenuSectionsPanel
              restaurantUuid={uuid}
              menuUuid={menuUuid}
              currency={resolveRestaurantCurrency(restaurant.currency)}
              catalogItems={catalogItems}
              initialSections={sections}
              initialLinkedItemsBySection={initialLinkedItemsBySection}
            />
          </div>
        }
      />
    </AdminLayout>
  );
}
