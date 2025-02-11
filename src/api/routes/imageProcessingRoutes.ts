// src/api/routes/imageProcessingRoutes.ts
import { FastifyInstance } from 'fastify';
import {
        generateImageDescriptionController,
        imageConversationController,
        ImageConversationRequest
} from '../controllers/imageProcessingController';
import { authenticateUser } from '../utils/authUser';
import { ImageDescriptionSchema, ImageConversationSchema } from '../schemas/imageProcessingSchema';

async function imageProcessingRoutes(fastify: FastifyInstance) {
        fastify.post(
            '/image-description',
            {
                    schema: ImageDescriptionSchema,
                    preHandler: [authenticateUser]
            },
            generateImageDescriptionController
        );

        fastify.post<{ Body: ImageConversationRequest }>(
            '/image-conversation',
            {
                    schema: ImageConversationSchema,
                    preHandler: [authenticateUser]
            },
            imageConversationController
        );
}

export default imageProcessingRoutes;
