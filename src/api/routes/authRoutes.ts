// src/api/routes/authRoutes.ts

import { FastifyInstance } from 'fastify';
import {
    registerController,
    loginController,
    updateProfileController,
    googleLoginController,
    appleLoginController,
    facebookLoginController,
} from '../controllers/authController';

/**
 * Authentication routes.
 */
async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/auth/register', registerController);
    fastify.post('/auth/login', loginController);
    fastify.patch('/auth/updateProfile', updateProfileController);

    // Social provider logins
    fastify.post('/auth/google', googleLoginController);
    fastify.post('/auth/apple', appleLoginController);
    fastify.post('/auth/facebook', facebookLoginController);
}

export default authRoutes;
