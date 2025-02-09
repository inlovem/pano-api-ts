import { FastifyInstance } from 'fastify';
import { registerController, loginController } from '../controllers/authController';

/**
 * Auth routes.
 */
async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/auth/register', registerController);
    fastify.post('/auth/login', loginController);
}

export default authRoutes;
