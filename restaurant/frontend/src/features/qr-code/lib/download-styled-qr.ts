import QRCodeStyling, { type Options } from 'qr-code-styling';
import type { RestaurantQrStyle } from '@/features/restaurant/model/qr-style';

function buildOptions(
  data: string,
  style: RestaurantQrStyle,
  imageUrl: string | null | undefined,
  size: number,
  type: 'canvas' | 'svg',
): Options {
  return {
    width: size,
    height: size,
    type,
    data,
    margin: style.margin,
    shape: style.shape,
    qrOptions: style.qrOptions as Options['qrOptions'],
    dotsOptions: style.dotsOptions,
    cornersSquareOptions: style.cornersSquareOptions,
    cornersDotOptions: style.cornersDotOptions,
    backgroundOptions: style.backgroundOptions,
    imageOptions: {
      ...style.imageOptions,
      crossOrigin: 'anonymous',
    },
    image: imageUrl || undefined,
  };
}

/**
 * Download QR with the same client rendering as the settings preview
 * (full style.width — not the on-screen preview size).
 */
export async function downloadStyledQr(params: {
  data: string;
  style: RestaurantQrStyle;
  imageUrl?: string | null;
  filenameBase: string;
  format: 'png' | 'svg';
}): Promise<void> {
  const size = Math.max(128, params.style.width ?? 512);
  const holder = document.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  holder.style.cssText =
    'position:fixed;left:-99999px;top:0;width:0;height:0;overflow:hidden;';
  document.body.appendChild(holder);

  try {
    const qr = new QRCodeStyling(
      buildOptions(
        params.data,
        params.style,
        params.imageUrl,
        size,
        params.format === 'svg' ? 'svg' : 'canvas',
      ),
    );
    qr.append(holder);
    // Allow canvas/image paint (logo) before export.
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    await qr.download({
      name: params.filenameBase,
      extension: params.format,
    });
  } finally {
    holder.remove();
  }
}

export { buildOptions as buildStyledQrOptions };
