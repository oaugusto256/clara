import { eq } from 'drizzle-orm';
import { db } from './client';
import { categories } from './categories.schema';
import { transactions } from './transactions.schema';

export type CategoryRow = {
  id: string;
  key: string;
  name: string;
  color: string | null;
};

export async function getAllCategories(): Promise<CategoryRow[]> {
  return db.select().from(categories).orderBy(categories.key) as Promise<CategoryRow[]>;
}

export async function getCategoryByKey(key: string): Promise<CategoryRow | null> {
  const rows = await db.select().from(categories).where(eq(categories.key, key));
  return (rows[0] as CategoryRow) ?? null;
}

export async function createCategory(data: {
  id: string;
  key: string;
  name: string;
  color?: string;
}): Promise<CategoryRow> {
  const rows = await db.insert(categories).values(data).returning();
  return rows[0] as CategoryRow;
}

export async function updateCategory(
  id: string,
  data: { name?: string; color?: string }
): Promise<CategoryRow | null> {
  const updates: Record<string, string> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.color !== undefined) updates.color = data.color;
  if (!Object.keys(updates).length) return null;
  const rows = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
  return (rows[0] as CategoryRow) ?? null;
}

export async function deleteCategory(
  id: string
): Promise<{ deleted: boolean; conflict: boolean }> {
  const catRows = await db
    .select({ key: categories.key })
    .from(categories)
    .where(eq(categories.id, id));
  if (!catRows.length) return { deleted: false, conflict: false };

  const inUse = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(eq(transactions.categoryKey, catRows[0].key))
    .limit(1);
  if (inUse.length) return { deleted: false, conflict: true };

  await db.delete(categories).where(eq(categories.id, id));
  return { deleted: true, conflict: false };
}
