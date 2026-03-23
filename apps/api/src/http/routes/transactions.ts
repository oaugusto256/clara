import type { FastifyPluginAsync } from 'fastify';
import TransactionJsonSchema from '../../generated-schemas/Transaction.schema.json';
import { getCategoryByKey } from '../../app/categories/categoriesService';
import { fetchTransactions, updateTransactionCategory } from '../../app/transactions/transactionsService';

export const transactionsRoute: FastifyPluginAsync = async (app) => {
  app.get(
    '/transactions',
    {
      schema: {
        summary: 'Get all transactions',
        tags: ['transactions'],
        response: {
          200: { type: 'array', items: TransactionJsonSchema },
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
          properties: { id: { type: 'string', maxLength: 64 } },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            categoryKey: { type: 'string', minLength: 1, maxLength: 64 },
          },
          required: ['categoryKey'],
          additionalProperties: false,
        },
        response: {
          200: TransactionJsonSchema,
          400: { type: 'object', properties: { message: { type: 'string' } } },
          404: { type: 'object', properties: { message: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { categoryKey } = request.body as { categoryKey: string };

      const category = await getCategoryByKey(categoryKey);
      if (!category) {
        return reply.status(400).send({ message: `Unknown category key: ${categoryKey}` });
      }

      const updated = await updateTransactionCategory(id, categoryKey);
      if (!updated) {
        return reply.status(404).send({ message: 'Transaction not found' });
      }
      return reply.send(updated);
    }
  );
};
