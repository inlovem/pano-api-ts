// index.ts

import fastify from 'fastify';
import cors from '@fastify/cors'; // Import the CORS plugin
import multipart from '@fastify/multipart';
import imageProcessingRoutes from "./src/api/routes/imageProcessingRoutes";
import serviceAccount from "./serviceAccountKey.json"; // Adjust the path as needed
import dotenv from 'dotenv';
import PostCardRoutes from './src/api/routes/postcardRoutes';
import recordingRoutes from './src/api/routes/recordingRoutes';
import CreatePostCardRoutes from "./src/api/routes/createPostCardRoutes";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK


const server = fastify({ logger: true });

// Enable CORS to allow requests from your static server (e.g., http://localhost:8080)
server.register(cors, {
    origin: '*', // In production, consider restricting the origin(s)
});


// Register authentication routes
server.register(multipart);
server.register(PostCardRoutes);
server.register(recordingRoutes); 
server.register(imageProcessingRoutes);
server.register(CreatePostCardRoutes);


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
