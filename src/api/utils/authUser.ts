
import { FastifyReply, FastifyRequest } from 'fastify';
import admin from '../config/firebase';
import jwt from 'jsonwebtoken';


const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
/**
 *
 * Expects an Authorization header with a Bearer token.
 */
export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    reply
        .code(401)
        .send({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Use Firebase Admin SDK exclusively
    const decodedToken = await admin.auth().verifyIdToken(token);
    (request as any).user = { uid: decodedToken.uid };
    // Continue with the request handling...
  } catch (error: any) {
    return reply.status(401).send({
      message: 'Invalid or expired token',
      error: error.message || error,
    });
  }
}






/**
 * Verifies the JWT token.
 * @param token The JWT token to verify.
 * @returns The decoded user information if the token is valid.
 * @throws If the token is invalid or missing.
 */
const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
      if (err) {
        reject(err); // Token verification failed
      } else {
        const payload = decoded as any;
        resolve({
          id: payload.id,
          email: payload.email,
        });
      }
    });
  });
};
