'use client';

import { useCart } from '@/features/guest/context/CartContext';

type AddToCartControlProps = {
  menuItemId: string;
  name: string;
  photo: string | null;
  unitPrice: number;
};

export function AddToCartControl({
  menuItemId,
  name,
  photo,
  unitPrice,
}: AddToCartControlProps) {
  const { getQuantity, addItem, setQuantity } = useCart();
  const quantity = getQuantity(menuItemId);

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => addItem({ menuItemId, name, photo, unitPrice })}
        className="shrink-0 rounded-field border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink-950 transition hover:border-brand/40 hover:bg-brand/5"
      >
        Додати
      </button>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-3 rounded-field border border-line bg-white px-2 py-1.5">
      <button
        type="button"
        onClick={() => setQuantity(menuItemId, quantity - 1)}
        aria-label="Зменшити кількість"
        className="grid size-7 place-items-center rounded-full bg-paper-100 text-lg font-black text-ink-950"
      >
        −
      </button>
      <span className="w-4 text-center text-sm font-black text-ink-950">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity(menuItemId, quantity + 1)}
        aria-label="Збільшити кількість"
        className="grid size-7 place-items-center rounded-full bg-ink-950 text-lg font-black text-white"
      >
        +
      </button>
    </div>
  );
}
