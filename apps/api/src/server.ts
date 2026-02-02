import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { importCsv } from './app/import/importService';
import { attachDocs } from './docs';

export function buildServer(): FastifyInstance {
  const fastify = Fastify({ logger: false });

  // Serve an OpenAPI preview using swagger-ui-dist + @fastify/static so we avoid plugin version mismatches
  const spec = {
    openapi: '3.0.0',
    info: { title: 'Clara API', version: '0.1.0', description: 'CSV import preview' },
    components: {
      schemas: {
        NormalizedTransactionInput: {
          type: 'object',
          properties: {
            accountExternalId: { type: 'string' },
            description: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            date: { type: 'string', format: 'date' },
          },
          required: ['accountExternalId', 'description', 'amount', 'date'],
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            accountId: { type: 'string' },
            description: { type: 'string' },
            amount: { type: 'object', properties: { amount: { type: 'number' }, currency: { type: 'string' } } },
            direction: { type: 'string' },
            date: { type: 'string', format: 'date' },
            source: { type: 'string' },
          },
        },
        ImportError: { type: 'object', properties: { line: { type: 'number' }, reason: { type: 'string' } } },
      },
    },
    paths: {
      '/import/csv': {
        post: {
          summary: 'Import CSV',
          requestBody: {
            required: true,
            content: {
              'text/csv': { schema: { type: 'string' } },
              'text/plain': { schema: { type: 'string' } },
              'application/json': { schema: { type: 'object', properties: { csv: { type: 'string' } } } },
            },
          },
          responses: {
            '200': {
              description: 'Parsed result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      parsed: { type: 'array', items: { $ref: '#/components/schemas/NormalizedTransactionInput' } },
                      normalized: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
                      errors: { type: 'array', items: { $ref: '#/components/schemas/ImportError' } },
                    },
                  },
                },
              },
            },
            '400': { description: 'Bad request' },
          },
        },
      },
    },
  } as const;

  // Attach docs endpoints and generated OpenAPI spec
  attachDocs(fastify, spec);

  // Accept text/csv and text/plain as raw strings
  fastify.addContentTypeParser(['text/csv', 'text/plain'], { parseAs: 'string' }, function (req, body, done) {
    done(null, body as string);
  });

  fastify.post(
    '/import/csv',
    {
      schema: {
        summary: 'Import CSV',
        consumes: ['text/csv', 'text/plain', 'application/json'],
        body: { type: 'string' },
        response: {
          200: {
            type: 'object',
            properties: {
              parsed: { type: 'array', items: { type: 'object' } },
              normalized: { type: 'array', items: { type: 'object' } },
              errors: { type: 'array', items: { type: 'object', properties: { line: { type: 'number' }, reason: { type: 'string' } } } },
            },
          },
          400: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
    // Allow JSON body with { csv: string } for convenience
    let csv = '';
    if (typeof request.body === 'string') csv = request.body as string;
    else if (request.body && typeof (request.body as any).csv === 'string') csv = (request.body as any).csv;

    if (!csv || csv.trim() === '') {
      return reply.status(400).send({ error: 'No CSV provided' });
    }

    const result = importCsv(csv);
    return result;
  });

  return fastify;
}
