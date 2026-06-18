'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormAlert, Input, Textarea } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import { getPhotoFileName, getRestaurantPhotoUrl } from '@/features/restaurant/lib/photo-url';
import {
  DAY_LABELS,
  buildEmptyWeekly,
  normalizeWeekly,
  type HoursOverride,
  type RestaurantHours,
  type TimeInterval,
  type WeeklyDayHours,
} from '@/features/restaurant/model/hours';
import type { Menu } from '@/features/menu/model/types';
import type { Table } from '@/features/table/model/types';

type MenuFormProps = {
  restaurantUuid: string;
  menu?: Menu;
  tables: Table[];
  initialHours?: RestaurantHours | null;
};

type WeeklyDayView = WeeklyDayHours & {
  isOpen: boolean;
};

function createDefaultInterval(): TimeInterval {
  return { opensAt: '09:00', closesAt: '22:00' };
}

export function MenuForm({
  restaurantUuid,
  menu,
  tables,
  initialHours = null,
}: MenuFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(menu);
  const [name, setName] = useState(menu?.name ?? '');
  const [description, setDescription] = useState(menu?.description ?? '');
  const [isActive, setIsActive] = useState(menu?.isActive ?? true);
  const [tableUuids, setTableUuids] = useState<string[]>(menu?.tableUuids ?? []);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(menu?.photo ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [weekly, setWeekly] = useState<WeeklyDayHours[]>(
    normalizeWeekly(initialHours?.weekly ?? buildEmptyWeekly()),
  );
  const [overrides, setOverrides] = useState<HoursOverride[]>(
    initialHours?.overrides ?? [],
  );
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weeklyWithState = useMemo<WeeklyDayView[]>(
    () =>
      weekly.map((day) => ({
        ...day,
        isOpen: day.intervals.length > 0,
      })),
    [weekly],
  );

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
    event.target.value = '';
  }

  function removeExistingPhoto() {
    setExistingPhoto(null);
  }

  function removeNewPhoto() {
    setPhotoFile(null);
  }

  function toggleTable(tableUuid: string) {
    setTableUuids((current) =>
      current.includes(tableUuid)
        ? current.filter((id) => id !== tableUuid)
        : [...current, tableUuid],
    );
  }

  function updateWeeklyDay(dayOfWeek: number, nextDay: WeeklyDayHours) {
    setWeekly((current) =>
      current.map((day) => (day.dayOfWeek === dayOfWeek ? nextDay : day)),
    );
  }

  function toggleDayOpen(dayOfWeek: number, open: boolean) {
    const day = weekly.find((item) => item.dayOfWeek === dayOfWeek);
    if (!day) {
      return;
    }

    updateWeeklyDay(dayOfWeek, {
      dayOfWeek,
      intervals: open ? [createDefaultInterval()] : [],
    });
  }

  function addOverride() {
    setOverrides((current) => [
      ...current,
      {
        date: new Date().toISOString().slice(0, 10),
        isClosed: false,
        intervals: [createDefaultInterval()],
      },
    ]);
  }

  function updateOverride(index: number, nextOverride: HoursOverride) {
    setOverrides((current) =>
      current.map((override, overrideIndex) =>
        overrideIndex === index ? nextOverride : override,
      ),
    );
  }

  function removeOverride(index: number) {
    setOverrides((current) =>
      current.filter((_, overrideIndex) => overrideIndex !== index),
    );
  }

  async function saveHours(menuUuid: string): Promise<string | null> {
    const response = await fetch(
      `/api/restaurants/${restaurantUuid}/menus/${menuUuid}/hours`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekly, overrides }),
      },
    );

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      return parseApiError(body, 'Не вдалося зберегти години меню').message;
    }

    return null;
  }

  async function saveTables(menuUuid: string): Promise<string | null> {
    const response = await fetch(
      `/api/restaurants/${restaurantUuid}/menus/${menuUuid}/tables`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableUuids }),
      },
    );

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      return parseApiError(body, 'Не вдалося привʼязати столики').message;
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setFormError('Вкажіть назву меню.');
      setIsSubmitting(false);
      return;
    }

    try {
      const useMultipart = Boolean(photoFile) || (isEdit && existingPhoto === null && menu?.photo);

      let saved: Menu;

      if (useMultipart) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', description.trim());
        formData.append('isActive', String(isActive));

        if (isEdit && menu?.photo && existingPhoto === null) {
          formData.append('removePhoto', 'true');
        }

        if (photoFile) {
          formData.append('photo', photoFile);
        }

        const url = isEdit
          ? `/api/restaurants/${restaurantUuid}/menus/${menu!.uuid}`
          : `/api/restaurants/${restaurantUuid}/menus`;

        const response = await fetch(url, {
          method: isEdit ? 'PATCH' : 'POST',
          body: formData,
        });

        if (!response.ok) {
          const body: unknown = await response.json().catch(() => undefined);
          setFormError(parseApiError(body, 'Не вдалося зберегти меню').message);
          return;
        }

        saved = (await response.json()) as Menu;
      } else if (isEdit) {
        const response = await fetch(
          `/api/restaurants/${restaurantUuid}/menus/${menu!.uuid}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              description: description.trim() || null,
              isActive,
            }),
          },
        );

        if (!response.ok) {
          const body: unknown = await response.json().catch(() => undefined);
          setFormError(parseApiError(body, 'Не вдалося зберегти меню').message);
          return;
        }

        saved = (await response.json()) as Menu;
      } else {
        const formData = new FormData();
        formData.append('name', name.trim());
        if (description.trim()) {
          formData.append('description', description.trim());
        }
        if (photoFile) {
          formData.append('photo', photoFile);
        }

        const response = await fetch(
          `/api/restaurants/${restaurantUuid}/menus`,
          { method: 'POST', body: formData },
        );

        if (!response.ok) {
          const body: unknown = await response.json().catch(() => undefined);
          setFormError(parseApiError(body, 'Не вдалося створити меню').message);
          return;
        }

        saved = (await response.json()) as Menu;
      }

      const tablesError = await saveTables(saved.uuid);
      if (tablesError) {
        setFormError(tablesError);
        return;
      }

      const hoursError = await saveHours(saved.uuid);
      if (hoursError) {
        setFormError(hoursError);
        return;
      }

      router.push(ROUTES.restaurantMenus(restaurantUuid));
      router.refresh();
    } catch {
      setFormError('Не вдалося зберегти меню.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6"
    >
      <section className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6">
        <div className="grid gap-5">
          <Input
            label="Назва меню"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Основне меню"
          />
          <Textarea
            label="Опис"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Короткий опис меню"
            rows={4}
          />

          <fieldset className="rounded-[26px] border border-line bg-paper-50 p-4">
            <legend className="px-2 text-sm font-black text-ink-800">
              Фото меню
            </legend>
            <div className="mt-2 grid gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handlePhotoChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-36 flex-col items-center justify-center rounded-[24px] border border-dashed border-paper-200 bg-white px-4 py-6 text-center transition hover:border-brand/40 hover:bg-brand-50/40"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-xl font-black text-brand-700">
                  +
                </span>
                <span className="mt-3 text-sm font-black text-ink-950">
                  {existingPhoto || photoFile ? 'Замінити фото' : 'Завантажити фото'}
                </span>
                <span className="mt-1 text-sm font-semibold text-ink-500">
                  JPEG, PNG, WebP або GIF, один файл
                </span>
              </button>

              {existingPhoto || photoFile ? (
                <div className="space-y-2">
                  {existingPhoto && !photoFile ? (
                    <div className="rounded-2xl border border-line bg-white px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={getRestaurantPhotoUrl(existingPhoto)}
                            alt={name || 'Фото меню'}
                            className="size-12 rounded-xl object-cover ring-1 ring-line"
                          />
                          <span className="min-w-0 truncate text-sm font-black text-ink-950">
                            {getPhotoFileName(existingPhoto)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeExistingPhoto}
                          className="shrink-0 text-sm font-black text-brand-700 underline-offset-4 hover:underline"
                        >
                          Видалити фото
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {photoFile ? (
                    <div className="rounded-2xl border border-line bg-white px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-black text-ink-950">
                          {photoFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={removeNewPhoto}
                          className="shrink-0 text-sm font-black text-brand-700 underline-offset-4 hover:underline"
                        >
                          Видалити фото
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </fieldset>

          <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4 accent-ink-950"
            />
            Активне меню
          </label>
        </div>
      </section>

      {tables.length > 0 ? (
        <section className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6">
          <h3 className="text-lg font-black text-ink-950">Привʼязані столики</h3>
          <p className="mt-2 text-sm font-semibold text-ink-500">
            Оберіть столики, на яких буде доступне це меню.
          </p>
          <div className="mt-4 space-y-2">
            {tables.map((table) => (
              <label
                key={table.uuid}
                className="flex items-center gap-2 text-sm font-semibold text-ink-700"
              >
                <input
                  type="checkbox"
                  checked={tableUuids.includes(table.uuid)}
                  onChange={() => toggleTable(table.uuid)}
                  className="size-4 accent-ink-950"
                />
                {table.label} ({table.zone})
              </label>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
          Години меню
        </p>
        <h3 className="mt-2 text-2xl font-black text-ink-950">
          Коли це меню доступне
        </h3>

        <div className="mt-5 grid gap-4">
          {weeklyWithState.map((day) => (
            <div
              key={day.dayOfWeek}
              className="rounded-[24px] border border-line bg-paper-50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-base font-black text-ink-950">
                  {DAY_LABELS[day.dayOfWeek - 1]}
                </h4>
                <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={(event) =>
                      toggleDayOpen(day.dayOfWeek, event.target.checked)
                    }
                    className="size-4 accent-ink-950"
                  />
                  Доступне
                </label>
              </div>
              {day.isOpen ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="time"
                    value={day.intervals[0]?.opensAt ?? '09:00'}
                    onChange={(event) =>
                      updateWeeklyDay(day.dayOfWeek, {
                        dayOfWeek: day.dayOfWeek,
                        intervals: [
                          {
                            opensAt: event.target.value,
                            closesAt: day.intervals[0]?.closesAt ?? '22:00',
                          },
                        ],
                      })
                    }
                    className="h-11 rounded-2xl border border-line bg-white px-3 text-sm font-medium text-ink-950"
                  />
                  <span className="text-sm font-bold text-ink-400">—</span>
                  <input
                    type="time"
                    value={day.intervals[0]?.closesAt ?? '22:00'}
                    onChange={(event) =>
                      updateWeeklyDay(day.dayOfWeek, {
                        dayOfWeek: day.dayOfWeek,
                        intervals: [
                          {
                            opensAt: day.intervals[0]?.opensAt ?? '09:00',
                            closesAt: event.target.value,
                          },
                        ],
                      })
                    }
                    className="h-11 rounded-2xl border border-line bg-white px-3 text-sm font-medium text-ink-950"
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm font-semibold text-ink-500">Недоступне</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-lg font-black text-ink-950">Винятки по датах</h4>
            <button
              type="button"
              onClick={addOverride}
              className="text-sm font-black text-brand-700"
            >
              + Додати виняток
            </button>
          </div>

          {overrides.length === 0 ? (
            <p className="text-sm font-semibold text-ink-500">
              Немає винятків. Додайте дату, якщо меню працює інакше або не
              доступне.
            </p>
          ) : (
            <div className="space-y-3">
              {overrides.map((override, index) => (
                <div
                  key={`${override.date}-${index}`}
                  className="rounded-[24px] border border-line bg-paper-50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="date"
                      value={override.date}
                      onChange={(event) =>
                        updateOverride(index, {
                          ...override,
                          date: event.target.value,
                        })
                      }
                      className="h-11 rounded-2xl border border-line bg-white px-3 text-sm font-medium text-ink-950"
                    />
                    <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
                      <input
                        type="checkbox"
                        checked={override.isClosed}
                        onChange={(event) =>
                          updateOverride(index, {
                            ...override,
                            isClosed: event.target.checked,
                            intervals: event.target.checked
                              ? []
                              : [createDefaultInterval()],
                          })
                        }
                        className="size-4 accent-ink-950"
                      />
                      Недоступне
                    </label>
                    <button
                      type="button"
                      onClick={() => removeOverride(index)}
                      className="ml-auto text-sm font-bold text-danger"
                    >
                      Прибрати
                    </button>
                  </div>

                  {!override.isClosed ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="time"
                        value={override.intervals[0]?.opensAt ?? '09:00'}
                        onChange={(event) =>
                          updateOverride(index, {
                            ...override,
                            intervals: [
                              {
                                opensAt: event.target.value,
                                closesAt:
                                  override.intervals[0]?.closesAt ?? '22:00',
                              },
                            ],
                          })
                        }
                        className="h-11 rounded-2xl border border-line bg-white px-3 text-sm font-medium text-ink-950"
                      />
                      <span className="text-sm font-bold text-ink-400">—</span>
                      <input
                        type="time"
                        value={override.intervals[0]?.closesAt ?? '22:00'}
                        onChange={(event) =>
                          updateOverride(index, {
                            ...override,
                            intervals: [
                              {
                                opensAt:
                                  override.intervals[0]?.opensAt ?? '09:00',
                                closesAt: event.target.value,
                              },
                            ],
                          })
                        }
                        className="h-11 rounded-2xl border border-line bg-white px-3 text-sm font-medium text-ink-950"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {formError ? (
        <FormAlert className="text-[13px]">{formError}</FormAlert>
      ) : null}

      <Button type="submit" disabled={isSubmitting} fullWidth>
        {isSubmitting
          ? 'Збереження...'
          : isEdit
            ? 'Зберегти зміни'
            : 'Створити меню'}
      </Button>
    </form>
  );
}
