import { FastifyInstance } from 'fastify';
import { generateImageDescriptionController, imageConversationController } from '../controllers/imageProcessingController';
/**
 * Image routes.
 */

async function imageProcessingRoutes(fastify: FastifyInstance) {
        fastify.post('/image-description', generateImageDescriptionController);    
        fastify.post('/image-conversation', imageConversationController);
}

export default imageProcessingRoutes;