// Fastify routes for keyword-category mapping CRUD
import { FastifyPluginAsync } from 'fastify';
import {
  addKeywordCategory,
  deleteKeywordCategory,
  getAllKeywordCategories,
  updateKeywordCategory,
} from '../../infra/db/keywordCategoryMap.crud';

export const keywordCategoryRoutes: FastifyPluginAsync = async (app) => {
  // Error logging middleware
  app.addHook('onError', async (request, reply, error) => {
    app.log.error({ err: error }, 'Request error');
  });

  app.get('/keyword-categories', async () => {
    return getAllKeywordCategories();
  });

  app.post('/keyword-categories', async (request) => {
    const { keyword, category } = request.body as { keyword: string; category: string };
    return addKeywordCategory(keyword, category);
  });

  app.put('/keyword-categories/:id', async (request) => {
    const { id } = request.params as { id: string };
    const { category } = request.body as { category: string };
    return updateKeywordCategory(Number(id), category);
  });

  app.delete('/keyword-categories/:id', async (request) => {
    const { id } = request.params as { id: string };
    return deleteKeywordCategory(Number(id));
  });
}
