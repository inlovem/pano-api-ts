import app from './server';
import { connectToDb } from './utils/dbUtils';
// import { schedulerPlugin } from './utils/scheduler.js';

const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 8080;

const startServer = async (): Promise<void> => {
  try {
    await connectToDb();

    // Register the scheduler plugin before starting the server.
    // await app.register(schedulerPlugin);

    await app.listen({ port: 8080, host: '0.0.0.0' });
    console.log(`Server listening at http://0.0.0.0:${FASTIFY_PORT}`);
  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
};

startServer();

// Gracefully handle shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await app.close();
  console.log('Server has been closed');
  process.exit(0);
});
