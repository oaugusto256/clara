
import { createServer } from './server';

const server = createServer();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

server.listen({ port: PORT }).then(() => {
  // eslint-disable-next-line no-console
  console.log(`API listening on ${PORT}`);
});
