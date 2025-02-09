import { FastifyInstance } from 'fastify';
import { generateImageDescriptionController, imageConversationController } from '../controllers/imageProcessingController';
import { authenticateUser } from '../utils/authUser';
import { validateFileType } from '../utils/validateFileType';
import { GenerateImageDescriptionSchema, ImageConversationSchema } from '../schemas/imageProcessingSchema';
/**
 * Image routes.
 */

async function imageProcessingRoutes(fastify: FastifyInstance) {
        fastify.route({
                method: 'POST',
                url: '/image-description',
                schema: GenerateImageDescriptionSchema,
                preHandler: [validateFileType, authenticateUser], 
                handler: generateImageDescriptionController,
                });
        fastify.route({
                method: 'POST',
                url: '/image-conversation',
                schema: ImageConversationSchema, 
                preHandler: [authenticateUser], 
                handler: imageConversationController,
                });
        
}

export default imageProcessingRoutes;