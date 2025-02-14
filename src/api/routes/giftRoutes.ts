import { FastifyInstance } from 'fastify';
import { authenticateUser } from '../utils/authUser';
import * as gifts from '../controllers/giftController';



async function giftRoutes(fastify: FastifyInstance) {
    fastify.route({  
        method: 'GET',
        url: '/gifts/sent/all',
        // schema: UpdatePostCardSchema,
        preHandler: [authenticateUser], 
        handler: gifts.getSentGiftsController
    });
    fastify.route({  
        method: 'GET',
        url: '/gifts/recieved/all',
        // schema: UpdatePostCardSchema,
        preHandler: [authenticateUser], 
        handler: gifts.getReceivedGiftsController
    });
    fastify.route({
        method: 'POST',
        url: '/gifts/create',
        // schema: UpdatePostCardSchema,
        preHandler: [authenticateUser], 
        handler: gifts.createGiftController
    });
}


export default giftRoutes;

