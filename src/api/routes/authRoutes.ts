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

import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  SocialLoginSchema,
} from '../schemas/userSchema';

/**
 * Authentication routes.
 * 
    * @param fastify Fastify instance
    */
async function authRoutes(fastify: FastifyInstance) {

  fastify.route({
    method: 'POST',
    url: '/auth/register',
    schema: RegisterSchema,  // Validates request body & sets response schema
    handler: registerController,
  });

  fastify.route({
    method: 'POST',
    url: '/auth/login',
    schema: LoginSchema,     // Validates request body & sets response schema
    handler: loginController,
  });

  fastify.route({
    method: 'PATCH',
    url: '/auth/updateProfile',
    schema: UpdateProfileSchema, // Validates request body & sets response schema
    handler: updateProfileController,
  });

  // Social provider logins (Google, Apple, Facebook) share the same schema in this example
  fastify.route({
    method: 'POST',
    url: '/auth/google',
    schema: SocialLoginSchema,
    handler: googleLoginController,
  });

  fastify.route({
    method: 'POST',
    url: '/auth/apple',
    schema: SocialLoginSchema,
    handler: appleLoginController,
  });

  fastify.route({
    method: 'POST',
    url: '/auth/facebook',
    schema: SocialLoginSchema,
    handler: facebookLoginController,
  });
}

export default authRoutes;
