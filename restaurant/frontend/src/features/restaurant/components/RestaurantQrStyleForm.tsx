'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button, FormAlert, Input } from '@/shared/ui';
import { parseApiError } from '@/shared/api/error-message';
import { QrStylePreview } from '@/features/restaurant/components/QrStylePreview';
import { getUploadPublicUrl } from '@/features/qr-code/lib/upload-public-url';
import {
  CORNER_DOT_OPTIONS,
  CORNER_SQUARE_OPTIONS,
  DOT_TYPE_OPTIONS,
  createDefaultGradient,
  normalizeQrStyleForEditor,
  type QrCornerDotType,
  type QrCornerSquareType,
  type QrDotType,
  type QrGradient,
  type RestaurantQrStyle,
  type RestaurantQrStyleResponse,
} from '@/features/restaurant/model/qr-style';

type RestaurantQrStyleFormProps = {
  restaurantUuid: string;
  restaurantSlug: string;
  initial: RestaurantQrStyleResponse;
};

type ColorMode = 'single' | 'gradient';

function ColorModeToggle({
  mode,
  onChange,
}: {
  mode: ColorMode;
  onChange: (mode: ColorMode) => void;
}) {
  return (
    <div className="inline-flex rounded-field border border-line bg-paper-50 p-1">
      {(['single', 'gradient'] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`rounded-[10px] px-3 py-1.5 text-xs font-extrabold transition ${
            mode === item
              ? 'bg-ink-950 text-white'
              : 'text-ink-500 hover:text-ink-950'
          }`}
        >
          {item === 'single' ? 'Single color' : 'Gradient'}
        </button>
      ))}
    </div>
  );
}

function GradientFields({
  gradient,
  onChange,
}: {
  gradient: QrGradient;
  onChange: (gradient: QrGradient) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm font-bold text-ink-600">
        Gradient type
        <select
          value={gradient.type}
          onChange={(event) =>
            onChange({
              ...gradient,
              type: event.target.value as QrGradient['type'],
            })
          }
          className="h-11 rounded-field border border-line bg-white px-3 text-sm font-semibold text-ink-950"
        >
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold text-ink-600">
        Rotation
        <input
          type="number"
          value={gradient.rotation ?? 0}
          onChange={(event) =>
            onChange({
              ...gradient,
              rotation: Number(event.target.value) || 0,
            })
          }
          className="h-11 rounded-field border border-line bg-white px-3 text-sm font-semibold text-ink-950"
        />
      </label>
      {gradient.colorStops.map((stop, index) => (
        <label
          key={index}
          className="grid gap-1 text-sm font-bold text-ink-600"
        >
          Stop {index + 1}
          <input
            type="color"
            value={stop.color}
            onChange={(event) => {
              const colorStops = gradient.colorStops.map((item, itemIndex) =>
                itemIndex === index
                  ? { ...item, color: event.target.value }
                  : item,
              );
              onChange({ ...gradient, colorStops });
            }}
            className="h-11 w-full cursor-pointer rounded-field border border-line bg-white px-2"
          />
        </label>
      ))}
    </div>
  );
}

export function RestaurantQrStyleForm({
  restaurantUuid,
  restaurantSlug,
  initial,
}: RestaurantQrStyleFormProps) {
  const [style, setStyle] = useState<RestaurantQrStyle>(() =>
    normalizeQrStyleForEditor(initial.style),
  );
  const [logoPath, setLogoPath] = useState<string | null>(initial.logo);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    initial.logo ? getUploadPublicUrl(initial.logo) : null,
  );
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewData = useMemo(
    () => `http://localhost:3100/r/${restaurantSlug}/q/preview`,
    [restaurantSlug],
  );

  const dotsMode: ColorMode = style.dotsOptions?.gradient ? 'gradient' : 'single';
  const cornersSquareMode: ColorMode = style.cornersSquareOptions?.gradient
    ? 'gradient'
    : 'single';
  const cornersDotMode: ColorMode = style.cornersDotOptions?.gradient
    ? 'gradient'
    : 'single';
  const backgroundMode: ColorMode = style.backgroundOptions?.gradient
    ? 'gradient'
    : 'single';

  function patchStyle(patch: Partial<RestaurantQrStyle>) {
    setStyle((current) => ({ ...current, ...patch }));
    setSuccessMessage('');
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) {
      return;
    }

    if (logoPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setLogoFile(file);
    setRemoveLogo(false);
    setLogoPreviewUrl(URL.createObjectURL(file));
    setSuccessMessage('');
  }

  function handleRemoveLogo() {
    if (logoPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoFile(null);
    setLogoPath(null);
    setLogoPreviewUrl(null);
    setRemoveLogo(true);
    setSuccessMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      let response: Response;

      if (logoFile) {
        const formData = new FormData();
        formData.append('style', JSON.stringify(style));
        if (removeLogo) {
          formData.append('removeLogo', 'true');
        }
        formData.append('logo', logoFile);
        response = await fetch(`/api/restaurants/${restaurantUuid}/qr-style`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch(`/api/restaurants/${restaurantUuid}/qr-style`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            style: normalizeQrStyleForEditor(style),
            ...(removeLogo ? { removeLogo: true } : {}),
          }),
        });
      }

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => undefined);
        setFormError(parseApiError(body, 'Не вдалося зберегти стиль QR').message);
        return;
      }

      const saved = (await response.json()) as RestaurantQrStyleResponse;
      setStyle(normalizeQrStyleForEditor(saved.style));
      setLogoPath(saved.logo);
      setLogoFile(null);
      setRemoveLogo(false);
      if (logoPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      setLogoPreviewUrl(saved.logo ? getUploadPublicUrl(saved.logo) : null);
      setSuccessMessage('Стиль QR збережено. Усі коди вже з цим виглядом.');
    } catch {
      setFormError('Не вдалося зберегти стиль QR.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[30px] bg-card p-5 ring-1 ring-line sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            QR styling
          </p>
          <h3 className="mt-2 text-2xl font-black text-ink-950">
            Вигляд QR-кодів
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink-600">
            Один стиль для всіх QR ресторану. Після збереження preview і
            скачані коди оновлюються автоматично.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-6">
          <section className="grid gap-4 rounded-[22px] border border-line bg-paper-50 p-4">
            <h4 className="text-sm font-black uppercase tracking-[0.08em] text-ink-400">
              Main options
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Width"
                type="number"
                value={String(style.width ?? 512)}
                onChange={(event) =>
                  patchStyle({
                    width: Number(event.target.value) || 512,
                    height: Number(event.target.value) || 512,
                  })
                }
              />
              <Input
                label="Margin"
                type="number"
                value={String(style.margin ?? 8)}
                onChange={(event) =>
                  patchStyle({ margin: Number(event.target.value) || 0 })
                }
              />
              <label className="grid gap-1 text-sm font-bold text-ink-600">
                Shape
                <select
                  value={style.shape ?? 'square'}
                  onChange={(event) =>
                    patchStyle({
                      shape: event.target.value as 'square' | 'circle',
                    })
                  }
                  className="h-12 rounded-field border border-line bg-white px-3 text-sm font-semibold text-ink-950"
                >
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                </select>
              </label>
            </div>
          </section>

          <section className="grid gap-4 rounded-[22px] border border-line bg-paper-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-black uppercase tracking-[0.08em] text-ink-400">
                Dots options
              </h4>
              <ColorModeToggle
                mode={dotsMode}
                onChange={(mode) =>
                  patchStyle({
                    dotsOptions: {
                      ...style.dotsOptions,
                      ...(mode === 'gradient'
                        ? {
                            gradient: createDefaultGradient(
                              style.dotsOptions?.color,
                            ),
                            color: undefined,
                          }
                        : {
                            color: style.dotsOptions?.color ?? '#171512',
                            gradient: undefined,
                          }),
                    },
                  })
                }
              />
            </div>
            <label className="grid gap-1 text-sm font-bold text-ink-600">
              Dots style
              <select
                value={style.dotsOptions?.type ?? 'rounded'}
                onChange={(event) =>
                  patchStyle({
                    dotsOptions: {
                      ...style.dotsOptions,
                      type: event.target.value as QrDotType,
                    },
                  })
                }
                className="h-11 rounded-field border border-line bg-white px-3 text-sm font-semibold text-ink-950"
              >
                {DOT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {dotsMode === 'single' ? (
              <label className="grid gap-1 text-sm font-bold text-ink-600">
                Dots color
                <input
                  type="color"
                  value={style.dotsOptions?.color ?? '#171512'}
                  onChange={(event) =>
                    patchStyle({
                      dotsOptions: {
                        ...style.dotsOptions,
                        color: event.target.value,
                        gradient: undefined,
                      },
                    })
                  }
                  className="h-11 w-full cursor-pointer rounded-field border border-line bg-white px-2"
                />
              </label>
            ) : style.dotsOptions?.gradient ? (
              <GradientFields
                gradient={style.dotsOptions.gradient}
                onChange={(gradient) =>
                  patchStyle({
                    dotsOptions: {
                      ...style.dotsOptions,
                      gradient,
                      color: undefined,
                    },
                  })
                }
              />
            ) : null}
          </section>

          <section className="grid gap-4 rounded-[22px] border border-line bg-paper-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-black uppercase tracking-[0.08em] text-ink-400">
                Corners square
              </h4>
              <ColorModeToggle
                mode={cornersSquareMode}
                onChange={(mode) =>
                  patchStyle({
                    cornersSquareOptions: {
                      ...style.cornersSquareOptions,
                      ...(mode === 'gradient'
                        ? {
                            gradient: createDefaultGradient(
                              style.cornersSquareOptions?.color,
                            ),
                            color: undefined,
                          }
                        : {
                            color:
                              style.cornersSquareOptions?.color ?? '#171512',
                            gradient: undefined,
                          }),
                    },
                  })
                }
              />
            </div>
            <label className="grid gap-1 text-sm font-bold text-ink-600">
              Style
              <select
                value={style.cornersSquareOptions?.type ?? ''}
                onChange={(event) => {
                  const value = event.target.value as QrCornerSquareType | '';
                  patchStyle({
                    cornersSquareOptions: value
                      ? {
                          ...style.cornersSquareOptions,
                          type: value,
                        }
                      : {
                          color: style.cornersSquareOptions?.color,
                          gradient: style.cornersSquareOptions?.gradient,
                        },
                  });
                }}
                className="h-11 rounded-field border border-line bg-white px-3 text-sm font-semibold text-ink-950"
              >
                {CORNER_SQUARE_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {cornersSquareMode === 'single' ? (
              <label className="grid gap-1 text-sm font-bold text-ink-600">
                Color
                <input
                  type="color"
                  value={style.cornersSquareOptions?.color ?? '#171512'}
                  onChange={(event) =>
                    patchStyle({
                      cornersSquareOptions: {
                        ...style.cornersSquareOptions,
                        color: event.target.value,
                        gradient: undefined,
                      },
                    })
                  }
                  className="h-11 w-full cursor-pointer rounded-field border border-line bg-white px-2"
                />
              </label>
            ) : style.cornersSquareOptions?.gradient ? (
              <GradientFields
                gradient={style.cornersSquareOptions.gradient}
                onChange={(gradient) =>
                  patchStyle({
                    cornersSquareOptions: {
                      ...style.cornersSquareOptions,
                      gradient,
                      color: undefined,
                    },
                  })
                }
              />
            ) : null}
          </section>

          <section className="grid gap-4 rounded-[22px] border border-line bg-paper-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-black uppercase tracking-[0.08em] text-ink-400">
                Corners dot
              </h4>
              <ColorModeToggle
                mode={cornersDotMode}
                onChange={(mode) =>
                  patchStyle({
                    cornersDotOptions: {
                      ...style.cornersDotOptions,
                      ...(mode === 'gradient'
                        ? {
                            gradient: createDefaultGradient(
                              style.cornersDotOptions?.color,
                            ),
                            color: undefined,
                          }
                        : {
                            color: style.cornersDotOptions?.color ?? '#c83d22',
                            gradient: undefined,
                          }),
                    },
                  })
                }
              />
            </div>
            <label className="grid gap-1 text-sm font-bold text-ink-600">
              Style
              <select
                value={style.cornersDotOptions?.type ?? ''}
                onChange={(event) => {
                  const value = event.target.value as QrCornerDotType | '';
                  patchStyle({
                    cornersDotOptions: value
                      ? {
                          ...style.cornersDotOptions,
                          type: value,
                        }
                      : {
                          color: style.cornersDotOptions?.color,
                          gradient: style.cornersDotOptions?.gradient,
                        },
                  });
                }}
                className="h-11 rounded-field border border-line bg-white px-3 text-sm font-semibold text-ink-950"
              >
                {CORNER_DOT_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {cornersDotMode === 'single' ? (
              <label className="grid gap-1 text-sm font-bold text-ink-600">
                Color
                <input
                  type="color"
                  value={style.cornersDotOptions?.color ?? '#c83d22'}
                  onChange={(event) =>
                    patchStyle({
                      cornersDotOptions: {
                        ...style.cornersDotOptions,
                        color: event.target.value,
                        gradient: undefined,
                      },
                    })
                  }
                  className="h-11 w-full cursor-pointer rounded-field border border-line bg-white px-2"
                />
              </label>
            ) : style.cornersDotOptions?.gradient ? (
              <GradientFields
                gradient={style.cornersDotOptions.gradient}
                onChange={(gradient) =>
                  patchStyle({
                    cornersDotOptions: {
                      ...style.cornersDotOptions,
                      gradient,
                      color: undefined,
                    },
                  })
                }
              />
            ) : null}
          </section>

          <section className="grid gap-4 rounded-[22px] border border-line bg-paper-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-black uppercase tracking-[0.08em] text-ink-400">
                Background
              </h4>
              <ColorModeToggle
                mode={backgroundMode}
                onChange={(mode) =>
                  patchStyle({
                    backgroundOptions: {
                      ...style.backgroundOptions,
                      ...(mode === 'gradient'
                        ? {
                            gradient: createDefaultGradient(
                              style.backgroundOptions?.color ?? '#ffffff',
                            ),
                            color: undefined,
                          }
                        : {
                            color: style.backgroundOptions?.color ?? '#ffffff',
                            gradient: undefined,
                          }),
                    },
                  })
                }
              />
            </div>
            {backgroundMode === 'single' ? (
              <label className="grid gap-1 text-sm font-bold text-ink-600">
                Background color
                <input
                  type="color"
                  value={style.backgroundOptions?.color ?? '#ffffff'}
                  onChange={(event) =>
                    patchStyle({
                      backgroundOptions: {
                        ...style.backgroundOptions,
                        color: event.target.value,
                        gradient: undefined,
                      },
                    })
                  }
                  className="h-11 w-full cursor-pointer rounded-field border border-line bg-white px-2"
                />
              </label>
            ) : style.backgroundOptions?.gradient ? (
              <GradientFields
                gradient={style.backgroundOptions.gradient}
                onChange={(gradient) =>
                  patchStyle({
                    backgroundOptions: {
                      ...style.backgroundOptions,
                      gradient,
                      color: undefined,
                    },
                  })
                }
              />
            ) : null}
          </section>

          <section className="grid gap-4 rounded-[22px] border border-line bg-paper-50 p-4">
            <h4 className="text-sm font-black uppercase tracking-[0.08em] text-ink-400">
              Image / logo
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-11 cursor-pointer items-center rounded-field border border-line bg-white px-4 text-sm font-extrabold text-ink-950 transition hover:bg-paper-50">
                Завантажити лого
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              {logoPreviewUrl || logoPath ? (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="h-11 rounded-field border border-danger/20 bg-danger-50 px-4 text-sm font-extrabold text-danger"
                >
                  Видалити лого
                </button>
              ) : null}
            </div>
            {logoPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreviewUrl}
                alt="QR logo preview"
                className="h-20 w-20 rounded-field border border-line object-contain bg-white"
              />
            ) : null}
            <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
              <input
                type="checkbox"
                checked={style.imageOptions?.hideBackgroundDots ?? true}
                onChange={(event) =>
                  patchStyle({
                    imageOptions: {
                      ...style.imageOptions,
                      hideBackgroundDots: event.target.checked,
                    },
                  })
                }
                className="size-4 accent-ink-950"
              />
              Hide background dots
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Image size (0.1–0.4)"
                type="number"
                value={String(style.imageOptions?.imageSize ?? 0.35)}
                onChange={(event) => {
                  const raw = Number(event.target.value);
                  const imageSize = Number.isFinite(raw)
                    ? Math.min(0.4, Math.max(0.1, raw))
                    : 0.35;
                  patchStyle({
                    imageOptions: {
                      ...style.imageOptions,
                      imageSize,
                    },
                  });
                }}
              />
              <Input
                label="Image margin"
                type="number"
                value={String(style.imageOptions?.margin ?? 4)}
                onChange={(event) =>
                  patchStyle({
                    imageOptions: {
                      ...style.imageOptions,
                      margin: Number(event.target.value) || 0,
                    },
                  })
                }
              />
            </div>
          </section>

          <section className="grid gap-4 rounded-[22px] border border-line bg-paper-50 p-4">
            <h4 className="text-sm font-black uppercase tracking-[0.08em] text-ink-400">
              QR options
            </h4>
            <label className="grid gap-1 text-sm font-bold text-ink-600">
              Error correction
              <select
                value={style.qrOptions?.errorCorrectionLevel ?? 'M'}
                onChange={(event) =>
                  patchStyle({
                    qrOptions: {
                      ...style.qrOptions,
                      errorCorrectionLevel: event.target.value as
                        | 'L'
                        | 'M'
                        | 'Q'
                        | 'H',
                    },
                  })
                }
                className="h-11 rounded-field border border-line bg-white px-3 text-sm font-semibold text-ink-950"
              >
                <option value="L">L</option>
                <option value="M">M</option>
                <option value="Q">Q</option>
                <option value="H">H</option>
              </select>
            </label>
          </section>
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <QrStylePreview
            data={previewData}
            style={style}
            imageUrl={logoPreviewUrl}
          />
          <p className="text-xs font-semibold leading-5 text-ink-500">
            Live preview. Збережіть, щоб застосувати стиль до всіх QR у
            ресторані.
          </p>
        </div>
      </div>

      {formError ? (
        <FormAlert className="mt-5 text-[13px]">{formError}</FormAlert>
      ) : null}
      {successMessage ? (
        <p className="mt-5 rounded-field border border-herb/20 bg-herb-50 px-4 py-3 text-sm font-bold text-ink-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-5">
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Збереження...' : 'Зберегти стиль QR'}
        </Button>
      </div>
    </form>
  );
}
