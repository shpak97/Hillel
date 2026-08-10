import { unlink } from 'fs/promises';
import { join } from 'path';
import {
  getImagePublicPath,
  IMAGE_UPLOAD_ROOT,
  type ImageEntityFolder,
} from './image-upload';

export async function deleteUploadedImageIfExists(
  publicPath: string | null | undefined,
  folder: ImageEntityFolder,
): Promise<void> {
  if (!publicPath) {
    return;
  }

  const expectedPrefix = getImagePublicPath(folder, '');
  if (!publicPath.startsWith(expectedPrefix)) {
    return;
  }

  const filename = publicPath.slice(expectedPrefix.length);
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return;
  }

  const absolutePath = join(IMAGE_UPLOAD_ROOT, folder, filename);

  try {
    await unlink(absolutePath);
  } catch {
    // Missing file is fine — DB path may already be stale.
  }
}
