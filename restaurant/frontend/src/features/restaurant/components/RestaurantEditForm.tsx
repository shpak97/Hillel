'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormAlert, Input, Textarea, TimezoneSelect } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import { resolveInitialTimezone } from '@/shared/lib/timezone';
import { PUBLIC_MENU_BASE } from '@/features/restaurant/lib/slug';
import {
  MAX_RESTAURANT_PHOTOS,
  validateCreateRestaurantForm,
  type CreateRestaurantFormErrors,
} from '@/features/restaurant/lib/validation';
import { getPhotoFileName } from '@/features/restaurant/lib/photo-url';
import type { Restaurant } from '@/features/restaurant/model/types';
import { RestaurantCreatePreview } from '@/features/restaurant/components/RestaurantCreatePreview';

type RestaurantEditFormProps = {
  restaurant: Restaurant;
  ownerEmail?: string;
};

export function RestaurantEditForm({
  restaurant,
  ownerEmail,
}: RestaurantEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(restaurant.title);
  const [slug, setSlug] = useState(restaurant.slug);
  const [description, setDescription] = useState(restaurant.description);
  const [address, setAddress] = useState(restaurant.address ?? '');
  const [timezone, setTimezone] = useState(() =>
    resolveInitialTimezone(restaurant.timezone),
  );
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    restaurant.photos,
  );
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [isActive, setIsActive] = useState(restaurant.isActive);
  const [errors, setErrors] = useState<CreateRestaurantFormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  function handlePhotosChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const totalCount = existingPhotos.length + newPhotos.length + selectedFiles.length;

    if (totalCount > MAX_RESTAURANT_PHOTOS) {
      setErrors({
        photos: `Максимум ${MAX_RESTAURANT_PHOTOS} фото`,
      });
      event.target.value = '';
      return;
    }

    setErrors((current) => ({ ...current, photos: undefined }));
    setNewPhotos((current) => [...current, ...selectedFiles]);
    event.target.value = '';
  }

  function removeExistingPhoto(path: string) {
    setExistingPhotos((current) => current.filter((photo) => photo !== path));
  }

  function removeNewPhoto(index: number) {
    setNewPhotos((current) =>
      current.filter((_, photoIndex) => photoIndex !== index),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const values = {
      title,
      slug,
      description,
      address,
      photos: newPhotos,
    };
    const nextErrors = validateCreateRestaurantForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('slug', slug.trim());
    formData.append('description', description.trim());
    formData.append('address', address.trim());
    formData.append('timezone', timezone);
    formData.append('existingPhotos', JSON.stringify(existingPhotos));
    for (const photo of newPhotos) {
      formData.append('photos', photo);
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurant.uuid}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        setFormError(parseApiError(body, 'Не вдалося зберегти зміни').message);
        return;
      }

      router.push(ROUTES.restaurants);
      router.refresh();
    } catch {
      setFormError('Не вдалося зберегти зміни. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive() {
    const isDeactivating = isActive;
    const confirmed = window.confirm(
      isDeactivating
        ? 'Вимкнути ресторан? Він зникне з публічного меню, але залишиться в адмінці.'
        : 'Увімкнути ресторан знову?',
    );

    if (!confirmed) {
      return;
    }

    setIsTogglingStatus(true);
    setFormError('');

    try {
      const response = await fetch(
        `/api/restaurants/${restaurant.uuid}/${isDeactivating ? 'deactivate' : 'activate'}`,
        { method: 'PATCH' },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        setFormError(
          parseApiError(body, 'Не вдалося змінити статус ресторану').message,
        );
        return;
      }

      const updated = (await response.json()) as Restaurant;
      setIsActive(updated.isActive);
      router.refresh();
    } catch {
      setFormError('Не вдалося змінити статус ресторану.');
    } finally {
      setIsTogglingStatus(false);
    }
  }

  const photosCount = existingPhotos.length + newPhotos.length;

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
      <section className="rounded-[30px] bg-card p-5 shadow-[0_24px_70px_-55px_rgba(23,21,18,0.75)] ring-1 ring-line sm:p-6">
        <div className="grid gap-5">
          <Input
            label="Назва ресторану"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            error={errors.title}
          />

          <div className="w-full">
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-black text-ink-800"
            >
              Slug
            </label>
            <div className="flex overflow-hidden rounded-field border border-line bg-white transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
              <span className="hidden items-center border-r border-line bg-paper-50 px-4 text-sm font-bold text-ink-500 sm:flex">
                {PUBLIC_MENU_BASE}/
              </span>
              <input
                id="slug"
                name="slug"
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className="h-14 min-w-0 flex-1 bg-white px-4 text-[16px] font-medium text-ink-950 outline-none"
              />
            </div>
            {errors.slug ? (
              <p className="mt-2 rounded-2xl bg-danger-50 px-3 py-2 text-[13px] font-bold leading-5 text-danger ring-1 ring-danger/10">
                {errors.slug}
              </p>
            ) : null}
          </div>

          <Textarea
            label="Опис"
            name="description"
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            error={errors.description}
          />

          <Input
            label="Адреса"
            name="address"
            placeholder="Наприклад, вул. Хрещатик, 1, Київ"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            error={errors.address}
            hint="Необов'язково"
          />

          <TimezoneSelect
            value={timezone}
            onChange={setTimezone}
            hint="Застосовується до годин ресторану, меню та розрахунку «відкрито зараз»."
          />

          <fieldset className="rounded-[26px] border border-line bg-paper-50 p-4">
            <legend className="px-2 text-sm font-black text-ink-800">
              Фото ресторану{' '}
              <span className="font-semibold text-ink-400">(необов&apos;язково)</span>
            </legend>
            <div className="mt-2 grid gap-3">
              <input
                ref={fileInputRef}
                type="file"
                name="photos"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                onChange={handlePhotosChange}
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
                  Завантажити ще фото
                </span>
                <span className="mt-1 text-sm font-semibold text-ink-500">
                  JPEG, PNG, WebP або GIF, до {MAX_RESTAURANT_PHOTOS} файлів
                </span>
              </button>

              {existingPhotos.length > 0 || newPhotos.length > 0 ? (
                <div className="space-y-2">
                  {existingPhotos.map((photo) => (
                    <div
                      key={photo}
                      className="rounded-2xl border border-line bg-white px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-black text-ink-950">
                          {getPhotoFileName(photo)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(photo)}
                          className="shrink-0 text-sm font-black text-brand-700 underline-offset-4 hover:underline"
                        >
                          Видалити фото
                        </button>
                      </div>
                    </div>
                  ))}
                  {newPhotos.map((photo, index) => (
                    <div
                      key={`${photo.name}-${photo.size}-${index}`}
                      className="rounded-2xl border border-line bg-white px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-black text-ink-950">
                          {photo.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(index)}
                          className="shrink-0 text-sm font-black text-brand-700 underline-offset-4 hover:underline"
                        >
                          Видалити фото
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {errors.photos ? (
                <p className="rounded-2xl bg-danger-50 px-3 py-2 text-[13px] font-bold leading-5 text-danger ring-1 ring-danger/10">
                  {errors.photos}
                </p>
              ) : null}
            </div>
          </fieldset>

          {formError ? (
            <FormAlert className="text-[13px]">{formError}</FormAlert>
          ) : null}
        </div>
      </section>

      <div className="space-y-4">
        <RestaurantCreatePreview
          title={title}
          slug={slug}
          description={description}
          address={address}
          photosCount={photosCount}
          isActive={isActive}
          systemFields={[
            { label: 'uuid', value: restaurant.uuid },
            { label: 'ownerId', value: String(restaurant.ownerId) },
            { label: 'owner', value: ownerEmail ?? 'поточний користувач' },
          ]}
        />

        <section className="rounded-[30px] bg-card p-5 ring-1 ring-line">
          <h3 className="text-lg font-black text-ink-950">Керування рестораном</h3>
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isTogglingStatus}
              className="h-12 rounded-field border border-line bg-white px-5 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50 disabled:opacity-60"
            >
              {isTogglingStatus
                ? 'Оновлення...'
                : isActive
                  ? 'Вимкнути ресторан'
                  : 'Увімкнути ресторан'}
            </button>
          </div>
          <p className="mt-3 text-[13px] font-semibold leading-5 text-ink-500">
            Вимкнення приховує ресторан із публічного меню, але він залишається
            в адмінці.
          </p>
        </section>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
        </Button>
      </div>
    </form>
  );
}
