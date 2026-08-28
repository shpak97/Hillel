import { notFound } from 'next/navigation';
import { fetchGuestMenu } from '@/features/guest/api/fetch-guest-menu';
import { GuestMenuHero } from '@/features/guest/components/GuestMenuHero';
import { GuestMenuSectionNav } from '@/features/guest/components/GuestMenuSectionNav';
import { GuestMenuSections } from '@/features/guest/components/GuestMenuSections';
import { resolveRestaurantCurrency } from '@/shared/lib/resolve-currency';
import { InfoAlert } from '@/shared/ui';

type GuestMenuPageProps = {
  params: Promise<{ slug: string; menuUuid: string }>;
  searchParams: Promise<{ selectTable?: string }>;
};

function parseSelectTable(value: string | undefined): boolean {
  return value === '1' || value === 'true';
}

export default async function GuestMenuPage({
  params,
  searchParams,
}: GuestMenuPageProps) {
  const { slug, menuUuid } = await params;
  const query = await searchParams;
  const selectTable = parseSelectTable(query.selectTable);

  const data = await fetchGuestMenu(slug, menuUuid);

  if (!data) {
    notFound();
  }

  const currency = resolveRestaurantCurrency(data.restaurant.currency);

  return (
    <section className="rounded-[28px] border border-line bg-white shadow-[0_18px_40px_-32px_rgba(23,21,18,0.45)]">
      <GuestMenuHero
        restaurantTitle={data.restaurant.title}
        menuName={data.menu.name}
        menuDescription={data.menu.description}
        photo={data.menu.photo}
      />

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        {!data.hours.isOpenNow ? (
          <InfoAlert className="mt-6">Це меню зараз зачинене за розкладом.</InfoAlert>
        ) : null}

        {selectTable ? (
          <p className="mt-6 rounded-field border border-dashed border-brand/40 bg-brand/5 px-4 py-3 text-sm font-bold text-ink-700">
            Наступний крок для гостя: вибір столика перед переглядом меню.
          </p>
        ) : null}

        <GuestMenuSectionNav
          sections={data.sections.map((section) => ({
            uuid: section.uuid,
            name: section.name,
          }))}
        />

        <GuestMenuSections sections={data.sections} currency={currency} />
      </div>
    </section>
  );
}
