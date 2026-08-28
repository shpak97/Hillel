import { StreamableFile } from '@nestjs/common';
import type { QrFormat } from './qr.constants';
import { QR_DEFAULT_SIZE, QR_FORMAT_JSON, QR_FORMAT_PNG } from './qr.constants';
import { resolveQrLogoDataUrl } from './qr-logo.resolve';
import { mergeQrStyle, type QrStyleOptions } from './qr-style.defaults';
import type { QrJsonPayload, QrPngResult, QrSvgResult } from './qr.service';
import { QrService } from './qr.service';

export type QrFileResult = {
  kind: 'file';
  contentType: string;
  body: Buffer;
  filename: string;
};

export type QrJsonResult<T extends QrJsonPayload> = {
  kind: 'json';
  payload: T;
};

export type QrEndpointResult<T extends QrJsonPayload> =
  | QrFileResult
  | QrJsonResult<T>;

export type QrAppearanceInput = {
  style?: QrStyleOptions | PrismaJson.RestaurantQrStyle | null;
  logo?: string | null;
};

export async function buildQrEndpointResult<T extends QrJsonPayload>(
  qrService: QrService,
  url: string,
  format: QrFormat,
  filenameBase: string,
  enrichJson: (payload: QrJsonPayload) => T,
  appearance?: QrAppearanceInput,
): Promise<QrEndpointResult<T>> {
  const style = mergeQrStyle(appearance?.style as QrStyleOptions | null);
  const size = style.width ?? QR_DEFAULT_SIZE;
  const image = await resolveQrLogoDataUrl(appearance?.logo);

  if (format === QR_FORMAT_JSON) {
    const payload = await qrService.generateJsonPayload(
      url,
      size,
      style,
      image,
    );
    return {
      kind: 'json',
      payload: enrichJson(payload),
    };
  }

  const file: QrPngResult | QrSvgResult = await qrService.generate(
    url,
    format,
    size,
    style,
    image,
  );
  const body =
    typeof file.body === 'string' ? Buffer.from(file.body, 'utf8') : file.body;
  const extension = format === QR_FORMAT_PNG ? 'png' : 'svg';

  return {
    kind: 'file',
    contentType: file.contentType,
    body,
    filename: `${filenameBase}.${extension}`,
  };
}

export function toQrHttpResult<T extends QrJsonPayload>(
  result: QrEndpointResult<T>,
  validateJson: (payload: T) => T,
): T | StreamableFile {
  if (result.kind === 'json') {
    return validateJson(result.payload);
  }

  return new StreamableFile(result.body, {
    type: result.contentType,
    disposition: `attachment; filename="${result.filename}"`,
  });
}
