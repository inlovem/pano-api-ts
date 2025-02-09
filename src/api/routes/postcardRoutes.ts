import { FastifyInstance } from 'fastify';
import { authenticateUser } from '../utils/authUser';
import { updatePostCardController} from '../controllers/postCardController';
import { UpdatePostCardSchema } from '../schemas/postCardSchema';


async function PostcardRoutes(fastify: FastifyInstance) {
    fastify.route({  
        method: 'PATCH',
        url: '/postcard/:postcardId',
        schema: UpdatePostCardSchema,
        preHandler: [authenticateUser], 
        handler: updatePostCardController
    });
}
export default PostcardRoutes;

