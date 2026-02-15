// drizzle/schema.ts
// Defines the schema for transactions table
import { date, integer, jsonb, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const transactions = pgTable(
  'transactions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 }).notNull(),
    accountId: varchar('account_id', { length: 64 }).notNull(),
    description: varchar('description', { length: 1024 }).notNull(),
    amount: integer('amount').notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    direction: varchar('direction', { length: 16 }).notNull(),
    date: date('date').notNull(),
    postedAt: date('posted_at'),
    categoryId: varchar('category_id', { length: 64 }),
    categoryKey: varchar('category_key', { length: 64 }),
    source: varchar('source', { length: 32 }).notNull(),
    metadata: jsonb('metadata'),
  },
  (table) => ({
    uniqueTransaction: uniqueIndex('unique_transaction').on(
      table.userId,
      table.date,
      table.amount,
      table.description
    ),
  })
);
