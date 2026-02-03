
import { createServer } from './server';

const server = createServer();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

server.listen({ port: PORT })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Documentation available at http://localhost:${PORT}/docs`);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
