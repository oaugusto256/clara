import type { FastifyPluginAsync } from 'fastify';
import TransactionJsonSchema from '../../generated-schemas/Transaction.schema.json';
import { fetchTransactions, updateTransactionCategory } from '../../app/transactions/transactionsService';
import { DEFAULT_CATEGORY_KEYS } from '@clara/schemas';

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

  app.patch(
    '/transactions/:id/category',
    {
      schema: {
        summary: 'Update transaction category',
        tags: ['transactions'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', maxLength: 64 },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            categoryKey: { type: 'string', enum: [...DEFAULT_CATEGORY_KEYS] },
          },
          required: ['categoryKey'],
          additionalProperties: false,
        },
        response: {
          200: TransactionJsonSchema,
          404: {
            type: 'object',
            properties: { message: { type: 'string' } },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { categoryKey } = request.body as { categoryKey: string };
      const updated = await updateTransactionCategory(id, categoryKey);
      if (!updated) {
        return reply.status(404).send({ message: 'Transaction not found' });
      }
      return reply.send(updated);
    }
  );
};
