import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables locally (not needed in Heroku)

if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable");
    }

    // Parse JSON and fix private_key formatting
    const serviceAccount = JSON.parse(serviceAccountKey);
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n'); // Restore newlines

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

export default admin;
