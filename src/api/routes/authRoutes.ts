// src/api/routes/authRoutes.ts
import { FastifyInstance } from 'fastify';
import { registerUserController } from '../controllers/authController';
// Assume authenticateUser is a preHandler that calls decodeJWT and attaches the user info to the request.
import { authenticateUser } from '../utils/authUser';
import {RegisterUserSchema} from "../schemas/userSchema";

async function authRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/register_user',
    schema: RegisterUserSchema,
    preHandler: [authenticateUser],
    handler: registerUserController,
  });
}

export default authRoutes;
