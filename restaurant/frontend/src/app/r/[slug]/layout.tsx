import type { ReactNode } from 'react';
import { fetchGuestRestaurant } from '@/features/guest/api/fetch-guest-restaurant';
import { CartBar } from '@/features/guest/components/CartBar';
import { CartProvider } from '@/features/guest/context/CartContext';
import { resolveRestaurantCurrency } from '@/shared/lib/resolve-currency';

type GuestLayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function GuestRestaurantLayout({
  children,
  params,
}: GuestLayoutProps) {
  const { slug } = await params;
  const restaurant = await fetchGuestRestaurant(slug);
  const title = restaurant?.title ?? slug;
  const currency = resolveRestaurantCurrency(restaurant?.currency);

  return (
    <CartProvider restaurantSlug={slug}>
      <div className="min-h-full bg-[linear-gradient(180deg,#f7f3ec_0%,#efe7db_100%)] text-ink-950">
        <header className="border-b border-line/70 bg-white/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
            <p className="text-[15px] font-black tracking-tight">RestoQR</p>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-400">
              {title}
            </p>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl px-5 py-8 pb-28 sm:py-12">
          {children}
        </main>
        <CartBar currency={currency} />
      </div>
    </CartProvider>
  );
}
