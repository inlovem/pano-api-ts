import { FastifyInstance } from 'fastify'
import { FastifyPluginAsync } from 'fastify'
import * as controllers from './index'


export default async function router(fastify: FastifyInstance):Promise<void> {



  fastify.register(controllers.ConversationRoutes)

    
  console.log('Routes registered')





}

