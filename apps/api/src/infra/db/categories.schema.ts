import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: varchar('id', { length: 64 }).primaryKey(),
  key: varchar('key', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  color: varchar('color', { length: 32 }),
});
