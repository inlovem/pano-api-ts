// index.ts

import dotenv from 'dotenv';
require('dotenv').config()
import fastify from 'fastify';
import cors from '@fastify/cors'; // Import the CORS plugin
import multipart from '@fastify/multipart';
import authRoutes from './src/api/routes/authRoutes';
import imageProcessingRoutes from "./src/api/routes/imageProcessingRoutes";
import serviceAccount from "./serviceAccountKey.json"; // Adjust the path as needed

import recordingRoutes from './src/api/routes/recordingRoutes';
import PostcardRoutes from "./src/api/routes/postcardRoutes";





const server = fastify({ logger: true });


server.register(cors, {
    origin: '*',
});


// Register authentication routes
server.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, 
    },
  });
server.register(authRoutes);
server.register(PostcardRoutes);
server.register(recordingRoutes); 
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
