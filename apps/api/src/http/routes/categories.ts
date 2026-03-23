import type { FastifyPluginAsync } from 'fastify';
import type { Category } from '@clara/schemas';
import { requireAdminKey } from '../middleware/adminAuth';
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from '../../app/categories/categoriesService';

const CategorySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    key: { type: 'string' },
    name: { type: 'string' },
    color: { type: 'string' },
  },
  required: ['id', 'key', 'name'],
  additionalProperties: true,
} as const;

export const categoriesRoute: FastifyPluginAsync = async (app) => {
  // GET /categories — public
  app.get(
    '/categories',
    {
      schema: {
        summary: 'Get all categories',
        tags: ['categories'],
        response: {
          200: { type: 'array', items: CategorySchema },
        },
      },
    },
    async (_request, reply) => {
      const all = await getAllCategories();
      return reply.send(all);
    }
  );

  // POST /categories — admin only
  app.post(
    '/categories',
    {
      preHandler: requireAdminKey,
      schema: {
        summary: 'Create a category',
        tags: ['categories'],
        security: [{ adminKey: [] }],
        body: {
          type: 'object',
          properties: {
            key: { type: 'string', minLength: 1, maxLength: 64 },
            name: { type: 'string', minLength: 1, maxLength: 128 },
            color: { type: 'string', maxLength: 32 },
          },
          required: ['key', 'name'],
          additionalProperties: false,
        },
        response: {
          201: CategorySchema,
          409: { type: 'object', properties: { message: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
      const { key, name, color } = request.body as { key: string; name: string; color?: string };
      try {
        const created = await createCategory({
          id: `cat_${key}`,
          key,
          name,
          color,
        });
        return reply.status(201).send(created);
      } catch (err: any) {
        if (err?.code === '23505') {
          return reply.status(409).send({ message: `Category key '${key}' already exists` });
        }
        throw err;
      }
    }
  );

  // PATCH /categories/:id — admin only
  app.patch(
    '/categories/:id',
    {
      preHandler: requireAdminKey,
      schema: {
        summary: 'Update a category name or color',
        tags: ['categories'],
        security: [{ adminKey: [] }],
        params: {
          type: 'object',
          properties: { id: { type: 'string', maxLength: 64 } },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 128 },
            color: { type: 'string', maxLength: 32 },
          },
          additionalProperties: false,
        },
        response: {
          200: CategorySchema,
          404: { type: 'object', properties: { message: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { name, color } = request.body as { name?: string; color?: string };
      const updated = await updateCategory(id, { name, color });
      if (!updated) {
        return reply.status(404).send({ message: 'Category not found' });
      }
      return reply.send(updated);
    }
  );

  // DELETE /categories/:id — admin only
  app.delete(
    '/categories/:id',
    {
      preHandler: requireAdminKey,
      schema: {
        summary: 'Delete a category',
        tags: ['categories'],
        security: [{ adminKey: [] }],
        params: {
          type: 'object',
          properties: { id: { type: 'string', maxLength: 64 } },
          required: ['id'],
        },
        response: {
          204: { type: 'null' },
          404: { type: 'object', properties: { message: { type: 'string' } } },
          409: { type: 'object', properties: { message: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = await deleteCategory(id);
      if (result.conflict) {
        return reply.status(409).send({ message: 'Category is in use by existing transactions' });
      }
      if (!result.deleted) {
        return reply.status(404).send({ message: 'Category not found' });
      }
      return reply.status(204).send();
    }
  );
};
