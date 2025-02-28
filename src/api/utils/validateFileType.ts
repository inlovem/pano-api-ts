import { FastifyReply, FastifyRequest } from 'fastify';


export async function validateFileType(request: FastifyRequest, reply: FastifyReply) {
    const data = await (request as any).file();
    if (!data) {
      reply.status(400).send({ message: 'File is required.' });
      return;
    }
    // Define allowed types
    const allowedTypes = ['image/jpeg', 'image/png'];
    
    if (!allowedTypes.includes(data.mimetype)) {
      reply.status(400).send({ message: 'Invalid file type. Only JPEG and PNG are allowed.' });
      return;
    }
    
    request.fileData = data;

  }