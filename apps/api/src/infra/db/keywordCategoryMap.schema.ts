// drizzle/schema.ts
// Defines the schema for keyword-category mapping
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const keywordCategoryMap = pgTable('keyword_category_map', {
  id: serial('id').primaryKey(),
  keyword: varchar('keyword', { length: 512 }).notNull().unique(),
  category: varchar('category', { length: 64 }).notNull(),
});
