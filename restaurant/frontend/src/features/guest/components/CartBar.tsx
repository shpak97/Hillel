'use client';

import { useState } from 'react';
import { useCart } from '@/features/guest/context/CartContext';
import { CartDrawer } from '@/features/guest/components/CartDrawer';
import { formatMoney } from '@/shared/lib/format-money';
import { pluralizeUk } from '@/shared/lib/pluralize-uk';
import type { SupportedCurrency } from '@/shared/model/currency';

type CartBarProps = {
  currency: SupportedCurrency;
};

export function CartBar({ currency }: CartBarProps) {
  const { totalCount, totalPrice } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  if (totalCount === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-5 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mx-auto flex w-full max-w-3xl items-center justify-between rounded-field bg-ink-950 px-5 py-3.5 text-white shadow-[0_18px_38px_-22px_rgba(23,21,18,0.95)]"
        >
          <span className="text-sm font-extrabold">
            {totalCount} {pluralizeUk(totalCount, ['страва', 'страви', 'страв'])}{' '}
            у кошику
          </span>
          <span className="text-sm font-black">
            {formatMoney(totalPrice, currency)}
          </span>
        </button>
      </div>
      {isOpen ? (
        <CartDrawer currency={currency} onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  );
}
