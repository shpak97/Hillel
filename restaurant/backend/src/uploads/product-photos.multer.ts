import {
  createImageMulterOptions,
  ensureImageUploadDir,
  getImagePublicPath,
  ImageEntityFolder,
} from './image-upload';

export function ensureProductPhotosDir() {
  ensureImageUploadDir(ImageEntityFolder.PRODUCT);
}

export const productPhotoMulterOptions = createImageMulterOptions(
  ImageEntityFolder.PRODUCT,
  1,
);

export function getProductPhotoPublicPath(filename: string) {
  return getImagePublicPath(ImageEntityFolder.PRODUCT, filename);
}
