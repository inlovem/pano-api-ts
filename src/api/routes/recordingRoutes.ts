import { FastifyInstance } from 'fastify';
import {
    updateRecordingController
    } from '../controllers/recordingController';

import {
    UpdateRecordingSchema
} from '../schemas/recordingSchema';


async function recordingRoutes(fastify: FastifyInstance) {

    fastify.route({
        method: 'PATCH',
        url: '/recording/:recordingId',
        schema: UpdateRecordingSchema,
        handler: updateRecordingController
    });
}

export default recordingRoutes;