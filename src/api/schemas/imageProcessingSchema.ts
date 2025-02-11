// src/schemas/imageProcessingSchema.ts
import { Type } from "@sinclair/typebox";
import { FastifySchema } from "fastify";
import { ERROR400, ERROR401, ERROR500 } from "../constants/constants";

/**
 * Schema for generating an image description.
 *
 * Expected response (JSON:API style):
 * {
 *   "data": {
 *     "type": "imageDescription",
 *     "attributes": {
 *       "imageDescription": "string"
 *     }
 *   }
 * }
 */
export const ImageDescriptionSchema: FastifySchema = {
    response: {
        200: Type.Object({
            data: Type.Object({
                type: Type.Literal("imageDescription"),
                attributes: Type.Object({
                    imageDescription: Type.String(),
                }),
            }),
        }),
        400: ERROR400,
        401: ERROR401,
        500: ERROR500,
    },
};

/**
 * Schema for having a conversation based on an image description.
 *
 * Expected request (JSON:API style):
 * {
 *   "data": {
 *     "type": "imageConversation",
 *     "attributes": {
 *       "imageDescription": "string",
 *       "question": "string"
 *     }
 *   }
 * }
 *
 * Expected response (JSON:API style):
 * {
 *   "data": {
 *     "type": "imageConversation",
 *     "attributes": {
 *       "answer": "string"
 *     }
 *   }
 * }
 */
const ImageConversationRequestBodySchema = Type.Object({
    data: Type.Object({
        type: Type.Literal("imageConversation"),
        attributes: Type.Object({
            imageDescription: Type.String(),
            question: Type.String(),
        }),
    }),
});

export const ImageConversationSchema: FastifySchema = {
    body: ImageConversationRequestBodySchema,
    response: {
        200: Type.Object({
            data: Type.Object({
                type: Type.Literal("imageConversation"),
                attributes: Type.Object({
                    answer: Type.String(),
                }),
            }),
        }),
        400: ERROR400,
        401: ERROR401,
        500: ERROR500,
    },
};
