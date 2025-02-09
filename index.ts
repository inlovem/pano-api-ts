import admin from './src/api/config/firebase';  // <-- Ensure you do this at the top
import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import imageProcessingRoutes from "./src/api/routes/imageProcessingRoutes";
import authRoutes from './src/api/routes/authRoutes';
import recordingRoutes from './src/api/routes/recordingRoutes';

// Now admin is initialized, so you can proceed
const server = fastify({ logger: true });

server.register(cors, { origin: '*' });
server.register(multipart);
server.register(authRoutes);
server.register(recordingRoutes);
server.register(imageProcessingRoutes);

server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
});
