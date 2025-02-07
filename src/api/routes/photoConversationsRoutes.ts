import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { getPhotoConversationsHandler, postPhotoConversationsHandler } from '../controllers/photoConversationsController';

// Define the shape of your service
interface Service {
  fetchPhotoConversations: (photoId: string) => Promise<any[]>;
  createPhotoConversation: (photoId: string, threadId: string) => Promise<any>;
}

const photoConversationsPath = '/photo-conversations';

/**
 * Defines the photo conversations routes.
 *
 * @param fastify - The Fastify instance.
 * @param opts - The plugin options.
 */
export const PhotoConversationsRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) => {
  // Assume that the service is registered in the Fastify instance
  const service: Service = fastify.diContainer.resolve('photoConversationsService');

  // GET /photo-conversations/:photoId
  fastify.route({
    method: 'GET',
    url: `${photoConversationsPath}/:photoId`,
    handler: async (request: FastifyRequest<{ Params: { photoId: string } }>, reply: FastifyReply) => {
      await getPhotoConversationsHandler(request, reply, service);
    },
  });

  // POST /photo-conversations/:photoId
  fastify.route({
    method: 'POST',
    url: `${photoConversationsPath}/:photoId`,
    handler: async (request: FastifyRequest<{ Params: { photoId: string }; Body: any }>, reply: FastifyReply) => {
      await postPhotoConversationsHandler(request, reply, service);
    },
  });
};
