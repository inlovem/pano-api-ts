import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { patchPhotoHandler } from '../controllers/photoUpdateController';
import { PhotoService } from '../services/photoService';

const photoUpdatePath = '/photos';

export const PhotoUpdateRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) => {
  // Assume that the service is registered in the Fastify instance
  const service: PhotoService = fastify.diContainer.resolve('photoService');

  // PATCH /photos/:photoId
  fastify.route({
    method: 'PATCH',
    url: `${photoUpdatePath}/:photoId`,
    handler: async (
      request: FastifyRequest<{ Params: { photoId: string }; Body: any }>,
      reply: FastifyReply
    ) => {
      await patchPhotoHandler(request, reply, service);
    },
  });
};
