import { Type } from "@sinclair/typebox";
import { FastifySchema } from "fastify";
import {
  ERROR400,
  ERROR401,
  ERROR404,
  ERROR409,
  ERROR500,
  responseProperty,
} from "../../config/constants";



export const getPhotoConversationsSchema: FastifySchema = {
    params: Type.Object({
      photoId: Type.String(),
    }),
    response: {
      200: Type.Object({
        data: Type.Array(
          Type.Object({
            id: Type.String(),
            type: Type.String(),
            attributes: Type.Object({
              threadId: Type.String(),
              photoId: Type.String(),
              createdAt: Type.String({ format: "date-time" }),
            }),
          })
        ),
      }),
      404: ERROR404,
      500: ERROR500,
    },
  };


export const postConversationSchema: FastifySchema = {
    params: Type.Object({
        photoId: Type.String(),
        }),
    body: Type.Object({
      data: Type.Object({
        attributes: Type.Object({
          photoId: Type.String(),
          file: Type.String()
        }),
        type: Type.String()
      })
    }),
    response: {
      200: Type.Object({
        data: Type.Object({
          id: Type.String(),
          threadId: Type.String(),
          photoId: Type.String(),
          createdAt: Type.String({ format: 'date-time' })
        })
      }),
      409: Type.Object({
        errors: Type.Array(Type.Object({
          status: Type.String(),
          title: Type.String()
        }))
      }),
      500: ERROR500
    }
  };