// src/api/controllers/authController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/authService';
import { User } from '../schemas/user';

interface RegisterRequestBody {
    uid: string;
    user: User;
}

interface LoginRequestBody {
    uid: string;
}

/**
 * Register a new user in Realtime DB and memory.
 */
export async function registerController(
    request: FastifyRequest<{ Body: RegisterRequestBody }>,
    reply: FastifyReply
) {
    try {
        const { uid, user } = request.body;
        if (!uid || !user) {
            return reply.status(400).send({ message: 'Missing uid or user in request body' });
        }

        // Create user in DB + memory
        const createdUser = await AuthService.createUser(uid, user);

        return reply.status(201).send({ message: 'User registered successfully', user: createdUser });
    } catch (error: any) {
        return reply.status(500).send({ message: 'Error registering user', error: error.message || error });
    }
}

/**
 * Login by just verifying the user is in our DB/memory.
 */
export async function loginController(
    request: FastifyRequest<{ Body: LoginRequestBody }>,
    reply: FastifyReply
) {
    try {
        const { uid } = request.body;
        if (!uid) {
            return reply.status(400).send({ message: 'Missing uid in request body' });
        }

        // Check if user record exists
        const isAuthenticated = await AuthService.authenticate(uid);
        if (!isAuthenticated) {
            return reply.status(401).send({ message: 'Invalid UID or user not found' });
        }

        return reply.status(200).send({ message: 'Login successful', uid });
    } catch (error: any) {
        return reply.status(500).send({ message: 'Error logging in', error: error.message || error });
    }
}
