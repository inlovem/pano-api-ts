// src/schemas/imageProcessingSchema.ts

import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { ERROR400, ERROR500 } from '../constants/constants.js';

/**
 * Schema for the generate image description endpoint.
 * 
 * Note: The request is handled via multipart/form-data (using fastify-multipart),
 * so we do not define a request body schema here.
 *
 * The response is expected to be:
 * {
 *   "imageDescription": string
 * }
 */
export const GenerateImageDescriptionSchema: FastifySchema = {
  response: {
    200: Type.Object({
      imageDescription: Type.String(),
    }),
    400: ERROR400,
    500: ERROR500,
  },
};

/**
 * Schema for the image conversation endpoint.
 * 
 * Expected request body (JSON):
 * {
 *   "imageDescription": string,
 *   "question": string
 * }
 *
 * Expected response:
 * {
 *   "answer": string
 * }
 */
export const ImageConversationSchema: FastifySchema = {
  body: Type.Object({
    imageDescription: Type.String(),
    question: Type.String(),
    threadId: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Object({
      answer: Type.String(),
    }),
    400: ERROR400,
    500: ERROR500,
  },
};
