import { FastifyReply } from 'fastify';

interface JsonAPIResponse {
  data?: any;
  errors?: Array<{ status: string; title: string }>;
  status?: number;
}

export function sendJsonAPI(reply: FastifyReply, response: JsonAPIResponse) {
  if (response.status) {
    reply.status(response.status);
  }
  reply.send(response);
}