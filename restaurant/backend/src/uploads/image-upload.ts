import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { UPLOADS_ERRORS } from 'src/uploads/uploads.errors';
import { diskStorage } from 'multer';

export const IMAGE_UPLOAD_ROOT = join(process.cwd(), 'uploads', 'images');

export const ImageEntityFolder = {
  RESTAURANT: 'restaurants',
  MENU: 'menus',
  PRODUCT: 'products',
  MENU_ITEM: 'menu-items',
  QR_LOGO: 'qr-logos',
} as const;

export type ImageEntityFolder =
  (typeof ImageEntityFolder)[keyof typeof ImageEntityFolder];

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function getImageEntityDir(folder: ImageEntityFolder): string {
  return join(IMAGE_UPLOAD_ROOT, folder);
}

export function ensureImageUploadDir(folder: ImageEntityFolder): void {
  const dir = getImageEntityDir(folder);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function ensureAllImageUploadDirs(): void {
  for (const folder of Object.values(ImageEntityFolder)) {
    ensureImageUploadDir(folder);
  }
}

export function getImagePublicPath(
  folder: ImageEntityFolder,
  filename: string,
): string {
  return `/uploads/images/${folder}/${filename}`;
}

export function createImageMulterOptions(
  folder: ImageEntityFolder,
  maxFiles = 1,
) {
  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        ensureImageUploadDir(folder);
        cb(null, getImageEntityDir(folder));
      },
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${ext}`);
      },
    }),
    fileFilter: (
      _req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(new BadRequestException(UPLOADS_ERRORS.INVALID_IMAGE_TYPE), false);
        return;
      }

      cb(null, true);
    },
    limits: {
      files: maxFiles,
      fileSize: 5 * 1024 * 1024,
    },
  };
}
