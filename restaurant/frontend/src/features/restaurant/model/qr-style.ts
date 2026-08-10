export type QrGradient = {
  type: 'linear' | 'radial';
  rotation?: number;
  colorStops: { offset: number; color: string }[];
};

export type QrDotType =
  | 'dots'
  | 'rounded'
  | 'classy'
  | 'classy-rounded'
  | 'square'
  | 'extra-rounded';

export type QrCornerSquareType =
  | 'dot'
  | 'square'
  | 'extra-rounded'
  | QrDotType;

export type QrCornerDotType = 'dot' | 'square' | QrDotType;

export type RestaurantQrStyle = {
  width?: number;
  height?: number;
  margin?: number;
  shape?: 'square' | 'circle';
  qrOptions?: {
    typeNumber?: number;
    mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  };
  dotsOptions?: {
    type?: QrDotType;
    color?: string;
    gradient?: QrGradient;
    roundSize?: boolean;
  };
  cornersSquareOptions?: {
    type?: QrCornerSquareType;
    color?: string;
    gradient?: QrGradient;
  };
  cornersDotOptions?: {
    type?: QrCornerDotType;
    color?: string;
    gradient?: QrGradient;
  };
  backgroundOptions?: {
    round?: number;
    color?: string;
    gradient?: QrGradient;
  };
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    margin?: number;
  };
};

export type RestaurantQrStyleResponse = {
  style: RestaurantQrStyle;
  logo: string | null;
};

export const DOT_TYPE_OPTIONS: { value: QrDotType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy rounded' },
];

export const CORNER_SQUARE_OPTIONS: {
  value: QrCornerSquareType | '';
  label: string;
}[] = [
  { value: '', label: 'None' },
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'extra-rounded', label: 'Extra rounded' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy rounded' },
];

export const CORNER_DOT_OPTIONS: {
  value: QrCornerDotType | '';
  label: string;
}[] = [
  { value: '', label: 'None' },
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy rounded' },
  { value: 'extra-rounded', label: 'Extra rounded' },
];

export const DEFAULT_QR_STYLE: RestaurantQrStyle = {
  width: 512,
  height: 512,
  margin: 8,
  shape: 'square',
  qrOptions: {
    errorCorrectionLevel: 'M',
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

export const QR_LOGO_SIZE_MIN = 0.1;
export const QR_LOGO_SIZE_MAX = 0.4;

export function clampQrLogoSize(value: number | undefined): number {
  const raw = value ?? 0.35;
  return Math.min(QR_LOGO_SIZE_MAX, Math.max(QR_LOGO_SIZE_MIN, raw));
}

export function createDefaultGradient(color = '#171512'): QrGradient {
  return {
    type: 'linear',
    rotation: 0,
    colorStops: [
      { offset: 0, color },
      { offset: 1, color: '#c83d22' },
    ],
  };
}

/** Normalize API style for the editor (clamp logo size, drop color when gradient is set). */
export function normalizeQrStyleForEditor(style: RestaurantQrStyle): RestaurantQrStyle {
  const preferGradient = <T extends { color?: string; gradient?: QrGradient }>(
    options?: T,
  ): T | undefined => {
    if (!options) {
      return options;
    }
    if (!options.gradient) {
      return options;
    }
    const { color: _color, ...rest } = options;
    return rest as T;
  };

  return {
    ...style,
    dotsOptions: preferGradient(style.dotsOptions),
    cornersSquareOptions: preferGradient(style.cornersSquareOptions),
    cornersDotOptions: preferGradient(style.cornersDotOptions),
    backgroundOptions: preferGradient(style.backgroundOptions),
    imageOptions: {
      ...style.imageOptions,
      imageSize: clampQrLogoSize(style.imageOptions?.imageSize),
    },
  };
}
