// index.ts

import fastify from 'fastify';
import cors from '@fastify/cors'; // Import the CORS plugin
import admin from 'firebase-admin';
import multipart from '@fastify/multipart';
import authRoutes from './src/api/routes/authRoutes';
import imageProcessingRoutes from "./src/api/routes/imageProcessingRoutes";
import serviceAccount from "./serviceAccountKey.json"; // Adjust the path as needed
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const server = fastify({ logger: true });

// Enable CORS to allow requests from your static server (e.g., http://localhost:8080)
server.register(cors, {
    origin: '*', // In production, consider restricting the origin(s)
});

// Register authentication routes
server.register(multipart);
server.register(authRoutes);
server.register(imageProcessingRoutes);

const startServer = async () => {
    try {
        await server.listen({ port: 3000 });
        server.log.info('Server listening on port 3000');
    } catch (error) {
        server.log.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();
