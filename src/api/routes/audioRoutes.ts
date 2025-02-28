import { FastifyInstance } from 'fastify';
import { authenticateUser } from '../utils/authUser';
import * as audio from '../controllers/audioController';



async function audioRoutes(fastify: FastifyInstance) {
    fastify.route({  
        method: 'POST',
        url: '/audio/tts',
        // schema: UpdatePostCardSchema,
        preHandler: [authenticateUser], 
        handler: audio.processAudioTranscriptionController
    });

}


export default audioRoutes;

