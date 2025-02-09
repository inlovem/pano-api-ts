// src/api/routes/recordingRoutes.ts
import { FastifyInstance } from 'fastify';
import { uploadRecordingController } from '../controllers/recordingController';

async function recordingRoutes(fastify: FastifyInstance) {
    fastify.post('/recording/upload', uploadRecordingController);
}

export default recordingRoutes;
