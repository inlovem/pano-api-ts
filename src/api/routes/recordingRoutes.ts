// src/api/routes/recordingRoutes.ts
import { FastifyInstance } from 'fastify';
import {getRecordingController, uploadRecordingController} from '../controllers/recordingController';

async function recordingRoutes(fastify: FastifyInstance) {
    fastify.post('/recording/upload', uploadRecordingController);
    fastify.get('/recording/get', getRecordingController);
}

export default recordingRoutes;
