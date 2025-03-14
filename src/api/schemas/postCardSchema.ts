// src/schemas/postCardSchema.ts

import { Type } from "@sinclair/typebox";
import { FastifySchema } from "fastify";
import { ERROR400, ERROR401, ERROR500 } from "../constants/constants";

/**
 * Schema for updating a postcard.
 * Expected request body (JSON:API style):
 * {
 *   "data": {
 *     "id": "<postCardId>",
 *     "type": "postCard",
 *     "attributes": {
 *       "s3Key": "string",       // Optional
 *       "transcript": "string"   // Optional
 *     }
 *   }
 * }
 */
const UpdatePostCardRequestBodySchema = Type.Object({
  data: Type.Object({
    id: Type.String(),
    type: Type.Literal("postCard"),
    attributes: Type.Object({
      s3Key: Type.Optional(Type.String()),
      transcript: Type.Optional(Type.String()),
    }),
  }),
});

export const UpdatePostCardSchema: FastifySchema = {
  body: UpdatePostCardRequestBodySchema,
  response: {
    200: Type.Object({
      data: Type.Object({
        id: Type.String(),
        type: Type.Literal("postCard"),
        attributes: Type.Object({
          s3Key: Type.Optional(Type.String()),
          transcript: Type.Optional(Type.String()),
        }),
      }),
    }),
    400: ERROR400,
    401: ERROR401,
    500: ERROR500,
  },
};
