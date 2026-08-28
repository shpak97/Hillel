'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Button, FormAlert } from '@/shared/ui';
import { QrStylePreview } from '@/features/restaurant/components/QrStylePreview';
import { useRestaurantQrStyle } from '@/features/qr-code/hooks/use-restaurant-qr-style';
import { downloadStyledQr } from '@/features/qr-code/lib/download-styled-qr';

type StyledQrPanelProps = {
  restaurantUuid: string;
  /** Absolute guest URL encoded in the QR. */
  url: string;
  filenameBase: string;
  title: string;
  description: string;
  headerExtra?: ReactNode;
};

export function StyledQrPanel({
  restaurantUuid,
  url,
  filenameBase,
  title,
  description,
  headerExtra,
}: StyledQrPanelProps) {
  const { style, logoUrl, isLoading, error: styleError } =
    useRestaurantQrStyle(restaurantUuid);
  const [actionError, setActionError] = useState('');
  const [isDownloading, setIsDownloading] = useState<'png' | 'svg' | null>(
    null,
  );
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    setActionError('');
  }, [url]);

  async function handleCopyLink() {
    if (!url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1500);
    } catch {
      setActionError('Не вдалося скопіювати посилання');
    }
  }

  async function handleDownload(format: 'png' | 'svg') {
    if (!url) {
      return;
    }

    setIsDownloading(format);
    setActionError('');

    try {
      await downloadStyledQr({
        data: url,
        style,
        imageUrl: logoUrl,
        filenameBase,
        format,
      });
    } catch {
      setActionError('Не вдалося скачати QR-код');
    } finally {
      setIsDownloading(null);
    }
  }

  const error = styleError || actionError;
  const ready = Boolean(url) && !isLoading;

  return (
    <section className="rounded-[28px] border border-line bg-white p-6 shadow-[0_18px_40px_-32px_rgba(23,21,18,0.55)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[22px] font-black leading-tight text-ink-950">
            {title}
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink-600">
            {description}
          </p>
        </div>
        {headerExtra}
      </div>

      {error ? (
        <div className="mt-5">
          <FormAlert>{error}</FormAlert>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          {isLoading || !url ? (
            <div className="flex h-[248px] items-center justify-center rounded-[24px] border border-line bg-paper-50 p-4">
              <p className="text-sm font-bold text-ink-400">Генерація…</p>
            </div>
          ) : (
            <QrStylePreview data={url} style={style} imageUrl={logoUrl} />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-400">
              Guest link
            </p>
            <p className="mt-2 break-all rounded-field border border-line bg-paper-50 px-4 py-3 text-sm font-semibold text-ink-950">
              {url || '—'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              className="h-12 px-4 text-sm"
              disabled={!ready}
              onClick={() => void handleCopyLink()}
            >
              {copyState === 'copied' ? 'Скопійовано' : 'Копіювати лінк'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-12 px-4 text-sm"
              disabled={!ready || isDownloading !== null}
              onClick={() => void handleDownload('png')}
            >
              {isDownloading === 'png' ? 'PNG…' : 'Скачати PNG'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-12 px-4 text-sm"
              disabled={!ready || isDownloading !== null}
              onClick={() => void handleDownload('svg')}
            >
              {isDownloading === 'svg' ? 'SVG…' : 'Скачати SVG'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
