import Link from 'next/link';
import type { Restaurant } from '@/features/restaurant/model/types';
import { ROUTES } from '@/shared/config/routes';
import {
  getRestaurantAvatarClass,
  getRestaurantInitials,
  getRestaurantMetaLine,
  getRestaurantStatusMeta,
} from '@/features/restaurant/lib/restaurant-display';

type RestaurantListItemProps = {
  restaurant: Restaurant;
};

export function RestaurantListItem({ restaurant }: RestaurantListItemProps) {
  const status = getRestaurantStatusMeta(restaurant);
  const initials = getRestaurantInitials(restaurant.title);
  const avatarClass = getRestaurantAvatarClass(restaurant.title);

  return (
    <article className="grid gap-4 p-5 transition hover:bg-paper-50/70 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
      <div className="flex min-w-0 gap-4">
        <div
          className={`grid size-14 shrink-0 place-items-center rounded-3xl text-lg font-black ${avatarClass}`}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-ink-950">
              {restaurant.title}
            </h3>
            <span
              className={`rounded-pill px-3 py-1 text-xs font-black ${status.className}`}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink-500">
            {getRestaurantMetaLine(restaurant)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={ROUTES.restaurantTables(restaurant.uuid)}
          className="inline-flex h-12 items-center justify-center rounded-field bg-ink-950 px-5 text-sm font-extrabold text-white transition hover:bg-brand-700"
        >
          Увійти
        </Link>
        <Link
          href={ROUTES.restaurantEdit(restaurant.uuid)}
          className="inline-flex h-12 items-center justify-center rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50"
        >
          Редагувати
        </Link>
      </div>
    </article>
  );
}

type RestaurantListProps = {
  restaurants: Restaurant[];
};

export function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <section className="rounded-[30px] bg-card shadow-[0_24px_70px_-55px_rgba(23,21,18,0.75)] ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 sm:p-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            Restaurant list
          </p>
          <h2 className="mt-2 text-3xl font-black text-ink-950">
            Оберіть ресторан
          </h2>
        </div>
        <Link
          href={ROUTES.restaurantsNew}
          className="inline-flex h-12 items-center justify-center rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50"
        >
          Додати ще
        </Link>
      </div>

      <div className="divide-y divide-line">
        {restaurants.map((restaurant) => (
          <RestaurantListItem key={restaurant.uuid} restaurant={restaurant} />
        ))}
      </div>
    </section>
  );
}
