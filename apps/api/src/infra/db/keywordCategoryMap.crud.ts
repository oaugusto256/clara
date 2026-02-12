// CRUD for keyword-category mappings
import { db } from './client';
import { keywordCategoryMap } from './keywordCategoryMap.schema';
import { eq } from 'drizzle-orm';

export async function addKeywordCategory(keyword: string, category: string) {
  return db.insert(keywordCategoryMap).values({ keyword, category }).onConflictDoNothing().returning();
}

export async function getAllKeywordCategories() {
  return db.select().from(keywordCategoryMap);
}

export async function updateKeywordCategory(id: number, category: string) {
  return db.update(keywordCategoryMap).set({ category }).where(eq(keywordCategoryMap.id, id)).returning();
}

export async function deleteKeywordCategory(id: number) {
  return db.delete(keywordCategoryMap).where(eq(keywordCategoryMap.id, id)).returning();
}
