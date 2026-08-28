'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormAlert, Input, MeasureUnitSelect } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import type { MeasureUnit } from '@/shared/model/measure-unit';
import type { Ingredient } from '@/features/ingredient/model/types';

type IngredientFormProps = {
  restaurantUuid: string;
  ingredient?: Ingredient;
};

export function IngredientForm({
  restaurantUuid,
  ingredient,
}: IngredientFormProps) {
  const router = useRouter();
  const isEdit = Boolean(ingredient);
  const [name, setName] = useState(ingredient?.name ?? '');
  const [baseUnit, setBaseUnit] = useState<MeasureUnit>(
    ingredient?.baseUnit ?? 'G',
  );
  const [isActive, setIsActive] = useState(ingredient?.isActive ?? true);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setFormError('Вкажіть назву інгредієнта.');
      setIsSubmitting(false);
      return;
    }

    try {
      const url = isEdit
        ? `/api/restaurants/${restaurantUuid}/ingredients/${ingredient!.uuid}`
        : `/api/restaurants/${restaurantUuid}/ingredients`;

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          baseUnit,
          ...(isEdit ? { isActive } : {}),
        }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(
          parseApiError(body, 'Не вдалося зберегти інгредієнт').message,
        );
        return;
      }

      router.push(ROUTES.restaurantIngredients(restaurantUuid));
      router.refresh();
    } catch {
      setFormError('Не вдалося зберегти інгредієнт.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || !ingredient) {
      return;
    }

    const confirmed = window.confirm(
      'Видалити інгредієнт? Він зникне зі списків, але залишиться в історії рецептів, де вже використовується.',
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setFormError('');

    try {
      const response = await fetch(
        `/api/restaurants/${restaurantUuid}/ingredients/${ingredient.uuid}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(
          parseApiError(body, 'Не вдалося видалити інгредієнт').message,
        );
        return;
      }

      router.push(ROUTES.restaurantIngredients(restaurantUuid));
      router.refresh();
    } catch {
      setFormError('Не вдалося видалити інгредієнт.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6"
    >
      <div className="grid gap-5">
        <Input
          label="Назва"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Картопля"
        />

        <MeasureUnitSelect
          value={baseUnit}
          onChange={setBaseUnit}
          hint="Одиниця для закупівлі та майбутнього складу."
        />

        {isEdit ? (
          <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4 accent-ink-950"
            />
            Активний інгредієнт
          </label>
        ) : null}

        {formError ? (
          <FormAlert className="text-[13px]">{formError}</FormAlert>
        ) : null}

        <Button type="submit" fullWidth disabled={isSubmitting || isDeleting}>
          {isSubmitting
            ? 'Збереження...'
            : isEdit
              ? 'Зберегти зміни'
              : 'Створити інгредієнт'}
        </Button>

        {isEdit ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            className="h-12 rounded-field border border-danger/20 bg-danger-50 px-5 text-sm font-extrabold text-danger transition hover:bg-danger-50/80 disabled:opacity-60"
          >
            {isDeleting ? 'Видалення...' : 'Видалити інгредієнт'}
          </button>
        ) : null}
      </div>
    </form>
  );
}
