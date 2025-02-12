// src/api/utils/authUser.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import admin from '../config/firebase';
import jwt from 'jsonwebtoken';


const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
/**
 *
 * Expects an Authorization header with a Bearer token.
 */
export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  console.log("authenticateUser: Starting authentication process.");

  // Retrieve the Authorization header from the request
  const authHeader = request.headers.authorization;
  console.log("authenticateUser: Authorization header received:", authHeader);

  // Check that the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("authenticateUser: Missing or invalid Authorization header.");
    reply
        .code(401)
        .send({ error: "Missing or invalid Authorization header" });
    return;
  }

  // Extract the token part from the header
  const token = authHeader.split(' ')[1];
  console.log("authenticateUser: Extracted token:", token);

  try {
    console.log("authenticateUser: Verifying token with Firebase Admin SDK...");
    // Use Firebase Admin SDK to verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("authenticateUser: Token verified successfully. Decoded token:", decodedToken);

    // Attach user information (uid and email, if available) to the request object
    (request as any).user = { uid: decodedToken.uid, email: decodedToken.email };
    console.log("authenticateUser: User info attached to request:", (request as any).user);
    // Continue with the request handling...
  } catch (error: any) {
    console.error("authenticateUser: Error during token verification:", error);
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

/**
 * Decodes the JWT from the Authorization header and attaches the user info to the request.
 * This way, we can securely use the user's uid from the token (and not rely on a client-provided uid).
 */
export async function decodeJWT(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    reply.code(401).send({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decode the token using our HS256 verification
    const decoded = await verifyToken(token);
    // Attach the user information to the request object.
    // We assume that the token payload contains an 'id' (user id) and 'email'.
    (request as any).user = {
      uid: decoded.id,
      email: decoded.email,
    };
  } catch (error: any) {
    return reply.status(401).send({
      message: 'Invalid or expired token',
      error: error.message || error,
    });
  }
}
