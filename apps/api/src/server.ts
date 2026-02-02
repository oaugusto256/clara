import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { importCsvRoute } from './http/routes/import';
import { docsPlugin } from './infra/docs/docs';

export function createServer(): FastifyInstance {
  const app = Fastify({ logger: false });

  // Register content type parser globally for CSV/text
  app.addContentTypeParser(['text/csv', 'text/plain'], { parseAs: 'string' }, function (req, body, done) {
    done(null, body as string);
  });

  // Register OpenAPI docs (Swagger UI)
  app.register(docsPlugin);

  // Register CSV import route(s)
  app.register(importCsvRoute);

  // Health check route
  app.get('/health', async (req, reply) => {
    return { status: 'ok' };
  });

  return app;
}
