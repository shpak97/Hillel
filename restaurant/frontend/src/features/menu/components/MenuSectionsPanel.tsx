'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormAlert, Input } from '@/shared/ui';
import { parseApiError } from '@/shared/api/error-message';
import type { MenuSection } from '@/features/menu/model/section-types';
import type { MenuItem, SectionMenuItem } from '@/features/menu/model/item-types';
import type { SupportedCurrency } from '@/shared/model/currency';
import { MenuSectionItems } from '@/features/menu/components/MenuSectionItems';

type MenuSectionsPanelProps = {
  restaurantUuid: string;
  menuUuid: string;
  currency: SupportedCurrency;
  catalogItems: MenuItem[];
  initialSections: MenuSection[];
  initialLinkedItemsBySection: Record<string, SectionMenuItem[]>;
};

export function MenuSectionsPanel({
  restaurantUuid,
  menuUuid,
  currency,
  catalogItems,
  initialSections,
  initialLinkedItemsBySection,
}: MenuSectionsPanelProps) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiBase = `/api/restaurants/${restaurantUuid}/menus/${menuUuid}/sections`;

  async function handleCreate() {
    if (!newName.trim()) {
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(parseApiError(body, 'Не вдалося створити розділ').message);
        return;
      }

      const created = (await response.json()) as MenuSection;
      setSections((current) => [...current, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setNewName('');
      router.refresh();
    } catch {
      setFormError('Не вдалося створити розділ.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(section: MenuSection) {
    setEditingId(section.uuid);
    setEditName(section.name);
    setEditIsActive(section.isActive);
    setFormError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditIsActive(true);
  }

  async function saveEdit(sectionUuid: string) {
    if (!editName.trim()) {
      setFormError('Вкажіть назву розділу.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/${sectionUuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          isActive: editIsActive,
        }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(parseApiError(body, 'Не вдалося оновити розділ').message);
        return;
      }

      const updated = (await response.json()) as MenuSection;
      setSections((current) =>
        current
          .map((section) => (section.uuid === sectionUuid ? updated : section))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      cancelEdit();
      router.refresh();
    } catch {
      setFormError('Не вдалося оновити розділ.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(section: MenuSection) {
    const confirmed = window.confirm(
      `Видалити розділ «${section.name}»? Позиції всередині також зникнуть з меню.`,
    );

    if (!confirmed) {
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/${section.uuid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(parseApiError(body, 'Не вдалося видалити розділ').message);
        return;
      }

      setSections((current) =>
        current.filter((item) => item.uuid !== section.uuid),
      );
      if (editingId === section.uuid) {
        cancelEdit();
      }
      router.refresh();
    } catch {
      setFormError('Не вдалося видалити розділ.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6">
      <div className="mb-5">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
          Menu structure
        </p>
        <h3 className="mt-2 text-2xl font-black text-ink-950">Розділи меню</h3>
        <p className="mt-2 text-sm font-semibold text-ink-500">
          Наприклад: «Перші страви», «Напої». Порядок задає бекенд автоматично.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <Input
            label="Новий розділ"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Перші страви"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            disabled={isSubmitting || !newName.trim()}
            onClick={() => {
              void handleCreate();
            }}
          >
            Додати
          </Button>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="text-sm font-semibold text-ink-500">
          Ще немає розділів. Додайте перший.
        </p>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.uuid}
              className="rounded-[24px] border border-line bg-paper-50 p-4"
            >
              {editingId === section.uuid ? (
                <div className="grid gap-3">
                  <Input
                    label="Назва розділу"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                  />
                  <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(event) => setEditIsActive(event.target.checked)}
                      className="size-4 accent-ink-950"
                    />
                    Активний розділ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => saveEdit(section.uuid)}
                    >
                      Зберегти
                    </Button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="h-12 rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950"
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-black text-ink-950">
                        {section.name}
                      </h4>
                      {!section.isActive ? (
                        <span className="rounded-pill bg-paper-100 px-3 py-1 text-xs font-black text-ink-400">
                          Вимкнено
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-ink-500">
                      Порядок: {section.sortOrder + 1}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(section)}
                      className="h-11 rounded-field border border-line bg-white px-4 text-sm font-extrabold text-ink-950"
                    >
                      Редагувати
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(section)}
                      disabled={isSubmitting}
                      className="h-11 rounded-field border border-danger/20 bg-danger-50 px-4 text-sm font-extrabold text-danger"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              )}

              <MenuSectionItems
                restaurantUuid={restaurantUuid}
                menuUuid={menuUuid}
                sectionUuid={section.uuid}
                currency={currency}
                catalogItems={catalogItems}
                initialLinkedItems={initialLinkedItemsBySection[section.uuid] ?? []}
              />
            </div>
          ))}
        </div>
      )}

      {formError ? (
        <FormAlert className="mt-4 text-[13px]">{formError}</FormAlert>
      ) : null}
    </section>
  );
}
