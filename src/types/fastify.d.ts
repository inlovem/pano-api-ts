import 'fastify';
import { PhotoConversationsService } from '../services/photoConversationsService';

declare module 'fastify' {
  interface FastifyInstance {
    photoConversationsService: PhotoConversationsService;
  }
}