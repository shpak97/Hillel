import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

export const MENU_PHOTOS_DIR = join(process.cwd(), 'uploads', 'menus');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function ensureMenuPhotosDir() {
  if (!existsSync(MENU_PHOTOS_DIR)) {
    mkdirSync(MENU_PHOTOS_DIR, { recursive: true });
  }
}

export const menuPhotoMulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      ensureMenuPhotosDir();
      cb(null, MENU_PHOTOS_DIR);
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
      cb(
        new BadRequestException(
          'Дозволені лише зображення (JPEG, PNG, WebP, GIF).',
        ),
        false,
      );
      return;
    }

    cb(null, true);
  },
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024,
  },
};

export function getMenuPhotoPublicPath(filename: string) {
  return `/uploads/menus/${filename}`;
}
