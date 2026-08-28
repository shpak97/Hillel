import {
  createImageMulterOptions,
  ensureImageUploadDir,
  getImagePublicPath,
  ImageEntityFolder,
} from './image-upload';

export function ensureMenuPhotosDir() {
  ensureImageUploadDir(ImageEntityFolder.MENU);
}

export const menuPhotoMulterOptions = createImageMulterOptions(
  ImageEntityFolder.MENU,
  1,
);

export function getMenuPhotoPublicPath(filename: string) {
  return getImagePublicPath(ImageEntityFolder.MENU, filename);
}
