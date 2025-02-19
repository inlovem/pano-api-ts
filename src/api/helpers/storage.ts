
import admin from '../config/firebase';

export async function getDownloadURL(filePath: string): Promise<string> {
  const bucket = admin.storage().bucket();
  const file = bucket.file(filePath);
  const expires = Date.now() + 60 * 60 * 1000; //1 hora 
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires,
  });
  return url;
}



//PUBLIC URL
// export async function getDownloadURL(filePath: string): Promise<string> {
//   const bucket = admin.storage().bucket();
//   const file = bucket.file(filePath);
//   await file.makePublic();
//   return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
// }
