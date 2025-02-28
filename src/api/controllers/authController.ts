// src/api/controllers/authController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import {
    registerUser,
    loginUser,
    updateUserProfile,
    loginWithSocial
} from '../services/authService';
import { LoginRequestBody, RegisterRequestBody, UpdateProfileRequestBody, SocialLoginRequestBody } from '../types/interfaces';
import * as schema from '../schemas/userSchema';
import admin from '../config/firebase';



/**
 * Controller for registering a new user.
    */
export async function registerController(
    request: FastifyRequest<{ Body: RegisterRequestBody }>,
    reply: FastifyReply
) {
    const { email, password } = request.body;
    if (!email || !password) {
        return reply.status(400).send({ message: 'Email and password are required' });
    }
    try {
        const userRecord = await registerUser({ email, password });
        return reply.status(201).send(userRecord);
    } catch (error: any) {
        return reply.status(500).send({ message: 'Error registering user', error: error.message || error });
    }
}

/**
 * Controller for logging in an existing user using email/password.
 */
export async function loginController(
    request: FastifyRequest<{ Body: LoginRequestBody }>,
    reply: FastifyReply
) {
    const { email, password } = request.body;
    if (!email || !password) {
        return reply.status(400).send({ message: 'Email and password are required' });
    }
    try {
        const loginResult = await loginUser({ email, password });
        return reply.status(200).send(loginResult);
    } catch (error: any) {
        return reply.status(500).send({ message: 'Error logging in user', error: error.message || error });
    }
}

/**
 * Controller for updating the user's profile.
 * Requires a valid Firebase ID token in the Authorization header.
 */
export async function updateProfileController(
    request: FastifyRequest<{ Body: UpdateProfileRequestBody }>,
    reply: FastifyReply
) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return reply.status(401).send({ message: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return reply.status(401).send({ message: 'Token missing' });
    }
    let uid: string;
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        uid = decodedToken.uid;
    } catch (error: any) {
        return reply.status(401).send({ message: 'Invalid or expired token', error: error.message || error });
    }
    const { displayName, photoURL } = request.body;
    if (!displayName && !photoURL) {
        return reply.status(400).send({ message: 'At least one property (displayName or photoURL) must be provided for update' });
    }
    try {
        const updatedUser = await updateUserProfile({ uid, displayName, photoURL });
        return reply.status(200).send(updatedUser);
    } catch (error: any) {
        return reply.status(500).send({ message: 'Error updating profile', error: error.message || error });
    }
}



/**
 * Controller for social login using Google.
 */
export async function googleLoginController(
    request: FastifyRequest<{ Body: SocialLoginRequestBody }>,
    reply: FastifyReply,
) {
    const { token } = request.body;
    if (!token) {
        return reply.status(400).send({ message: 'Token is required' });
    }
    try {
        const loginResult = await loginWithSocial({ token, providerId: 'google.com' });
        return reply.status(200).send(loginResult);
    } catch (error: any) {
        return reply.status(500).send({ message: 'Error with Google login', error: error.message || error });
    }
}

/**
 * Controller for social login using Apple.
 */
export async function appleLoginController(
    request: FastifyRequest<{ Body: SocialLoginRequestBody }>,
    reply: FastifyReply
) {
    const { token } = request.body;
    if (!token) {
        return reply.status(400).send({ message: 'Token is required' });
    }
    try {
        const loginResult = await loginWithSocial({ token, providerId: 'apple.com' });
        return reply.status(200).send(loginResult);
    } catch (error: any) {
        return reply.status(500).send({ message: 'Error with Apple login', error: error.message || error });
    }
}

/**
 * Controller for social login using Facebook.
 */
export async function facebookLoginController(
    request: FastifyRequest<{ Body: SocialLoginRequestBody }>,
    reply: FastifyReply
) {
    const { token } = request.body;
    if (!token) {
        return reply.status(400).send({ message: 'Token is required' });
    }
    try {
        const loginResult = await loginWithSocial({ token, providerId: 'facebook.com' });
        return reply.status(200).send(loginResult);
    } catch (error: any) {
        return reply.status(500).send({ message: 'Error with Facebook login', error: error.message || error });
    }
}
