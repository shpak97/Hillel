import type { CartItem } from '@/features/guest/model/cart-types';

const STORAGE_PREFIX = 'guest-cart:';

export function loadCart(restaurantSlug: string): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + restaurantSlug);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(restaurantSlug: string, items: CartItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_PREFIX + restaurantSlug,
      JSON.stringify(items),
    );
  } catch {
    // Ignore storage quota / privacy-mode failures — cart just won't persist.
  }
}
