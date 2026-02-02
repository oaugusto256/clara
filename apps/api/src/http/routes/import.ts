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

      // Debug: log the raw request body
      // eslint-disable-next-line no-console
      console.log('[import/csv] Raw request.body:', request.body);

      if (!csv || csv.trim() === '') {
        return reply.status(400).send({ error: 'No CSV provided' });
      }

      // Debug: log the CSV string
      // eslint-disable-next-line no-console
      console.log('[import/csv] CSV string:', csv);

      const result = importCsv(csv);

      // Debug: log the parsed and normalized output
      // eslint-disable-next-line no-console
      console.log('[import/csv] Parsed:', result.parsed);
      // eslint-disable-next-line no-console
      console.log('[import/csv] Normalized:', result.normalized);
      // eslint-disable-next-line no-console
      console.log('[import/csv] Errors:', result.errors);

      return result;
    }
  );
};
