import https from 'https';
import fs from 'fs';
import { logInDevelopment } from './logger';

export function downloadFile(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        logInDevelopment('Download completed.');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file in case of error
      console.error('Error downloading the file:', err.message);
      reject(err);
    });
  });
}
