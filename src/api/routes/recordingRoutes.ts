import { FastifyInstance } from 'fastify';
import { updateRecordingController } from '../controllers/recordingController';
import { UpdateRecordingSchema } from '../schemas/recordingSchema';
import { authenticateUser } from '../utils/authUser';


async function recordingRoutes(fastify: FastifyInstance) {

    fastify.route({
        method: 'PATCH',
        url: '/recording/:recordingId',
        schema: UpdateRecordingSchema,
        preHandler: [authenticateUser],
        handler: updateRecordingController
    });
}

export default recordingRoutes;