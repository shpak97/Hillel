'use client';

import { useMemo, useState } from 'react';
import { Button, FormAlert } from '@/shared/ui';
import { parseApiError } from '@/shared/api/error-message';
import { getTimezoneLabel } from '@/shared/lib/timezone';
import {
  DAY_LABELS,
  buildEmptyWeekly,
  normalizeWeekly,
  isRestaurantHours,
  type HoursOverride,
  type RestaurantHours,
  type TimeInterval,
  type UpdateRestaurantHoursPayload,
  type WeeklyDayHours,
} from '@/features/restaurant/model/hours';

type RestaurantHoursFormProps = {
  restaurantUuid: string;
  initialHours: RestaurantHours | null;
};

type WeeklyDayView = WeeklyDayHours & {
  isOpen: boolean;
};

function createDefaultInterval(): TimeInterval {
  return { opensAt: '09:00', closesAt: '22:00' };
}

function formatResolvedToday(hours: RestaurantHours | null): string {
  if (!hours) {
    return 'Графік ще не налаштований';
  }

  const today = hours.resolvedToday;

  if (today.isClosed) {
    return 'Сьогодні: закрито';
  }

  if (today.intervals.length === 0) {
    return 'Сьогодні: закрито';
  }

  const ranges = today.intervals
    .map((interval) => `${interval.opensAt}–${interval.closesAt}`)
    .join(', ');

  return `Сьогодні: ${ranges}${today.isOpenNow ? ' · відкрито зараз' : ' · зараз закрито'}`;
}

export function RestaurantHoursForm({
  restaurantUuid,
  initialHours,
}: RestaurantHoursFormProps) {
  const [weekly, setWeekly] = useState<WeeklyDayHours[]>(
    normalizeWeekly(initialHours?.weekly ?? buildEmptyWeekly()),
  );
  const [overrides, setOverrides] = useState<HoursOverride[]>(
    initialHours?.overrides ?? [],
  );
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedPreview, setResolvedPreview] = useState(
    formatResolvedToday(initialHours),
  );

  const weeklyWithState = useMemo<WeeklyDayView[]>(
    () =>
      weekly.map((day) => ({
        ...day,
        isOpen: day.intervals.length > 0,
      })),
    [weekly],
  );

  function updateWeeklyDay(dayOfWeek: number, nextDay: WeeklyDayHours) {
    setWeekly((current) =>
      current.map((day) => (day.dayOfWeek === dayOfWeek ? nextDay : day)),
    );
  }

  function toggleDayOpen(dayOfWeek: number, isOpen: boolean) {
    const day = weekly.find((item) => item.dayOfWeek === dayOfWeek);
    if (!day) {
      return;
    }

    updateWeeklyDay(dayOfWeek, {
      dayOfWeek,
      intervals: isOpen ? [createDefaultInterval()] : [],
    });
  }

  function updateDayInterval(
    dayOfWeek: number,
    index: number,
    field: keyof TimeInterval,
    value: string,
  ) {
    const day = weekly.find((item) => item.dayOfWeek === dayOfWeek);
    if (!day) {
      return;
    }

    const intervals = day.intervals.map((interval, intervalIndex) =>
      intervalIndex === index ? { ...interval, [field]: value } : interval,
    );

    updateWeeklyDay(dayOfWeek, { dayOfWeek, intervals });
  }

  function addDayInterval(dayOfWeek: number) {
    const day = weekly.find((item) => item.dayOfWeek === dayOfWeek);
    if (!day) {
      return;
    }

    updateWeeklyDay(dayOfWeek, {
      dayOfWeek,
      intervals: [...day.intervals, createDefaultInterval()],
    });
  }

  function removeDayInterval(dayOfWeek: number, index: number) {
    const day = weekly.find((item) => item.dayOfWeek === dayOfWeek);
    if (!day) {
      return;
    }

    const intervals = day.intervals.filter((_, intervalIndex) => intervalIndex !== index);
    updateWeeklyDay(dayOfWeek, { dayOfWeek, intervals });
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

  async function handleSubmit(): Promise<void> {
    setFormError('');
    setIsSubmitting(true);

    const payload: UpdateRestaurantHoursPayload = {
      weekly,
      overrides,
    };

    try {
      const response = await fetch(`/api/restaurants/${restaurantUuid}/hours`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(
          parseApiError(body, 'Не вдалося зберегти години роботи').message,
        );
        return;
      }

      const saved: unknown = await response.json();

      if (!isRestaurantHours(saved)) {
        setFormError('Некоректна відповідь сервера.');
        return;
      }

      setWeekly(normalizeWeekly(saved.weekly));
      setOverrides(saved.overrides);
      setResolvedPreview(formatResolvedToday(saved));
    } catch {
      setFormError('Не вдалося зберегти години роботи.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            Години роботи
          </p>
          <h3 className="mt-2 text-2xl font-black text-ink-950">
            Тижневий розклад і винятки
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink-500">
            {resolvedPreview}
          </p>
          {initialHours?.timezone ? (
            <p className="mt-2 text-sm font-semibold text-ink-500">
              Часовий пояс: {getTimezoneLabel(initialHours.timezone)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
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
                Працює
              </label>
            </div>

            {day.isOpen ? (
              <div className="mt-3 space-y-2">
                {day.intervals.map((interval, index) => (
                  <div
                    key={`${day.dayOfWeek}-${index}`}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input
                      type="time"
                      value={interval.opensAt}
                      onChange={(event) =>
                        updateDayInterval(
                          day.dayOfWeek,
                          index,
                          'opensAt',
                          event.target.value,
                        )
                      }
                      className="h-11 rounded-2xl border border-line bg-white px-3 text-sm font-medium text-ink-950"
                    />
                    <span className="text-sm font-bold text-ink-400">—</span>
                    <input
                      type="time"
                      value={interval.closesAt}
                      onChange={(event) =>
                        updateDayInterval(
                          day.dayOfWeek,
                          index,
                          'closesAt',
                          event.target.value,
                        )
                      }
                      className="h-11 rounded-2xl border border-line bg-white px-3 text-sm font-medium text-ink-950"
                    />
                    <button
                      type="button"
                      onClick={() => removeDayInterval(day.dayOfWeek, index)}
                      className="text-sm font-bold text-danger"
                    >
                      Видалити
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addDayInterval(day.dayOfWeek)}
                  className="text-sm font-black text-brand-700"
                >
                  + Додати інтервал
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-ink-500">Закрито</p>
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
            Немає винятків. Додайте дату, якщо потрібен інший графік або вихідний.
          </p>
        ) : (
          <div className="space-y-3">
            {overrides.map((override, index) => (
              <div
                key={`${override.date}-${index}`}
                className="rounded-[24px] border border-line bg-white p-4"
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
                          intervals: event.target.checked ? [] : [createDefaultInterval()],
                        })
                      }
                      className="size-4 accent-ink-950"
                    />
                    Закрито
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
                  <div className="mt-3 space-y-2">
                    {override.intervals.map((interval, intervalIndex) => (
                      <div
                        key={`${override.date}-${intervalIndex}`}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input
                          type="time"
                          value={interval.opensAt}
                          onChange={(event) => {
                            const intervals = override.intervals.map((item, idx) =>
                              idx === intervalIndex
                                ? { ...item, opensAt: event.target.value }
                                : item,
                            );
                            updateOverride(index, { ...override, intervals });
                          }}
                          className="h-11 rounded-2xl border border-line bg-white px-3 text-sm font-medium text-ink-950"
                        />
                        <span className="text-sm font-bold text-ink-400">—</span>
                        <input
                          type="time"
                          value={interval.closesAt}
                          onChange={(event) => {
                            const intervals = override.intervals.map((item, idx) =>
                              idx === intervalIndex
                                ? { ...item, closesAt: event.target.value }
                                : item,
                            );
                            updateOverride(index, { ...override, intervals });
                          }}
                          className="h-11 rounded-2xl border border-line bg-white px-3 text-sm font-medium text-ink-950"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {formError ? (
        <FormAlert className="mt-4 text-[13px]">{formError}</FormAlert>
      ) : null}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-6"
        fullWidth
      >
        {isSubmitting ? 'Збереження...' : 'Зберегти години роботи'}
      </Button>
    </section>
  );
}
