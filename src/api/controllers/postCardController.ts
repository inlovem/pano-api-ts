import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/postCardService';
import {IUpdatePostCardParams, IUpdatePostCardBody, IUser } from '../types/interfaces';




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
    const uid = request.user.uid as string;
    
    if (type !== 'postCard' || String(id) !== String(postCardId)) {
      return reply.status(409).send({
        errors: [{ status: '409', title: 'Unrecognized type or invalid id' }],
        status: 409,
      });
    }
    try {
      const updatedPostCard = await service.updateUserPostCard(
        uid, 
        postCardId,
        attributes
      );
  
      return reply.status(200).send({
        data: {
          id: postCardId, 
          type: 'postCard',
          attributes: updatedPostCard,
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
