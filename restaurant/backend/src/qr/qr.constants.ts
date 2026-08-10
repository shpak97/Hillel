export const QR_FORMAT_PNG = 'png';
export const QR_FORMAT_SVG = 'svg';
export const QR_FORMAT_JSON = 'json';

export const QR_FORMATS = [
  QR_FORMAT_PNG,
  QR_FORMAT_SVG,
  QR_FORMAT_JSON,
] as const;

export type QrFormat = (typeof QR_FORMATS)[number];

export const QR_DEFAULT_SIZE = 512;
/** Quiet zone in modules for qr-code-styling. */
export const QR_DEFAULT_MARGIN = 8;
export const QR_ERROR_CORRECTION = 'M' as const;
