import { FastifyRequest, FastifyReply } from 'fastify';
import admin from '../config/firebase';
// Import the default function from 'jwt-decode'
import { jwtDecode } from "jwt-decode";
/**
 * Authenticates the user using Firebase Admin SDK.
 * Expects an Authorization header with a Bearer token.
 */
export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (request as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error: any) {
    return reply.status(401).send({
      message: 'Invalid or expired token',
      error: error.message || error,
    });
  }
}

/**
 * Decodes the JWT without verifying its signature.
 * Merges additional fields (username, profile_picture, phone_number) into request.user.
 */
export async function decodeJWT(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Use jwt_decode (the default export), not a named import
    const decoded = jwtDecode(token) as any;

    (request as any).user = {
      ...((request as any).user || {}),
      uid: decoded.user_id || ((request as any).user && (request as any).user.uid),
      email: decoded.email || ((request as any).user && (request as any).user.email),
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
