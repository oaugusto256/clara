import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { importCsvRoute } from './http/routes/import';
import { keywordCategoryRoutes } from './http/routes/keywordCategory';
import { transactionsRoute } from './http/routes/transactions';

export function createServer(): FastifyInstance {
  const app = Fastify({ logger: true });

  // Register CORS for local dev
  app.register(fastifyCors, {
    origin: true, // Allow all origins for dev/testing and Swagger UI
    methods: ['POST', 'GET', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type'],
  });

  // Register content type parser globally for CSV/text
  app.addContentTypeParser(['text/csv', 'text/plain'], { parseAs: 'string' }, function (req, body, done) {
    done(null, body as string);
  });


  // Register OpenAPI docs (Swagger) FIRST
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Clara API',
        description: 'Financial Transactions API',
        version: '0.1.0',
      },
      tags: [
        { name: 'import', description: 'Import endpoints' },
      ],
      components: {
        schemas: {
          NormalizedTransactionInput: {
            type: 'object',
            properties: {
              accountExternalId: { type: 'string' },
              description: { type: 'string' },
              amount: { type: 'number' },
              currency: { type: 'string' },
              date: { type: 'string' },
            },
            required: ['accountExternalId', 'description', 'amount', 'currency', 'date'],
            additionalProperties: false,
          },
          Transaction: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              accountId: { type: 'string' },
              description: { type: 'string' },
              amount: {
                type: 'object',
                properties: {
                  amount: { type: 'number' },
                  currency: { type: 'string' },
                },
                required: ['amount', 'currency'],
                additionalProperties: false,
              },
              direction: { type: 'string', enum: ['income', 'expense'] },
              date: { type: 'string' },
              postedAt: { type: 'string' },
              categoryId: { type: 'string' },
              categoryKey: { type: 'string' },
              source: { type: 'string', enum: ['csv', 'ofx', 'open_finance_mock', 'open_finance_real'] },
              metadata: { type: 'object' },
            },
            required: ['id', 'userId', 'accountId', 'description', 'amount', 'direction', 'date', 'source'],
            additionalProperties: true,
          },
          ImportError: {
            type: 'object',
            properties: {
              line: { type: 'number' },
              reason: { type: 'string' },
            },
            required: ['line', 'reason'],
            additionalProperties: false,
          },
        },
      },
    },
  });

  app.register(importCsvRoute);
  app.register(transactionsRoute);
  app.register(keywordCategoryRoutes);

  // Register Swagger UI
  app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });

  // Health check route
  app.get('/health', async (req, reply) => {
    return { status: 'ok' };
  });

  return app;
}
