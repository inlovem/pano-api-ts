// src/api/controllers/postCardController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/postCardService';
import { IUpdatePostCardParams, IUpdatePostCardBody } from '../types/interfaces';

/**
 * Controller for updating a postcard.
 */
export async function updatePostCardController(
    request: FastifyRequest<{
      Params: IUpdatePostCardParams;
      Body: IUpdatePostCardBody;
    }>,
    reply: FastifyReply
) {
  // Extract params and body
  const { postCardId } = request.params;
  const { data } = request.body;
  const { id, type, attributes = {} } = data;
  const { uid } = (request as any).user;

  if (type !== 'postCard' || String(id) !== String(postCardId)) {
    return reply.status(409).send({
      errors: [{ status: '409', title: 'Unrecognized type or invalid id' }],
      status: 409,
    });
  }

  try {
    await service.updateUserPostCard(uid, postCardId, attributes);
    return reply.status(200).send({
      data: {
        id: postCardId,
        type: 'postCard',
        attributes: attributes,
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error updating postcard:', error);
    return reply.status(500).send({
      errors: [{ status: '500', title: 'Internal Server Error' }],
      status: 500,
    });
  }
}

/**
 * Controller for creating a new postcard.
 *
 * Expects a request body (JSON:API style):
 * {
 *   "data": {
 *     "type": "postCard",
 *     "attributes": {
 *       "s3Key": "string",       // Optional
 *       "transcript": "string"   // Optional
 *     }
 *   }
 * }
 *
 * The JWT token (decoded by the preHandler) is used to extract the user ID.
 */
export async function createPostCardController(
    request: FastifyRequest<{
      Body: {
        data: {
          type: 'postCard';
          attributes: {
            s3Key?: string;
            transcript?: string;
          };
        };
      };
    }>,
    reply: FastifyReply
) {
  // Retrieve user from the decoded JWT (either uid or user_id)
  const user = (request as any).user;
  const uid = user.uid || user.user_id;
  if (!uid) {
    return reply.status(401).send({ message: 'User not authenticated' });
  }

  const { data } = request.body;
  const { type, attributes = {} } = data;

  if (type !== 'postCard') {
    return reply.status(409).send({
      errors: [{ status: '409', title: 'Unrecognized type' }],
      status: 409,
    });
  }

  try {
    const createdPostCard = await service.createPostCard(uid, attributes);
    return reply.status(201).send({
      data: {
        id: createdPostCard.id,
        type: 'postCard',
        attributes: createdPostCard.attributes,
      },
      status: 201,
    });
  } catch (error: any) {
    console.error('Error creating postcard:', error);
    return reply.status(500).send({
      errors: [{ status: '500', title: 'Internal Server Error' }],
      status: 500,
    });
  }
}
