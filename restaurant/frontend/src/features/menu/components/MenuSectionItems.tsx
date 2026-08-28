'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { parseApiError } from '@/shared/api/error-message';
import { formatMoney } from '@/shared/lib/format-money';
import { ROUTES } from '@/shared/config/routes';
import { getRestaurantPhotoUrl } from '@/features/restaurant/lib/photo-url';
import type { SupportedCurrency } from '@/shared/model/currency';
import type { MenuItem, SectionMenuItem } from '@/features/menu/model/item-types';

type MenuSectionItemsProps = {
  restaurantUuid: string;
  menuUuid: string;
  sectionUuid: string;
  currency: SupportedCurrency;
  catalogItems: MenuItem[];
  initialLinkedItems: SectionMenuItem[];
};

export function MenuSectionItems({
  restaurantUuid,
  menuUuid,
  sectionUuid,
  currency,
  catalogItems,
  initialLinkedItems,
}: MenuSectionItemsProps) {
  const router = useRouter();
  const [linkedItems, setLinkedItems] = useState(
    [...initialLinkedItems].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [selectedItemId, setSelectedItemId] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiBase = `/api/restaurants/${restaurantUuid}/menus/${menuUuid}/sections/${sectionUuid}/items`;

  const availableItems = useMemo(() => {
    const linkedIds = new Set(linkedItems.map((item) => item.uuid));
    return catalogItems.filter(
      (item) => item.isActive && !linkedIds.has(item.uuid),
    );
  }, [catalogItems, linkedItems]);

  async function saveLinks(nextIds: string[]) {
    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(apiBase, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: nextIds }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(
          parseApiError(body, 'Не вдалося оновити позиції в розділі').message,
        );
        return;
      }

      const updated = (await response.json()) as SectionMenuItem[];
      setLinkedItems(updated.sort((a, b) => a.sortOrder - b.sortOrder));
      setSelectedItemId('');
      router.refresh();
    } catch {
      setFormError('Не вдалося оновити позиції в розділі.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAdd() {
    if (!selectedItemId) {
      return;
    }

    await saveLinks([...linkedItems.map((item) => item.uuid), selectedItemId]);
  }

  async function handleRemove(itemUuid: string) {
    await saveLinks(linkedItems.filter((item) => item.uuid !== itemUuid).map((item) => item.uuid));
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h5 className="text-sm font-black uppercase tracking-[0.12em] text-ink-500">
          Позиції в розділі
        </h5>
        <Link
          href={ROUTES.restaurantMenuItems(restaurantUuid)}
          className="text-sm font-black text-brand-700"
        >
          Каталог позицій
        </Link>
      </div>

      <p className="mb-3 text-sm font-semibold text-ink-500">
        Ціна береться з каталогу позицій (сума продуктів). Тут лише прив&apos;язка до
        розділу.
      </p>

      {catalogItems.length === 0 ? (
        <p className="text-sm font-semibold text-ink-500">
          Спочатку створіть позиції в{' '}
          <Link
            href={ROUTES.restaurantMenuItemNew(restaurantUuid)}
            className="font-black text-brand-700"
          >
            каталозі
          </Link>
          .
        </p>
      ) : (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="mb-2 block text-sm font-black text-ink-800">
              Додати з каталогу
            </label>
            <select
              value={selectedItemId}
              onChange={(event) => setSelectedItemId(event.target.value)}
              className="h-11 w-full rounded-field border border-line bg-white px-3 text-sm font-medium text-ink-950"
            >
              <option value="">Оберіть позицію</option>
              {availableItems.map((item) => (
                <option key={item.uuid} value={item.uuid}>
                  {item.name} ({formatMoney(item.totalPrice, currency)})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedItemId || isSubmitting}
            className="h-11 shrink-0 rounded-field bg-ink-950 px-5 text-sm font-extrabold text-white disabled:opacity-60"
          >
            Додати
          </button>
        </div>
      )}

      {linkedItems.length === 0 ? (
        <p className="text-sm font-semibold text-ink-500">
          У цьому розділі ще немає позицій.
        </p>
      ) : (
        <div className="space-y-2">
          {linkedItems.map((item) => (
            <div
              key={item.uuid}
              className="flex flex-wrap items-start justify-between gap-3 rounded-[18px] border border-line bg-white p-3 sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {item.photo ? (
                  <img
                    src={getRestaurantPhotoUrl(item.photo)}
                    alt={item.name}
                    className="size-10 rounded-xl object-cover ring-1 ring-line"
                  />
                ) : (
                  <div className="grid size-10 place-items-center rounded-xl bg-paper-100 text-xs font-black text-ink-500">
                    M
                  </div>
                )}
                <div>
                  <p className="font-black text-ink-950">{item.name}</p>
                  <p className="text-sm font-semibold text-ink-500">
                    {formatMoney(item.totalPrice, currency)} · порядок:{' '}
                    {item.sortOrder + 1}
                    {item.priceOverride !== null &&
                    Math.abs(item.priceOverride - item.calculatedPrice) >= 0.005
                      ? ` · розрахунок ${formatMoney(item.calculatedPrice, currency)}`
                      : ''}
                  </p>
                  {item.products.length > 0 ? (
                    <p className="mt-1 text-xs font-semibold text-ink-400">
                      {item.products
                        .map((line) => {
                          const priceLabel = formatMoney(line.unitPrice, currency);
                          const qty =
                            line.quantity === 1
                              ? ''
                              : ` × ${line.quantity}`;
                          return `${line.productName}${qty} (${priceLabel})`;
                        })
                        .join(' + ')}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                <Link
                  href={ROUTES.restaurantMenuItemEdit(restaurantUuid, item.uuid)}
                  className="inline-flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-field border border-line bg-white px-4 text-sm font-extrabold leading-none text-ink-950 sm:flex-none"
                >
                  Ціна і склад
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(item.uuid)}
                  disabled={isSubmitting}
                  className="inline-flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-field border border-danger/20 bg-danger-50 px-4 text-sm font-extrabold leading-none text-danger sm:flex-none"
                >
                  Прибрати
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formError ? (
        <p className="mt-3 text-sm font-bold text-danger">{formError}</p>
      ) : null}
    </div>
  );
}
