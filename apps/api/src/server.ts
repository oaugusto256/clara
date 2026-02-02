import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { attachDocs } from './docs';
import { importCsvRoute } from './http/routes/import';

export function createServer(): FastifyInstance {
  const app = Fastify({ logger: false });

  // Register OpenAPI docs (Swagger UI)
  app.register(async (instance) => {
    attachDocs(instance);
  });

  // Register CSV import route(s)
  app.register(importCsvRoute);

  // Health check route
  app.get('/health', async (req, reply) => {
    return { status: 'ok' };
  });

  return app;
}
