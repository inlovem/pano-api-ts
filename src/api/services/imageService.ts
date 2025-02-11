// src/services/imageService.ts

import admin from '../config/firebase';

/**
 * Retrieves an image from Firebase Storage as a Buffer.
 *
 * @param imageId - The identifier (or file name) of the image in Firebase Storage.
 * @returns A promise that resolves with the image data as a Buffer.
 */
export async function getImageFromFirebase(imageId: string): Promise<Buffer> {
  const bucket = admin.storage().bucket();
  const file = bucket.file(imageId);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`Image with id "${imageId}" not found in Firebase Storage.`);
  }
  
  const [buffer] = await file.download();
  return buffer;
}
