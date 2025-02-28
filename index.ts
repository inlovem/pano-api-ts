// index.ts
import dotenv from 'dotenv';
dotenv.config();

import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import authRoutes from './src/api/routes/authRoutes';
import imageProcessingRoutes from './src/api/routes/imageProcessingRoutes';
import recordingRoutes from './src/api/routes/recordingRoutes';
import PostcardRoutes from './src/api/routes/postcardRoutes';
import giftRoutes from './src/api/routes/giftRoutes';
import audioRoutes from './src/api/routes/audioRoutes';

// If you are using local serviceAccountKey.json for dev,
// import it here. Otherwise, rely on environment variables in production.
// import serviceAccount from './serviceAccountKey.json';

const server = fastify({ logger: true });

// Register CORS with permissive settings (adjust for production)
server.register(cors, {
  origin: '*',
});

// Register multipart with file size limits
server.register(multipart, {
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

// Register all routes
server.register(authRoutes);
server.register(PostcardRoutes);
server.register(recordingRoutes);
server.register(imageProcessingRoutes);
server.register(giftRoutes);
server.register(audioRoutes);

const startServer = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    // Heroku requires host: "0.0.0.0"
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server listening on port ${port}`);
  } catch (err) {
    // Log error and exit
    server.log.error(err);
    process.exit(1);
  }
};

startServer();
