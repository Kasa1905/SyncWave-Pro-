import fastify from 'fastify';

const app = fastify();

app.get('/health', async (request, reply) => {
  return { status: 'healthy' };
});

const start = async () => {
  try {
    await app.listen({ port: 3003 });
    console.log('Test server running on http://localhost:3003');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
