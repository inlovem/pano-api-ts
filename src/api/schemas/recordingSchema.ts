import { Type } from "@sinclair/typebox";
import { FastifySchema } from "fastify";
import {
  ERROR400,
  ERROR401,
  ERROR500,
} from "../constants/constants";

/**
 * This schema matches the shape your controller expects:
 * {
 *   data: {
 *     id: string;
 *     type: "recording";
 *     attributes: {
 *       title?: string;
 *       description?: string;
 *     }
 *   }
 * }
 */
const UpdateRecordingRequestBodySchema = Type.Object({
  data: Type.Object({
    id: Type.String(),
    type: Type.Literal("recording"),
    attributes: Type.Optional(
      Type.Object({
        title: Type.Optional(Type.String()),
        description: Type.Optional(Type.String()),
      })
    ),
  }),
});

export const UpdateRecordingSchema: FastifySchema = {
  body: UpdateRecordingRequestBodySchema,
  response: {
    200: Type.Object({
      data: Type.Object({
        id: Type.String(),
        type: Type.Literal("recording"),
        attributes: Type.Object({
          title: Type.Optional(Type.String()),
          description: Type.Optional(Type.String()),
        }),
      }),
    }),
    400: ERROR400,
    401: ERROR401,
    500: ERROR500,
  },
};
