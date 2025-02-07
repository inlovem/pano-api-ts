// server.js
import fastify from 'fastify';
import router from './api/routes/router';
import cors from '@fastify/cors';
import fjwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';

const server = fastify({
  logger: process.env.NODE_ENV !== 'development',
});

server.register(fjwt, { secret: process.env.JWT_SECRET || 'default_secret' });
server.register(fCookie, { secret: process.env.COOKIE_SECRET || 'some-secret-key' });
server.register(cors, { origin: '*' });
server.register(router);

export default server;
