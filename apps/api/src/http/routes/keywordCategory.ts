// Fastify routes for keyword-category mapping CRUD
import { FastifyInstance } from 'fastify';
import {
  addKeywordCategory,
  getAllKeywordCategories,
  updateKeywordCategory,
  deleteKeywordCategory,
} from '../../infra/db/keywordCategoryMap.crud';

export default async function keywordCategoryRoutes(fastify: FastifyInstance) {
  fastify.get('/keyword-categories', async () => {
    return getAllKeywordCategories();
  });

  fastify.post('/keyword-categories', async (request) => {
    const { keyword, category } = request.body as { keyword: string; category: string };
    return addKeywordCategory(keyword, category);
  });

  fastify.put('/keyword-categories/:id', async (request) => {
    const { id } = request.params as { id: string };
    const { category } = request.body as { category: string };
    return updateKeywordCategory(Number(id), category);
  });

  fastify.delete('/keyword-categories/:id', async (request) => {
    const { id } = request.params as { id: string };
    return deleteKeywordCategory(Number(id));
  });
}
