import type { FastifyPluginAsync } from 'fastify';
import TransactionJsonSchema from '../../generated-schemas/Transaction.schema.json';
import { fetchTransactions } from '../../app/transactions/transactionsService';

export const transactionsRoute: FastifyPluginAsync = async (app) => {
  app.get(
    '/transactions',
    {
      schema: {
        summary: 'Get all transactions',
        tags: ['transactions'],
        response: {
          200: {
            type: 'array',
            items: TransactionJsonSchema,
          },
        },
      },
    },
    async (_request, reply) => {
      const transactions = await fetchTransactions();
      return reply.send(transactions);
    }
  );
};
