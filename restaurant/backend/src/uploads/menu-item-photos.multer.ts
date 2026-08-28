import {
  createImageMulterOptions,
  ensureImageUploadDir,
  getImagePublicPath,
  ImageEntityFolder,
} from './image-upload';

export function ensureMenuItemPhotosDir() {
  ensureImageUploadDir(ImageEntityFolder.MENU_ITEM);
}

export const menuItemPhotoMulterOptions = createImageMulterOptions(
  ImageEntityFolder.MENU_ITEM,
  1,
);

export function getMenuItemPhotoPublicPath(filename: string) {
  return getImagePublicPath(ImageEntityFolder.MENU_ITEM, filename);
}
