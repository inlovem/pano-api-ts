// src/api/utils/authUser.ts
import {FastifyReply, FastifyRequest} from 'fastify';
import admin from '../config/firebase';
import {jwtDecode} from 'jwt-decode';

/**
 * Authenticates the user using Firebase Admin SDK.
 * Expects an Authorization header with a Bearer token.
 */
export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply.code(401).send({error: "Missing or invalid Authorization header"});
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token with Firebase Admin SDK.
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Attach the user info (uid and email) to the request.
        (request as any).user = {uid: decodedToken.uid, email: decodedToken.email};
    } catch (error: any) {
        return reply.status(401).send({
            message: 'Invalid or expired token',
            error: error.message || error,
        });
    }
}

/**
 * Decodes the JWT from the Authorization header without verifying its signature.
 * This function is used solely to extract token payload data.
 */
export async function decodeJWT(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply.code(401).send({error: "Missing or invalid Authorization header"});
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        // Decode the token without verifying its signature.
        const decoded: any = jwtDecode(token);
        // Attach the decoded user information to the request.
        (request as any).user = {
            uid: decoded.user_id,
            email: decoded.email,
            username: decoded.name,
            profile_picture: decoded.picture,
            phone_number: decoded.phone_number,
        };
    } catch (error: any) {
        return reply.status(401).send({
            message: 'Unable to decode token',
            error: error.message || error,
        });
    }
}
