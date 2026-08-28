'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormAlert, Input } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import type { Menu } from '@/features/menu/model/types';
import type {
  QrCode,
  QrCodeMenuInput,
} from '@/features/qr-code/model/types';

type QrCodeFormProps = {
  restaurantUuid: string;
  menus: Menu[];
  qrCode?: QrCode;
};

export function QrCodeForm({ restaurantUuid, menus, qrCode }: QrCodeFormProps) {
  const router = useRouter();
  const isEdit = Boolean(qrCode);
  const [name, setName] = useState(qrCode?.name ?? '');
  const [isActive, setIsActive] = useState(qrCode?.isActive ?? true);
  const [selectedMenus, setSelectedMenus] = useState<QrCodeMenuInput[]>(() =>
    (qrCode?.menus ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((menu) => ({
        menuId: menu.menuId,
        selectTable: menu.selectTable,
      })),
  );
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectableMenus = useMemo(() => {
    const selectedIds = new Set(selectedMenus.map((item) => item.menuId));
    return menus.filter((menu) => menu.isActive || selectedIds.has(menu.uuid));
  }, [menus, selectedMenus]);

  function isMenuSelected(menuId: string) {
    return selectedMenus.some((item) => item.menuId === menuId);
  }

  function getSelectTable(menuId: string) {
    return (
      selectedMenus.find((item) => item.menuId === menuId)?.selectTable ?? false
    );
  }

  function toggleMenu(menuId: string) {
    setSelectedMenus((prev) => {
      if (prev.some((item) => item.menuId === menuId)) {
        return prev.filter((item) => item.menuId !== menuId);
      }
      return [...prev, { menuId, selectTable: false }];
    });
  }

  function setMenuSelectTable(menuId: string, selectTable: boolean) {
    setSelectedMenus((prev) =>
      prev.map((item) =>
        item.menuId === menuId ? { ...item, selectTable } : item,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setFormError('Вкажіть назву QR-коду.');
      setIsSubmitting(false);
      return;
    }

    if (selectedMenus.length === 0) {
      setFormError('Оберіть хоча б одне меню.');
      setIsSubmitting(false);
      return;
    }

    try {
      const url = isEdit
        ? `/api/restaurants/${restaurantUuid}/qr-codes/${qrCode!.uuid}`
        : `/api/restaurants/${restaurantUuid}/qr-codes`;

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          menus: selectedMenus,
          ...(isEdit ? { isActive } : {}),
        }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(parseApiError(body, 'Не вдалося зберегти QR-код').message);
        return;
      }

      const saved = (await response.json()) as QrCode;
      router.push(ROUTES.restaurantQrCodeEdit(restaurantUuid, saved.uuid));
      router.refresh();
    } catch {
      setFormError('Не вдалося зберегти QR-код.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || !qrCode) {
      return;
    }

    const confirmed = window.confirm('Видалити цей QR-код?');
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setFormError('');

    try {
      const response = await fetch(
        `/api/restaurants/${restaurantUuid}/qr-codes/${qrCode.uuid}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(
          parseApiError(body, 'Не вдалося видалити QR-код').message,
        );
        return;
      }

      router.push(ROUTES.restaurantQrCodes(restaurantUuid));
      router.refresh();
    } catch {
      setFormError('Не вдалося видалити QR-код.');
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
          placeholder="Літній двір / Основне меню"
        />

        {isEdit ? (
          <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4 accent-ink-950"
            />
            Активний QR-код
          </label>
        ) : null}

        <div>
          <h3 className="text-lg font-black text-ink-950">Меню в QR</h3>
          <p className="mt-1 text-sm font-semibold text-ink-500">
            Для кожного меню можна увімкнути вибір столика гостем.
          </p>

          {selectableMenus.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-ink-500">
              Немає активних меню. Спочатку створіть меню.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {selectableMenus.map((menu) => {
                const selected = isMenuSelected(menu.uuid);
                return (
                  <div
                    key={menu.uuid}
                    className="rounded-field border border-line bg-paper-50 px-4 py-3"
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMenu(menu.uuid)}
                        className="size-4 accent-ink-950"
                      />
                      <span className="font-extrabold text-ink-950">
                        {menu.name}
                      </span>
                      {!menu.isActive ? (
                        <span className="text-xs font-black text-ink-400">
                          (вимкнено)
                        </span>
                      ) : null}
                    </label>

                    {selected ? (
                      <label className="mt-3 ml-6 inline-flex items-center gap-2 text-sm font-bold text-ink-600">
                        <input
                          type="checkbox"
                          checked={getSelectTable(menu.uuid)}
                          onChange={(event) =>
                            setMenuSelectTable(menu.uuid, event.target.checked)
                          }
                          className="size-4 accent-ink-950"
                        />
                        Гість обирає столик
                      </label>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {formError ? (
          <FormAlert className="text-[13px]">{formError}</FormAlert>
        ) : null}

        <Button type="submit" fullWidth disabled={isSubmitting || isDeleting}>
          {isSubmitting
            ? 'Збереження...'
            : isEdit
              ? 'Зберегти зміни'
              : 'Створити QR-код'}
        </Button>

        {isEdit ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            className="h-12 rounded-field border border-danger/20 bg-danger-50 px-5 text-sm font-extrabold text-danger transition hover:bg-danger-50/80 disabled:opacity-60"
          >
            {isDeleting ? 'Видалення...' : 'Видалити QR-код'}
          </button>
        ) : null}
      </div>
    </form>
  );
}
