'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormAlert, Input, Textarea, TimezoneSelect, CurrencySelect } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import { resolveInitialTimezone } from '@/shared/lib/timezone';
import { DEFAULT_CURRENCY, type SupportedCurrency } from '@/shared/model/currency';
import { PUBLIC_MENU_BASE, generateSlugFromTitle } from '@/features/restaurant/lib/slug';
import {
  MAX_RESTAURANT_PHOTOS,
  validateCreateRestaurantForm,
  type CreateRestaurantFormErrors,
} from '@/features/restaurant/lib/validation';
import { RestaurantCreatePreview } from '@/features/restaurant/components/RestaurantCreatePreview';

export function RestaurantCreateForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [timezone, setTimezone] = useState(() => resolveInitialTimezone());
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<CreateRestaurantFormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(generateSlugFromTitle(value));
    }
  }

  function handlePhotosChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    setPhotos(selectedFiles.slice(0, MAX_RESTAURANT_PHOTOS));
    event.target.value = '';
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const values = { title, slug, description, address, photos };
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
    formData.append('currency', currency);
    for (const photo of photos) {
      formData.append('photos', photo);
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        setFormError(parseApiError(body, 'Не вдалося створити ресторан').message);
        return;
      }

      router.push(ROUTES.restaurants);
      router.refresh();
    } catch {
      setFormError('Не вдалося створити ресторан. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
      <section className="rounded-[30px] bg-card p-5 shadow-[0_24px_70px_-55px_rgba(23,21,18,0.75)] ring-1 ring-line sm:p-6">
        <div className="grid gap-5">
          <Input
            label="Назва ресторану"
            name="title"
            placeholder="Наприклад, Bistro 21"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
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
                placeholder="bistro-21"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                className="h-14 min-w-0 flex-1 bg-white px-4 text-[16px] font-medium text-ink-950 outline-none placeholder:text-ink-400"
              />
            </div>
            {errors.slug ? (
              <p className="mt-2 rounded-2xl bg-danger-50 px-3 py-2 text-[13px] font-bold leading-5 text-danger ring-1 ring-danger/10">
                {errors.slug}
              </p>
            ) : (
              <p className="mt-2 text-[13px] font-semibold leading-5 text-ink-500">
                Унікальне коротке посилання ресторану. Використовуйте латиницю,
                цифри та дефіси.
              </p>
            )}
          </div>

          <Textarea
            label="Опис"
            name="description"
            rows={5}
            placeholder="Коротко опишіть ресторан для сторінки QR-меню"
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

          <CurrencySelect
            value={currency}
            onChange={setCurrency}
            hint="Валюта для цін продуктів і меню цього ресторану."
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
                  Завантажити фото
                </span>
                <span className="mt-1 text-sm font-semibold text-ink-500">
                  JPEG, PNG, WebP або GIF, до {MAX_RESTAURANT_PHOTOS} файлів
                </span>
              </button>

              {photos.length > 0 ? (
                <ul className="grid gap-2">
                  {photos.map((photo, index) => (
                    <li
                      key={`${photo.name}-${photo.size}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm font-semibold text-ink-700">
                        {photo.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="shrink-0 text-sm font-bold text-danger transition hover:text-danger/80"
                      >
                        Видалити
                      </button>
                    </li>
                  ))}
                </ul>
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
          photosCount={photos.length}
        />
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Створення...' : 'Створити ресторан'}
        </Button>
      </div>
    </form>
  );
}
