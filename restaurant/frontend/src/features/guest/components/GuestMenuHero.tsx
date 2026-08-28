import { getRestaurantPhotoUrl } from '@/features/restaurant/lib/photo-url';

type GuestMenuHeroProps = {
  restaurantTitle: string;
  menuName: string;
  menuDescription: string | null;
  photo: string | null;
};

export function GuestMenuHero({
  restaurantTitle,
  menuName,
  menuDescription,
  photo,
}: GuestMenuHeroProps) {
  return (
    <div className="relative h-52 overflow-hidden rounded-t-[28px] sm:h-64">
      {photo ? (
        <img
          src={getRestaurantPhotoUrl(photo)}
          alt={menuName}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-brand-700 to-brand" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/80">
          {restaurantTitle}
        </p>
        <h1 className="mt-2 text-[30px] font-black leading-[1.05] text-white sm:text-[38px]">
          {menuName}
        </h1>
        {menuDescription ? (
          <p className="mt-2 max-w-lg text-sm font-semibold text-white/85 sm:text-base">
            {menuDescription}
          </p>
        ) : null}
      </div>
    </div>
  );
}
