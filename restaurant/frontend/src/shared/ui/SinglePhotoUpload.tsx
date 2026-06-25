'use client';

import { useRef } from 'react';
import {
  getPhotoFileName,
  getRestaurantPhotoUrl,
} from '@/features/restaurant/lib/photo-url';

type SinglePhotoUploadProps = {
  legend: string;
  optional?: boolean;
  existingPhoto: string | null;
  photoFile: File | null;
  onExistingPhotoChange: (photo: string | null) => void;
  onPhotoFileChange: (file: File | null) => void;
  previewAlt?: string;
};

export function SinglePhotoUpload({
  legend,
  optional = false,
  existingPhoto,
  photoFile,
  onExistingPhotoChange,
  onPhotoFileChange,
  previewAlt = 'Фото',
}: SinglePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    onPhotoFileChange(file);
    event.target.value = '';
  }

  return (
    <fieldset className="rounded-[26px] border border-line bg-paper-50 p-4">
      <legend className="px-2 text-sm font-black text-ink-800">
        {legend}{' '}
        {optional ? (
          <span className="font-semibold text-ink-400">(необов&apos;язково)</span>
        ) : null}
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
                      alt={previewAlt}
                      className="size-12 rounded-xl object-cover ring-1 ring-line"
                    />
                    <span className="min-w-0 truncate text-sm font-black text-ink-950">
                      {getPhotoFileName(existingPhoto)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onExistingPhotoChange(null)}
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
                    onClick={() => onPhotoFileChange(null)}
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
  );
}
