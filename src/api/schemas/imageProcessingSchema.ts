// src/schemas/imageProcessingSchema.ts

import { Type, Static } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { ERROR400, ERROR500 } from '../constants/constants';

/**
 * Schema for the generate image description endpoint.
 * Note: Handled via multipart/form-data, so no request body schema here.
 * Response: { imageDescription: string }
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
 * Request Body: { imageDescription: string, question: string, threadId?: string }
 * Response: { answer: string }
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

/**
 * Define the body schema for storing image data as a separate constant.
 */
const StoreImageDataBody = Type.Object({
  resource_url: Type.String({ description: "Firebase Storage URL for image" }),
  conversation_id: Type.Optional(
      Type.Number({ description: "Reference to a conversation in Firestore if needed" })
  ),
  audio_id: Type.Optional(
      Type.Number({ description: "Reference to an associated audio entry" })
  ),
  message_reference: Type.Optional(
      Type.Number({ description: "Reference to message ID if applicable" })
  ),
});

/**
 * Schema for storing image data based on the defined Images Table.
 * Table images {
 *   id integer [pk]
 *   resource_url varchar
 *   conversation_id integer
 *   audio_id integer
 *   message_reference integer
 * }
 */
export const StoreImageDataSchema: FastifySchema = {
  body: StoreImageDataBody,
  response: {
    200: Type.Object({
      success: Type.Boolean(),
      imageId: Type.Number({ description: "Generated primary key for the image" }),
    }),
    400: ERROR400,
    500: ERROR500,
  },
};

// Derive the static type from the standalone schema constant.
export type StoreImageDataInput = Static<typeof StoreImageDataBody>;
