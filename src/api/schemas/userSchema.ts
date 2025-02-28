// src/schemas/UserSchemas.ts

import { Type } from "@sinclair/typebox";
import { FastifySchema } from "fastify";
import {
  ERROR400,
  ERROR401,
  ERROR500,
} from "../constants/constants";

/**
 * Request body schemas based on your interfaces.
 */




const RegisterRequestBodySchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String(),
});

const LoginRequestBodySchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String(),
});

const UpdateProfileRequestBodySchema = Type.Object({
  displayName: Type.Optional(Type.String()),
  photoURL: Type.Optional(Type.String()),
});

const SocialLoginRequestBodySchema = Type.Object({
  token: Type.String(),
});


const FirebaseUserRecordSchema = Type.Object({
  uid: Type.String(),
  email: Type.String({ format: "email" }),
  displayName: Type.Optional(Type.String()),
  photoURL: Type.Optional(Type.String()),
});

/**
 * Response schema for login endpoints, which return tokens and user details.
 * The structure below mirrors a typical Firebase Identity Toolkit response.
 */
const LoginResponseSchema = Type.Object({
  idToken: Type.String(),
  refreshToken: Type.String(),
  expiresIn: Type.String(),
  localId: Type.String(),
  email: Type.String({ format: "email" }),
  displayName: Type.Optional(Type.String()),
});

/**
 * Schema for the register endpoint.
 */
export const RegisterSchema: FastifySchema = {
  body: RegisterRequestBodySchema,
  response: {
    201: FirebaseUserRecordSchema,
    400: ERROR400,
    500: ERROR500,
  },
};

/**
 * Schema for the login endpoint.
 */
export const LoginSchema: FastifySchema = {
  body: LoginRequestBodySchema,
  response: {
    200: LoginResponseSchema,
    400: ERROR400,
    500: ERROR500,
  },
};

/**
 * Schema for updating the user's profile.
 * Note the inclusion of the 401 error response for authentication failures.
 */
export const UpdateProfileSchema: FastifySchema = {
  body: UpdateProfileRequestBodySchema,
  response: {
    200: FirebaseUserRecordSchema,
    400: ERROR400,
    401: ERROR401,
    500: ERROR500,
  },
};

/**
 * Schema for social login endpoints (Google, Apple, and Facebook).
 * They share the same request body and response structure.
 */
export const SocialLoginSchema: FastifySchema = {
  body: SocialLoginRequestBodySchema,
  response: {
    200: LoginResponseSchema,
    400: ERROR400,
    500: ERROR500,
  },
};




// idk the shcema for the user object returned by Firebase
export const GoogleLoginSchema = SocialLoginSchema;
export const AppleLoginSchema = SocialLoginSchema;
export const FacebookLoginSchema = SocialLoginSchema;
