
import { FastifyReply, FastifyRequest } from 'fastify';
import admin from 'firebase-admin';

/**
 *
 * Expects an Authorization header with a Bearer token.
 */
export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return reply.status(401).send({ message: 'Token missing' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (request as any).user = { uid: decodedToken.uid };
  } catch (error: any) {
    return reply.status(401).send({
      message: 'Invalid or expired token',
      error: error.message || error,
    });
  }
}