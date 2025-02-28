import 'fastify';
import { IUser } from '../interfaces'; 


declare module 'fastify' {
  interface FastifyRequest {
    user: IUser;
    fileData?: any;
  }
}