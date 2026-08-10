import {
  createImageMulterOptions,
  ensureImageUploadDir,
  getImageEntityDir,
  getImagePublicPath,
  ImageEntityFolder,
} from './image-upload';

export const QR_LOGOS_DIR = getImageEntityDir(ImageEntityFolder.QR_LOGO);

export function ensureQrLogosDir() {
  ensureImageUploadDir(ImageEntityFolder.QR_LOGO);
}

export const qrLogoMulterOptions = createImageMulterOptions(
  ImageEntityFolder.QR_LOGO,
  1,
);

export function getQrLogoPublicPath(filename: string) {
  return getImagePublicPath(ImageEntityFolder.QR_LOGO, filename);
}
