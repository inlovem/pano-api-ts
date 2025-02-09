// src/services/imageService.ts

import admin from '../config/firebase';

// Ensure Firebase Admin is initialized somewhere in your project
// For example, in your main server file:
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount), storageBucket: 'your-bucket.appspot.com' });

/**
 * Retrieves an image from Firebase Storage as a Buffer.
 *
 * @param imageId - The identifier (or file name) of the image in Firebase Storage.
 * @returns A promise that resolves with the image data as a Buffer.
 */
export async function getImageFromFirebase(imageId: string): Promise<Buffer> {
  // Use the bucket that was configured in Firebase Admin initialization.
  const bucket = admin.storage().bucket();
  
  // Construct the file reference. Adjust the path if needed.
  const file = bucket.file(imageId);
  
  // Check if the file exists.
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`Image with id "${imageId}" not found in Firebase Storage.`);
  }
  
  // Download the file as a Buffer.
  const [buffer] = await file.download();
  return buffer;
}
