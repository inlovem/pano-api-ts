// helpers/storage.ts
import admin from '../config/firebase';

export async function getDownloadURL(filePath: string): Promise<string> {
  const bucket = admin.storage().bucket();
  const file = bucket.file(filePath);
  const expires = Date.now() + 60 * 60 * 1000; // URL valid for 1 hour
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires,
  });
  return url;
}
