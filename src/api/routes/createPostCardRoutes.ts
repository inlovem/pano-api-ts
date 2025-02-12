// src/api/routes/createPostCardRoutes.ts
import { FastifyInstance } from 'fastify';
import {authenticateUser, decodeJWT} from '../utils/authUser';
import { createPostCardController } from '../controllers/postCardController';
import { CreatePostCardSchema } from '../schemas/postCardSchema';

async function CreatePostCardRoutes(fastify: FastifyInstance) {
    fastify.route({
        method: 'POST',
        url: '/postcard',
        schema: CreatePostCardSchema,
        preHandler: [authenticateUser],
        handler: createPostCardController,
    });
}

export default CreatePostCardRoutes;
