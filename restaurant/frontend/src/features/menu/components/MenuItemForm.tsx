'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  FormAlert,
  Input,
  SinglePhotoUpload,
  Textarea,
} from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import {
  formatMoney,
  formatMoneyInput,
  parseMoneyInput,
} from '@/shared/lib/format-money';
import { getMeasureUnitLabel } from '@/shared/model/measure-unit';
import type { SupportedCurrency } from '@/shared/model/currency';
import type { Product } from '@/features/product/model/types';
import type {
  MenuItem,
  MenuItemProductRow,
} from '@/features/menu/model/item-types';

type MenuItemFormProps = {
  restaurantUuid: string;
  currency: SupportedCurrency;
  products: Product[];
  item?: MenuItem;
};

function createProductRow(
  productId = '',
  quantity = '1',
  priceOverride = '',
): MenuItemProductRow {
  return { productId, quantity, priceOverride };
}

function productRowsFromItem(item?: MenuItem): MenuItemProductRow[] {
  if (!item?.products.length) {
    return [createProductRow()];
  }

  return item.products.map((line) => ({
    productId: line.productId,
    quantity: String(line.quantity),
    priceOverride:
      line.priceOverride !== null ? formatMoneyInput(line.priceOverride) : '',
  }));
}

function calculateFromRows(
  rows: MenuItemProductRow[],
  productById: Map<string, Product>,
): number {
  let total = 0;

  for (const row of rows) {
    if (!row.productId) {
      continue;
    }

    const product = productById.get(row.productId);
    const quantity = Number(row.quantity);
    if (!product || !Number.isFinite(quantity) || quantity <= 0) {
      continue;
    }

    const unitPrice = row.priceOverride.trim()
      ? parseMoneyInput(row.priceOverride)
      : product.basePrice;

    if (!Number.isFinite(unitPrice)) {
      continue;
    }

    total += Math.round(unitPrice * quantity * 100) / 100;
  }

  return Math.round(total * 100) / 100;
}

function resolvePriceOverrideForSave(
  guestPrice: string,
  calculatedPrice: number,
): number | null {
  const parsed = parseMoneyInput(guestPrice);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (Math.abs(parsed - calculatedPrice) < 0.005) {
    return null;
  }

  return parsed;
}

export function MenuItemForm({
  restaurantUuid,
  currency,
  products,
  item,
}: MenuItemFormProps) {
  const router = useRouter();
  const isEdit = Boolean(item);
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(
    item?.photo ?? null,
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [productRows, setProductRows] = useState<MenuItemProductRow[]>(
    productRowsFromItem(item),
  );
  const [guestPrice, setGuestPrice] = useState(() =>
    item ? formatMoneyInput(item.totalPrice) : '',
  );
  const [priceManual, setPriceManual] = useState(
    () => item?.priceOverride != null,
  );
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeProducts = products.filter((product) => product.isActive);
  const productById = useMemo(
    () => new Map(activeProducts.map((product) => [product.uuid, product])),
    [activeProducts],
  );

  const calculatedPrice = useMemo(
    () => calculateFromRows(productRows, productById),
    [productRows, productById],
  );

  useEffect(() => {
    if (!priceManual) {
      setGuestPrice(formatMoneyInput(calculatedPrice));
    }
  }, [calculatedPrice, priceManual]);

  const apiBase = `/api/restaurants/${restaurantUuid}/menu-items`;

  function updateProductRow(index: number, nextRow: MenuItemProductRow) {
    setProductRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? nextRow : row)),
    );
  }

  function addProductRow() {
    setProductRows((current) => [...current, createProductRow()]);
  }

  function removeProductRow(index: number) {
    setProductRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function applyCalculatedPrice() {
    setGuestPrice(formatMoneyInput(calculatedPrice));
    setPriceManual(false);
  }

  function buildProductsPayload() {
    return productRows
      .filter((row) => row.productId)
      .map((row) => {
        const priceOverride = row.priceOverride.trim()
          ? parseMoneyInput(row.priceOverride)
          : null;

        return {
          productId: row.productId,
          quantity: Number(row.quantity),
          priceOverride:
            priceOverride !== null && Number.isFinite(priceOverride)
              ? priceOverride
              : null,
        };
      });
  }

  async function saveProducts(itemUuid: string): Promise<string | null> {
    const response = await fetch(`${apiBase}/${itemUuid}/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: buildProductsPayload() }),
    });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      return parseApiError(body, 'Не вдалося зберегти склад позиції').message;
    }

    return null;
  }

  async function savePriceOverride(itemUuid: string): Promise<string | null> {
    const priceOverride = resolvePriceOverrideForSave(guestPrice, calculatedPrice);

    const response = await fetch(`${apiBase}/${itemUuid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceOverride }),
    });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      return parseApiError(body, 'Не вдалося зберегти загальну ціну').message;
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setFormError('Вкажіть назву позиції.');
      setIsSubmitting(false);
      return;
    }

    const guestPriceNumber = parseMoneyInput(guestPrice);
    if (!Number.isFinite(guestPriceNumber) || guestPriceNumber < 0) {
      setFormError('Вкажіть коректну загальну ціну.');
      setIsSubmitting(false);
      return;
    }

    try {
      const useMultipart =
        Boolean(photoFile) ||
        (isEdit && existingPhoto === null && item?.photo);

      let saved: MenuItem;

      if (useMultipart) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', description.trim());
        if (isEdit) {
          formData.append('isActive', String(isActive));
          if (item?.photo && existingPhoto === null) {
            formData.append('removePhoto', 'true');
          }
        }
        if (photoFile) {
          formData.append('photo', photoFile);
        }

        const url = isEdit ? `${apiBase}/${item!.uuid}` : apiBase;
        const response = await fetch(url, {
          method: isEdit ? 'PATCH' : 'POST',
          body: formData,
        });

        if (!response.ok) {
          const body: unknown = await response.json().catch(() => undefined);
          setFormError(parseApiError(body, 'Не вдалося зберегти позицію').message);
          return;
        }

        saved = (await response.json()) as MenuItem;
      } else {
        const url = isEdit ? `${apiBase}/${item!.uuid}` : apiBase;
        const response = await fetch(url, {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            ...(isEdit ? { isActive } : {}),
          }),
        });

        if (!response.ok) {
          const body: unknown = await response.json().catch(() => undefined);
          setFormError(parseApiError(body, 'Не вдалося зберегти позицію').message);
          return;
        }

        saved = (await response.json()) as MenuItem;
      }

      const productsError = await saveProducts(saved.uuid);
      if (productsError) {
        setFormError(productsError);
        return;
      }

      const priceError = await savePriceOverride(saved.uuid);
      if (priceError) {
        setFormError(priceError);
        return;
      }

      router.push(ROUTES.restaurantMenuItems(restaurantUuid));
      router.refresh();
    } catch {
      setFormError('Не вдалося зберегти позицію.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || !item) {
      return;
    }

    const confirmed = window.confirm(
      'Видалити позицію з каталогу? Вона зникне з усіх меню, де була додана.',
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setFormError('');

    try {
      const response = await fetch(`${apiBase}/${item.uuid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(parseApiError(body, 'Не вдалося видалити позицію').message);
        return;
      }

      router.push(ROUTES.restaurantMenuItems(restaurantUuid));
      router.refresh();
    } catch {
      setFormError('Не вдалося видалити позицію.');
    } finally {
      setIsDeleting(false);
    }
  }

  const showApplyCalculated =
    priceManual &&
    Math.abs(parseMoneyInput(guestPrice) - calculatedPrice) >= 0.005;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <section className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6">
        <div className="grid gap-5">
          <Input
            label="Назва"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Борщ з пампушками"
          />
          <Textarea
            label="Опис"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Короткий опис для гостя"
            rows={4}
          />

          <SinglePhotoUpload
            legend="Фото позиції"
            optional
            existingPhoto={existingPhoto}
            photoFile={photoFile}
            onExistingPhotoChange={setExistingPhoto}
            onPhotoFileChange={setPhotoFile}
            previewAlt={name || 'Фото позиції'}
          />

          {isEdit ? (
            <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="size-4 accent-ink-950"
              />
              Активна позиція
            </label>
          ) : null}
        </div>
      </section>

      <section className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-ink-950">Склад позиції</h3>
            <p className="mt-1 text-sm font-semibold text-ink-500">
              Ціни продуктів у складі. Загальна ціна оновлюється автоматично.
            </p>
          </div>
          <button
            type="button"
            onClick={addProductRow}
            className="text-sm font-black text-brand-700"
          >
            + Додати продукт
          </button>
        </div>

        {activeProducts.length === 0 ? (
          <p className="text-sm font-semibold text-ink-500">
            Спочатку додайте активні продукти в ресторані.
          </p>
        ) : (
          <div className="space-y-3">
            {productRows.map((row, index) => {
              const selectedProduct = productById.get(row.productId);

              return (
                <div
                  key={`product-row-${index}`}
                  className="grid gap-3 rounded-[24px] border border-line bg-paper-50 p-4 sm:grid-cols-[1fr_100px_120px_auto]"
                >
                  <div>
                    <label className="mb-2 block text-sm font-black text-ink-800">
                      Продукт
                    </label>
                    <select
                      value={row.productId}
                      onChange={(event) =>
                        updateProductRow(index, {
                          ...row,
                          productId: event.target.value,
                        })
                      }
                      className="h-12 w-full rounded-field border border-line bg-white px-3 text-sm font-medium text-ink-950"
                    >
                      <option value="">Оберіть продукт</option>
                      {activeProducts.map((product) => (
                        <option key={product.uuid} value={product.uuid}>
                          {product.name} ({formatMoney(product.basePrice, currency)} /{' '}
                          {getMeasureUnitLabel(product.baseUnit)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-ink-800">
                      Кількість
                    </label>
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={row.quantity}
                      onChange={(event) =>
                        updateProductRow(index, {
                          ...row,
                          quantity: event.target.value,
                        })
                      }
                      className="h-12 w-full rounded-field border border-line bg-white px-3 text-sm font-medium text-ink-950"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-ink-800">
                      Ціна за од. ({currency})
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.priceOverride}
                      onChange={(event) =>
                        updateProductRow(index, {
                          ...row,
                          priceOverride: event.target.value,
                        })
                      }
                      placeholder={
                        selectedProduct
                          ? formatMoneyInput(selectedProduct.basePrice)
                          : 'базова'
                      }
                      className="h-12 w-full rounded-field border border-line bg-white px-3 text-sm font-medium text-ink-950"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeProductRow(index)}
                      className="h-12 px-3 text-sm font-bold text-danger"
                    >
                      Прибрати
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 grid gap-4 rounded-[24px] border border-line bg-paper-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-black text-ink-800">Розрахунок з продуктів</p>
            <p className="mt-2 text-2xl font-black text-ink-950">
              {formatMoney(calculatedPrice, currency)}
            </p>
          </div>
          <Input
            label={`Загальна ціна для гостя (${currency})`}
            type="text"
            inputMode="decimal"
            value={guestPrice}
            onChange={(event) => {
              setGuestPrice(event.target.value);
              setPriceManual(true);
            }}
            hint="Можна змінити незалежно від розрахунку"
          />
        </div>

        {showApplyCalculated ? (
          <button
            type="button"
            onClick={applyCalculatedPrice}
            className="mt-3 text-sm font-black text-brand-700"
          >
            Застосувати розрахунок ({formatMoney(calculatedPrice, currency)})
          </button>
        ) : null}
      </section>

      {formError ? (
        <FormAlert className="text-[13px]">{formError}</FormAlert>
      ) : null}

      <Button type="submit" fullWidth disabled={isSubmitting || isDeleting}>
        {isSubmitting
          ? 'Збереження...'
          : isEdit
            ? 'Зберегти зміни'
            : 'Створити позицію'}
      </Button>

      {isEdit ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting || isDeleting}
          className="h-12 rounded-field border border-danger/20 bg-danger-50 px-5 text-sm font-extrabold text-danger transition hover:bg-danger-50/80 disabled:opacity-60"
        >
          {isDeleting ? 'Видалення...' : 'Видалити позицію'}
        </button>
      ) : null}
    </form>
  );
}
