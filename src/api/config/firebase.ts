import admin from 'firebase-admin';
import serviceAccount from '../../../serviceAccountKey.json';
import dotenv from 'dotenv';

dotenv.config(); // Make sure env variables are loaded

// Only initialize if no apps exist:
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

export default admin;
