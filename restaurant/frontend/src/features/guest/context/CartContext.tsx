'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem } from '@/features/guest/model/cart-types';
import { loadCart, saveCart } from '@/features/guest/lib/cart-storage';

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  getQuantity: (menuItemId: string) => number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  restaurantSlug: string;
  children: ReactNode;
};

export function CartProvider({ restaurantSlug, children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart(restaurantSlug));
    setIsHydrated(true);
  }, [restaurantSlug]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveCart(restaurantSlug, items);
  }, [restaurantSlug, items, isHydrated]);

  const value = useMemo<CartContextValue>(() => {
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return {
      items,
      totalCount,
      totalPrice,
      getQuantity: (menuItemId) =>
        items.find((item) => item.menuItemId === menuItemId)?.quantity ?? 0,
      addItem: (item) => {
        setItems((prev) => {
          const existing = prev.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return prev.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            );
          }
          return [...prev, { ...item, quantity: 1 }];
        });
      },
      setQuantity: (menuItemId, quantity) => {
        setItems((prev) => {
          if (quantity <= 0) {
            return prev.filter((i) => i.menuItemId !== menuItemId);
          }
          return prev.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i,
          );
        });
      },
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
