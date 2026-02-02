import type { FastifyPluginAsync } from "fastify";
import { importCsv } from '../../app/import/importService';

export const importCsvRoute: FastifyPluginAsync = async (app) => {
  // Import Zod schemas and convert to JSON Schema for OpenAPI
  const { NormalizedTransactionInputSchema, TransactionSchema } = require('@clara/schemas');
  const { zodToJsonSchema } = require('zod-to-json-schema');

  app.post(
    '/import/csv',
    {
      schema: {
        summary: 'Import CSV',
        tags: ['import'],
        consumes: ['text/csv', 'text/plain', 'application/json'],
        body: { type: 'string' },
        response: {
          200: {
            type: 'object',
            properties: {
              parsed: { type: 'array', items: zodToJsonSchema(NormalizedTransactionInputSchema) },
              normalized: { type: 'array', items: zodToJsonSchema(TransactionSchema) },
              errors: { type: 'array', items: { type: 'object', properties: { line: { type: 'number' }, reason: { type: 'string' } }, additionalProperties: false } },
            },
          },
          400: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
      let csv = '';
      if (typeof request.body === 'string') csv = request.body as string;
      else if (request.body && typeof (request.body as any).csv === 'string') csv = (request.body as any).csv;

      if (!csv || csv.trim() === '') {
        return reply.status(400).send({ error: 'No CSV provided' });
      }

      const result = importCsv(csv);

      return result;
    }
  );
};
