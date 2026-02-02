import type { FastifyPluginAsync } from "fastify";
import { importCsv } from '../../app/import/importService';

export const importCsvRoute: FastifyPluginAsync = async (app) => {
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
