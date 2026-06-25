'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  FormAlert,
  Input,
  MeasureUnitSelect,
  SinglePhotoUpload,
  Textarea,
} from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import {
  formatMoneyInput,
  parseMoneyInput,
} from '@/shared/lib/format-money';
import { getMeasureUnitLabel } from '@/shared/model/measure-unit';
import type { SupportedCurrency } from '@/shared/model/currency';
import type { Ingredient } from '@/features/ingredient/model/types';
import type { Product, RecipeRow } from '@/features/product/model/types';

type ProductFormProps = {
  restaurantUuid: string;
  currency: SupportedCurrency;
  product?: Product;
  ingredients: Ingredient[];
};

function createRecipeRow(
  ingredientId = '',
  quantity = '1',
  unit: RecipeRow['unit'] = 'G',
): RecipeRow {
  return { ingredientId, quantity, unit };
}

function recipeFromProduct(product?: Product): RecipeRow[] {
  if (!product?.recipe.length) {
    return [createRecipeRow()];
  }

  return product.recipe.map((item) => ({
    ingredientId: item.ingredientId,
    quantity: String(item.quantity),
    unit: item.unit,
  }));
}

export function ProductForm({
  restaurantUuid,
  currency,
  product,
  ingredients,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [baseUnit, setBaseUnit] = useState(product?.baseUnit ?? 'PORTION');
  const [basePrice, setBasePrice] = useState(
    product ? formatMoneyInput(product.basePrice) : '',
  );
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(
    product?.photo ?? null,
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [recipeRows, setRecipeRows] = useState<RecipeRow[]>(
    recipeFromProduct(product),
  );
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeIngredients = ingredients.filter((item) => item.isActive);
  const ingredientById = new Map(
    activeIngredients.map((ingredient) => [ingredient.uuid, ingredient]),
  );

  function updateRecipeRow(index: number, nextRow: RecipeRow) {
    setRecipeRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? nextRow : row)),
    );
  }

  function handleIngredientChange(index: number, ingredientId: string) {
    const ingredient = ingredientById.get(ingredientId);
    updateRecipeRow(index, {
      ...recipeRows[index],
      ingredientId,
      unit: ingredient?.baseUnit ?? recipeRows[index].unit,
    });
  }

  function addRecipeRow() {
    setRecipeRows((current) => [...current, createRecipeRow()]);
  }

  function removeRecipeRow(index: number) {
    setRecipeRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function buildRecipePayload() {
    return recipeRows
      .filter((row) => row.ingredientId && row.quantity.trim())
      .map((row) => {
        const ingredient = ingredientById.get(row.ingredientId);
        return {
          ingredientId: row.ingredientId,
          quantity: Number(row.quantity),
          unit: ingredient?.baseUnit ?? row.unit,
        };
      });
  }

  async function saveRecipe(productUuid: string): Promise<string | null> {
    const response = await fetch(
      `/api/restaurants/${restaurantUuid}/products/${productUuid}/recipe`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: buildRecipePayload() }),
      },
    );

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      return parseApiError(body, 'Не вдалося зберегти рецепт').message;
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const priceNumber = parseMoneyInput(basePrice);

    if (!name.trim()) {
      setFormError('Вкажіть назву продукту.');
      setIsSubmitting(false);
      return;
    }

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setFormError('Вкажіть коректну базову ціну.');
      setIsSubmitting(false);
      return;
    }

    try {
      const useMultipart =
        Boolean(photoFile) ||
        (isEdit && existingPhoto === null && product?.photo);

      let saved: Product;

      if (useMultipart) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', description.trim());
        formData.append('baseUnit', baseUnit);
        formData.append('basePrice', formatMoneyInput(priceNumber));
        if (isEdit) {
          formData.append('isActive', String(isActive));
          if (product?.photo && existingPhoto === null) {
            formData.append('removePhoto', 'true');
          }
        }
        if (photoFile) {
          formData.append('photo', photoFile);
        }

        const url = isEdit
          ? `/api/restaurants/${restaurantUuid}/products/${product!.uuid}`
          : `/api/restaurants/${restaurantUuid}/products`;

        const response = await fetch(url, {
          method: isEdit ? 'PATCH' : 'POST',
          body: formData,
        });

        if (!response.ok) {
          const body: unknown = await response.json().catch(() => undefined);
          setFormError(parseApiError(body, 'Не вдалося зберегти продукт').message);
          return;
        }

        saved = (await response.json()) as Product;
      } else {
        const url = isEdit
          ? `/api/restaurants/${restaurantUuid}/products/${product!.uuid}`
          : `/api/restaurants/${restaurantUuid}/products`;

        const response = await fetch(url, {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            baseUnit,
            basePrice: priceNumber,
            ...(isEdit ? { isActive } : {}),
          }),
        });

        if (!response.ok) {
          const body: unknown = await response.json().catch(() => undefined);
          setFormError(parseApiError(body, 'Не вдалося зберегти продукт').message);
          return;
        }

        saved = (await response.json()) as Product;
      }

      const recipeError = await saveRecipe(saved.uuid);
      if (recipeError) {
        setFormError(recipeError);
        return;
      }

      router.push(ROUTES.restaurantProducts(restaurantUuid));
      router.refresh();
    } catch {
      setFormError('Не вдалося зберегти продукт.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || !product) {
      return;
    }

    const confirmed = window.confirm(
      'Видалити продукт? Він зникне зі списків, але залишиться там, де вже використовується.',
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setFormError('');

    try {
      const response = await fetch(
        `/api/restaurants/${restaurantUuid}/products/${product.uuid}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(parseApiError(body, 'Не вдалося видалити продукт').message);
        return;
      }

      router.push(ROUTES.restaurantProducts(restaurantUuid));
      router.refresh();
    } catch {
      setFormError('Не вдалося видалити продукт.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <section className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6">
        <div className="grid gap-5">
          <Input
            label="Назва"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Борщ"
          />
          <Textarea
            label="Опис"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Короткий опис продукту"
            rows={4}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <MeasureUnitSelect
              value={baseUnit}
              onChange={setBaseUnit}
              label="Одиниця ціни"
              hint="Ціна вказується за цю одиницю (порція, кг, шт тощо)."
            />
            <Input
              label={`Базова ціна (${currency})`}
              type="text"
              inputMode="decimal"
              value={basePrice}
              onChange={(event) => setBasePrice(event.target.value)}
              placeholder="120"
            />
          </div>

          <SinglePhotoUpload
            legend="Фото продукту"
            optional
            existingPhoto={existingPhoto}
            photoFile={photoFile}
            onExistingPhotoChange={setExistingPhoto}
            onPhotoFileChange={setPhotoFile}
            previewAlt={name || 'Фото продукту'}
          />

          {isEdit ? (
            <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="size-4 accent-ink-950"
              />
              Активний продукт
            </label>
          ) : null}
        </div>
      </section>

      <section className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-ink-950">Рецепт</h3>
            <p className="mt-1 text-sm font-semibold text-ink-500">
              Кількість береться в одиницях інгредієнта з довідника.
            </p>
          </div>
          <button
            type="button"
            onClick={addRecipeRow}
            className="text-sm font-black text-brand-700"
          >
            + Додати інгредієнт
          </button>
        </div>

        {activeIngredients.length === 0 ? (
          <p className="text-sm font-semibold text-ink-500">
            Спочатку додайте активні інгредієнти в ресторані.
          </p>
        ) : (
          <div className="space-y-3">
            {recipeRows.map((row, index) => {
              const selectedIngredient = ingredientById.get(row.ingredientId);
              const unitLabel = selectedIngredient
                ? getMeasureUnitLabel(selectedIngredient.baseUnit)
                : null;

              return (
                <div
                  key={`recipe-${index}`}
                  className="grid gap-3 rounded-[24px] border border-line bg-paper-50 p-4 sm:grid-cols-[1fr_160px_auto]"
                >
                  <div>
                    <label className="mb-2 block text-sm font-black text-ink-800">
                      Інгредієнт
                    </label>
                    <select
                      value={row.ingredientId}
                      onChange={(event) =>
                        handleIngredientChange(index, event.target.value)
                      }
                      className="h-12 w-full rounded-field border border-line bg-white px-3 text-sm font-medium text-ink-950"
                    >
                      <option value="">Оберіть інгредієнт</option>
                      {activeIngredients.map((ingredient) => (
                        <option key={ingredient.uuid} value={ingredient.uuid}>
                          {ingredient.name} ({getMeasureUnitLabel(ingredient.baseUnit)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-ink-800">
                      Кількість{unitLabel ? `, ${unitLabel}` : ''}
                    </label>
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={row.quantity}
                      onChange={(event) =>
                        updateRecipeRow(index, {
                          ...row,
                          quantity: event.target.value,
                        })
                      }
                      className="h-12 w-full rounded-field border border-line bg-white px-3 text-sm font-medium text-ink-950"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeRecipeRow(index)}
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
      </section>

      {formError ? (
        <FormAlert className="text-[13px]">{formError}</FormAlert>
      ) : null}

      <Button type="submit" fullWidth disabled={isSubmitting || isDeleting}>
        {isSubmitting
          ? 'Збереження...'
          : isEdit
            ? 'Зберегти зміни'
            : 'Створити продукт'}
      </Button>

      {isEdit ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting || isDeleting}
          className="h-12 rounded-field border border-danger/20 bg-danger-50 px-5 text-sm font-extrabold text-danger transition hover:bg-danger-50/80 disabled:opacity-60"
        >
          {isDeleting ? 'Видалення...' : 'Видалити продукт'}
        </button>
      ) : null}
    </form>
  );
}
