import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import QRCodeStyling from 'qr-code-styling';
import sharp from 'sharp';
import {
  QR_DEFAULT_SIZE,
  QR_FORMAT_PNG,
  QR_FORMAT_SVG,
  type QrFormat,
} from './qr.constants';
import { QR_ERRORS } from './qr.errors';
import {
  buildQrStyleOptions,
  DEFAULT_QR_STYLE,
  QR_LOGO_SIZE_MAX,
  QR_LOGO_SIZE_MIN,
  type QrStyleOptions,
} from './qr-style.defaults';

export type QrPngResult = {
  format: typeof QR_FORMAT_PNG;
  contentType: 'image/png';
  body: Buffer;
};

export type QrSvgResult = {
  format: typeof QR_FORMAT_SVG;
  contentType: 'image/svg+xml';
  body: string;
};

export type QrJsonPayload = {
  url: string;
  pngDataUrl: string;
  svg: string;
};

type LogoLayout = {
  logoSize: number;
  x: number;
  y: number;
  bgPad: number;
  bgSize: number;
  bgX: number;
  bgY: number;
  bgColor: string;
};

@Injectable()
export class QrService {
  async generatePng(
    url: string,
    size = QR_DEFAULT_SIZE,
    style: QrStyleOptions = DEFAULT_QR_STYLE,
    image?: string | null,
  ): Promise<QrPngResult> {
    try {
      const body = await this.renderPngBuffer(url, size, style, image);
      return {
        format: QR_FORMAT_PNG,
        contentType: 'image/png',
        body,
      };
    } catch {
      throw new InternalServerErrorException(QR_ERRORS.GENERATION_FAILED);
    }
  }

  async generateSvg(
    url: string,
    size = QR_DEFAULT_SIZE,
    style: QrStyleOptions = DEFAULT_QR_STYLE,
    image?: string | null,
  ): Promise<QrSvgResult> {
    try {
      const body = await this.renderSvgString(url, size, style, image);
      return {
        format: QR_FORMAT_SVG,
        contentType: 'image/svg+xml',
        body,
      };
    } catch {
      throw new InternalServerErrorException(QR_ERRORS.GENERATION_FAILED);
    }
  }

  async generateJsonPayload(
    url: string,
    size = QR_DEFAULT_SIZE,
    style: QrStyleOptions = DEFAULT_QR_STYLE,
    image?: string | null,
  ): Promise<QrJsonPayload> {
    try {
      const [png, svg] = await Promise.all([
        this.renderPngBuffer(url, size, style, image),
        this.renderSvgString(url, size, style, image),
      ]);

      return {
        url,
        pngDataUrl: `data:image/png;base64,${png.toString('base64')}`,
        svg,
      };
    } catch {
      throw new InternalServerErrorException(QR_ERRORS.GENERATION_FAILED);
    }
  }

  async generate(
    url: string,
    format: Exclude<QrFormat, 'json'>,
    size = QR_DEFAULT_SIZE,
    style: QrStyleOptions = DEFAULT_QR_STYLE,
    image?: string | null,
  ): Promise<QrPngResult | QrSvgResult> {
    if (format === QR_FORMAT_PNG) {
      return this.generatePng(url, size, style, image);
    }

    return this.generateSvg(url, size, style, image);
  }

  private async renderPngBuffer(
    url: string,
    size: number,
    style: QrStyleOptions,
    image?: string | null,
  ): Promise<Buffer> {
    const baseSvg = await this.renderBaseQrSvg(url, size, style);
    const png = await sharp(Buffer.from(baseSvg, 'utf8')).png().toBuffer();

    const logoBuffer = this.parseLogoBuffer(image);
    if (!logoBuffer) {
      return png;
    }

    const layout = this.getLogoLayout(size, style);
    const logoResized = await sharp(logoBuffer)
      .resize(layout.logoSize, layout.logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer();

    const bg = await sharp({
      create: {
        width: layout.bgSize,
        height: layout.bgSize,
        channels: 4,
        background: layout.bgColor,
      },
    })
      .png()
      .toBuffer();

    const logoWithBg = await sharp(bg)
      .composite([
        {
          input: logoResized,
          left: layout.bgPad,
          top: layout.bgPad,
        },
      ])
      .png()
      .toBuffer();

    return sharp(png)
      .composite([
        {
          input: logoWithBg,
          left: layout.bgX,
          top: layout.bgY,
        },
      ])
      .png()
      .toBuffer();
  }

  private async renderSvgString(
    url: string,
    size: number,
    style: QrStyleOptions,
    image?: string | null,
  ): Promise<string> {
    const baseSvg = await this.renderBaseQrSvg(url, size, style);
    const logoBuffer = this.parseLogoBuffer(image);
    if (!logoBuffer) {
      return baseSvg;
    }

    const layout = this.getLogoLayout(size, style);
    // Resize before embedding — otherwise librsvg may use intrinsic image size
    // and cover the whole QR (e.g. a 3456px screenshot logo).
    const logoResized = await sharp(logoBuffer)
      .resize(layout.logoSize, layout.logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer();

    const dataUrl = `data:image/png;base64,${logoResized.toString('base64')}`;
    const overlay = [
      `<rect x="${layout.bgX}" y="${layout.bgY}" width="${layout.bgSize}" height="${layout.bgSize}" fill="${layout.bgColor}"/>`,
      `<image href="${dataUrl}" x="${layout.x}" y="${layout.y}" width="${layout.logoSize}" height="${layout.logoSize}" preserveAspectRatio="xMidYMid meet"/>`,
    ].join('');

    if (baseSvg.includes('</svg>')) {
      return baseSvg.replace('</svg>', `${overlay}</svg>`);
    }

    return `${baseSvg}${overlay}`;
  }

  /**
   * qr-code-styling hangs on Node/jsdom when embedding images — never pass `image` here.
   */
  private async renderBaseQrSvg(
    url: string,
    size: number,
    style: QrStyleOptions,
  ): Promise<string> {
    const sizedStyle: QrStyleOptions = {
      ...style,
      width: size,
      height: size,
    };

    const qrCode = new QRCodeStyling({
      jsdom: JSDOM,
      ...buildQrStyleOptions(url, sizedStyle),
    });

    const raw = await qrCode.getRawData('svg');
    if (!raw) {
      throw new Error('QR SVG generation returned empty result');
    }

    return Buffer.isBuffer(raw)
      ? raw.toString('utf8')
      : Buffer.from(await raw.arrayBuffer()).toString('utf8');
  }

  private parseLogoBuffer(image?: string | null): Buffer | null {
    if (!image?.startsWith('data:')) {
      return null;
    }

    const match = /^data:([^;]+);base64,(.+)$/s.exec(image);
    if (!match) {
      return null;
    }

    return Buffer.from(match[2], 'base64');
  }

  private getLogoLayout(size: number, style: QrStyleOptions): LogoLayout {
    // Caller should pass mergeQrStyle() output; still clamp defensively.
    const imageSizeRatio = Math.min(
      QR_LOGO_SIZE_MAX,
      Math.max(
        QR_LOGO_SIZE_MIN,
        style.imageOptions?.imageSize ??
          DEFAULT_QR_STYLE.imageOptions?.imageSize ??
          0.35,
      ),
    );
    const imageMargin = Math.max(0, style.imageOptions?.margin ?? 4);
    const logoSize = Math.max(8, Math.round(size * imageSizeRatio));
    const x = Math.round((size - logoSize) / 2);
    const y = Math.round((size - logoSize) / 2);
    const bgPad = imageMargin;
    const bgSize = logoSize + bgPad * 2;
    const bgX = Math.max(0, x - bgPad);
    const bgY = Math.max(0, y - bgPad);
    const bgColor =
      style.backgroundOptions?.color ??
      style.backgroundOptions?.gradient?.colorStops?.[0]?.color ??
      '#ffffff';

    return { logoSize, x, y, bgPad, bgSize, bgX, bgY, bgColor };
  }
}
