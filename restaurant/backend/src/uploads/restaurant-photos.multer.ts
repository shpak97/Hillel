import {
  createImageMulterOptions,
  ensureImageUploadDir,
  getImageEntityDir,
  getImagePublicPath,
  ImageEntityFolder,
} from './image-upload';

export const RESTAURANT_PHOTOS_DIR = getImageEntityDir(ImageEntityFolder.RESTAURANT);

export function ensureRestaurantPhotosDir() {
  ensureImageUploadDir(ImageEntityFolder.RESTAURANT);
}

export const restaurantPhotosMulterOptions = createImageMulterOptions(
  ImageEntityFolder.RESTAURANT,
  20,
);

export function getRestaurantPhotoPublicPath(filename: string) {
  return getImagePublicPath(ImageEntityFolder.RESTAURANT, filename);
}
