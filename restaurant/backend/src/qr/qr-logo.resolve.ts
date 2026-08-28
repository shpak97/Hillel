import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import {
  getImagePublicPath,
  IMAGE_UPLOAD_ROOT,
  ImageEntityFolder,
} from 'src/uploads/image-upload';

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

/**
 * Convert stored public logo path into a data URL for qr-code-styling (Node/SVG).
 */
export async function resolveQrLogoDataUrl(
  publicPath: string | null | undefined,
): Promise<string | undefined> {
  if (!publicPath) {
    return undefined;
  }

  const expectedPrefix = getImagePublicPath(ImageEntityFolder.QR_LOGO, '');
  if (!publicPath.startsWith(expectedPrefix)) {
    return undefined;
  }

  const filename = publicPath.slice(expectedPrefix.length);
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return undefined;
  }

  const absolutePath = join(
    IMAGE_UPLOAD_ROOT,
    ImageEntityFolder.QR_LOGO,
    filename,
  );

  try {
    const buffer = await readFile(absolutePath);
    const ext = extname(filename).toLowerCase();
    const mime = MIME_BY_EXT[ext] ?? 'image/png';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch {
    return undefined;
  }
}
