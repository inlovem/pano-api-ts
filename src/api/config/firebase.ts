import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables locally (not needed in Heroku)

// Ensure Firebase is only initialized once
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

export default admin;