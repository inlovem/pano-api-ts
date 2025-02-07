// src/routes/conversationRoutes.ts

import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { ConversationService } from '../services/conversationService';
import { ConversationController } from '../controllers/ConversationController'
import { PhotoService } from '../services/photoService';
import { PhotoService as ConversationPhotoService } from '../services/photoService'; // Assuming same service used
import { ResourceTypes } from '../../config/constants';
import * as schemas from '../schemas/conversationSchema';
// import { jsonHandler } from '../../utils/responseHandler';


export const ConversationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const conversationService = new ConversationService();
  const photoService = new ConversationPhotoService();
  const conversationController = new ConversationController(conversationService);

  // GET /photo-conversations/:photoId
  fastify.route({
    method: 'GET',
    url: '/photo-conversations/:photoId',
    schema: schemas.getPhotoConversationsSchema,
    handler: async (request: FastifyRequest<{ Params: { photoId: string } }>, reply) => {
      try{

      const { photoId } = request.params;
      const conversationMessages = await conversationService.fetchConversationMessages(photoId);

      const data = await Promise.all(conversationMessages.map(async conversation => {
        const resourceObject = await conversation.toJSONAPIResourceObject();
        return resourceObject.data;
      }));
   
      return { data };
    } catch (error) {
      console.error('[500]', error);
      return reply.code(500).send({ status: 500 });
    }
    }
  });



  // POST /photo-conversations/:photoId
  fastify.route({
    method: 'POST',
    url: '/photo-conversations/:photoId',
    schema: schemas.postPhotoConversationsSchema,
    handler: (request: FastifyRequest<{ Params: { photoId: string }; Body: any }>, reply) => {
      conversationController.createPhotoConversationHandler(request, reply);
    }
  });

  // Additional conversation-related routes can be added here
};
