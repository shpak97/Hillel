import type { Options } from 'qr-code-styling';
import {
  QR_DEFAULT_MARGIN,
  QR_DEFAULT_SIZE,
  QR_ERROR_CORRECTION,
} from './qr.constants';

/**
 * Shared QR appearance defaults. Restaurant.qrStyle overrides these.
 * Logo path comes from Restaurant.qrLogo and is merged at generation time.
 */
export type QrStyleOptions = Pick<
  Options,
  | 'width'
  | 'height'
  | 'margin'
  | 'shape'
  | 'qrOptions'
  | 'dotsOptions'
  | 'cornersSquareOptions'
  | 'cornersDotOptions'
  | 'backgroundOptions'
  | 'imageOptions'
>;

/** Keep logo small enough that QR modules remain scannable. */
export const QR_LOGO_SIZE_MIN = 0.1;
export const QR_LOGO_SIZE_MAX = 0.4;

export const DEFAULT_QR_STYLE: QrStyleOptions = {
  width: QR_DEFAULT_SIZE,
  height: QR_DEFAULT_SIZE,
  margin: QR_DEFAULT_MARGIN,
  shape: 'square',
  qrOptions: {
    errorCorrectionLevel: QR_ERROR_CORRECTION,
  },
  dotsOptions: {
    type: 'rounded',
    color: '#171512',
  },
  cornersSquareOptions: {
    type: 'extra-rounded',
    color: '#171512',
  },
  cornersDotOptions: {
    type: 'dot',
    color: '#c83d22',
  },
  backgroundOptions: {
    color: '#ffffff',
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.35,
    margin: 4,
  },
};

type PaintOptions = {
  color?: string;
  gradient?: unknown;
};

/**
 * Defaults merge can re-introduce solid `color` next to a saved `gradient`.
 * qr-code-styling then often ignores the gradient — drop color when gradient is set.
 */
function preferGradientOverColor<T extends PaintOptions>(options: T): T {
  if (!options?.gradient) {
    return options;
  }

  const { color: _color, ...rest } = options;
  return rest as T;
}

function clampLogoSize(value: number | undefined): number {
  const raw = value ?? DEFAULT_QR_STYLE.imageOptions?.imageSize ?? 0.35;
  return Math.min(QR_LOGO_SIZE_MAX, Math.max(QR_LOGO_SIZE_MIN, raw));
}

export function mergeQrStyle(stored?: QrStyleOptions | null): QrStyleOptions {
  if (!stored) {
    return {
      ...DEFAULT_QR_STYLE,
      imageOptions: {
        ...DEFAULT_QR_STYLE.imageOptions,
        imageSize: clampLogoSize(DEFAULT_QR_STYLE.imageOptions?.imageSize),
      },
    };
  }

  const mergedImageOptions = {
    ...DEFAULT_QR_STYLE.imageOptions,
    ...stored.imageOptions,
    imageSize: clampLogoSize(
      stored.imageOptions?.imageSize ??
        DEFAULT_QR_STYLE.imageOptions?.imageSize,
    ),
  };

  return {
    ...DEFAULT_QR_STYLE,
    ...stored,
    qrOptions: {
      ...DEFAULT_QR_STYLE.qrOptions,
      ...stored.qrOptions,
    },
    dotsOptions: preferGradientOverColor({
      ...DEFAULT_QR_STYLE.dotsOptions,
      ...stored.dotsOptions,
    }),
    cornersSquareOptions: preferGradientOverColor({
      ...DEFAULT_QR_STYLE.cornersSquareOptions,
      ...stored.cornersSquareOptions,
    }),
    cornersDotOptions: preferGradientOverColor({
      ...DEFAULT_QR_STYLE.cornersDotOptions,
      ...stored.cornersDotOptions,
    }),
    backgroundOptions: preferGradientOverColor({
      ...DEFAULT_QR_STYLE.backgroundOptions,
      ...stored.backgroundOptions,
    }),
    imageOptions: mergedImageOptions,
  };
}

export function buildQrStyleOptions(
  data: string,
  style: QrStyleOptions = DEFAULT_QR_STYLE,
  image?: string | null,
): Options {
  const merged = mergeQrStyle(style);
  const size = merged.width ?? QR_DEFAULT_SIZE;

  return {
    type: 'svg',
    width: size,
    height: merged.height ?? size,
    margin: merged.margin ?? QR_DEFAULT_MARGIN,
    data,
    ...(image ? { image } : {}),
    qrOptions: merged.qrOptions,
    dotsOptions: merged.dotsOptions,
    cornersSquareOptions: merged.cornersSquareOptions,
    cornersDotOptions: merged.cornersDotOptions,
    backgroundOptions: merged.backgroundOptions,
    imageOptions: merged.imageOptions,
    shape: merged.shape,
  };
}
