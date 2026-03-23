export const API_ENDPOINTS = {
  IMPORT_CSV: '/import/csv',
  TRANSACTIONS_UPDATE_CATEGORY: (id: string) => `/transactions/${id}/category`,
  CATEGORIES: '/categories',
  CATEGORY_UPDATE: (id: string) => `/categories/${id}`,
  CATEGORY_DELETE: (id: string) => `/categories/${id}`,
};
