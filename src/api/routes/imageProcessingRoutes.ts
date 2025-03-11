// src/api/routes/imageProcessingRoutes.ts
import { FastifyInstance } from 'fastify';
import {
        generateImageDescriptionController,
        imageConversationController,
 
} from '../controllers/imageProcessingController';
import { authenticateUser, decodeJWT } from '../utils/authUser';
import { ImageConversationSchema } from '../schemas/imageProcessingSchema';
import { validateFileType } from '../utils/validateFileType';

async function imageProcessingRoutes(fastify: FastifyInstance) {
        fastify.route({
                method: 'POST',
                url: '/image-description',
                // schema: ImageDescriptionSchema,
                preHandler: [authenticateUser, decodeJWT],
                handler: generateImageDescriptionController,
        });
        fastify.route({
                method: 'POST',
                url: '/image-conversation',
                // schema: ImageConversationSchema,
                preHandler: [authenticateUser, decodeJWT ],
                handler: imageConversationController,
        });
}

export default imageProcessingRoutes;
