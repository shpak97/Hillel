'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormAlert, Input } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import type { Menu } from '@/features/menu/model/types';
import type { Table } from '@/features/table/model/types';

type TableFormProps = {
  restaurantUuid: string;
  table?: Table;
  menus: Menu[];
};

export function TableForm({
  restaurantUuid,
  table,
  menus,
}: TableFormProps) {
  const router = useRouter();
  const isEdit = Boolean(table);
  const [label, setLabel] = useState(table?.label ?? '');
  const [zone, setZone] = useState(table?.zone ?? '');
  const [seats, setSeats] = useState(String(table?.seats ?? 2));
  const [isActive, setIsActive] = useState(table?.isActive ?? true);
  const [menuUuids, setMenuUuids] = useState<string[]>(table?.menuUuids ?? []);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleMenu(menuUuid: string) {
    setMenuUuids((current) =>
      current.includes(menuUuid)
        ? current.filter((id) => id !== menuUuid)
        : [...current, menuUuid],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const seatsNumber = Number(seats);

    if (!label.trim() || !zone.trim() || !Number.isFinite(seatsNumber) || seatsNumber < 1) {
      setFormError('Заповніть усі обовʼязкові поля.');
      setIsSubmitting(false);
      return;
    }

    try {
      const url = isEdit
        ? `/api/restaurants/${restaurantUuid}/tables/${table!.uuid}`
        : `/api/restaurants/${restaurantUuid}/tables`;

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          zone: zone.trim(),
          seats: seatsNumber,
          ...(isEdit ? { isActive } : {}),
        }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(parseApiError(body, 'Не вдалося зберегти столик').message);
        return;
      }

      const saved = (await response.json()) as Table;

      if (isEdit) {
        const menusResponse = await fetch(
          `/api/restaurants/${restaurantUuid}/tables/${saved.uuid}/menus`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menuUuids }),
          },
        );

        if (!menusResponse.ok) {
          const body: unknown = await menusResponse.json().catch(() => undefined);
          setFormError(
            parseApiError(body, 'Столик збережено, але меню не оновлено').message,
          );
          return;
        }
      }

      router.push(ROUTES.restaurantTables(restaurantUuid));
      router.refresh();
    } catch {
      setFormError('Не вдалося зберегти столик.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Назва столика"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="T-01"
        />
        <Input
          label="Зона"
          value={zone}
          onChange={(event) => setZone(event.target.value)}
          placeholder="Тераса"
        />
        <Input
          label="Місць"
          type="number"
          min={1}
          value={seats}
          onChange={(event) => setSeats(event.target.value)}
        />
      </div>

      {isEdit ? (
        <label className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-ink-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="size-4 accent-ink-950"
          />
          Активний столик
        </label>
      ) : null}

      {isEdit && menus.length > 0 ? (
        <div className="mt-6 border-t border-line pt-6">
          <h3 className="text-lg font-black text-ink-950">Привʼязані меню</h3>
          <div className="mt-3 space-y-2">
            {menus.map((menu) => (
              <label
                key={menu.uuid}
                className="flex items-center gap-2 text-sm font-semibold text-ink-700"
              >
                <input
                  type="checkbox"
                  checked={menuUuids.includes(menu.uuid)}
                  onChange={() => toggleMenu(menu.uuid)}
                  className="size-4 accent-ink-950"
                />
                {menu.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {formError ? (
        <FormAlert className="mt-4 text-[13px]">{formError}</FormAlert>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="mt-6" fullWidth>
        {isSubmitting ? 'Збереження...' : isEdit ? 'Зберегти зміни' : 'Створити столик'}
      </Button>
    </form>
  );
}
