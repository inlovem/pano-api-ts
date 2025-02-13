// src/api/controllers/authController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { registerUserService } from '../services/authService';
import { IUserData } from 'src/api/types/interfaces';

export async function registerUserController(request: FastifyRequest, reply: FastifyReply) {

    const userFromToken = (request as any).user;

    if (!userFromToken) {
        return reply.status(401).send({ error: 'Unauthorized: No user data available' });
    }

    // Build the user data object according to your IUserData interface.
    const userData: IUserData = {
        uid: userFromToken.uid,
        email: userFromToken.email,
        username: userFromToken.username || '',
        profile_picture: userFromToken.profile_picture || '',
        phone_number: userFromToken.phone_number || '',
        created_at: new Date().toISOString(),
        added_to_postcards: [],
        created_postcards: [],
    };

    try {
        await registerUserService(userData);
        return reply.code(201).send({ message: 'User registered successfully' });
    } catch (error: any) {
        return reply.status(500).send({ error: 'Unable to register user', details: error.message });
    }
}
