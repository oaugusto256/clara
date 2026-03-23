# Admin-Managed Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded category enum with a DB-backed `categories` table, expose a CRUD API (write endpoints protected by API key), and wire the frontend to fetch categories dynamically.

**Architecture:** New `categories` table seeded with 9 defaults. Backend: CRUD layer → thin service → Fastify route with `requireAdminKey` middleware on write endpoints. `PATCH /transactions/:id/category` validates `categoryKey` against the DB at runtime instead of a compile-time enum. Frontend: `useCategoriesQuery` hook replaces the static `CATEGORY_KEYS` constant, `CategorySelectCell` reads live data.

**Tech Stack:** PostgreSQL + Drizzle ORM (pg), Fastify, TanStack Query (React), TypeScript.

---

## File Structure

### New files
- `apps/api/src/infra/db/categories.schema.ts` — Drizzle table definition
- `apps/api/src/infra/db/categories.crud.ts` — DB CRUD (getAllCategories, getCategoryByKey, createCategory, updateCategory, deleteCategory)
- `apps/api/src/app/categories/categoriesService.ts` — thin service layer
- `apps/api/src/http/middleware/adminAuth.ts` — `requireAdminKey` Fastify preHandler
- `apps/api/src/http/routes/categories.ts` — Fastify route plugin (GET/POST/PATCH/DELETE)
- `apps/web/src/features/dashboard/queries/useCategoriesQuery.ts` — TanStack Query hook

### Modified files
- `apps/api/drizzle.config.ts` — add categories schema path
- `apps/api/src/server.ts` — register categories route; add `'DELETE'` to CORS; add `Category` to Swagger schemas
- `apps/api/src/http/routes/transactions.ts` — remove hardcoded enum from PATCH body; validate `categoryKey` against DB
- `apps/web/src/constants/apiEndpoints.ts` — add `CATEGORIES`, `CATEGORY_UPDATE`, `CATEGORY_DELETE`
- `apps/web/src/features/dashboard/components/CategorySelectCell.tsx` — use `useCategoriesQuery` instead of static `CATEGORY_KEYS`
- `apps/web/src/features/dashboard/utils/categoryColors.ts` — remove `CATEGORY_KEYS` export

### Generated files (do not hand-edit after drizzle-kit runs)
- `apps/api/src/infra/db/migrations/0003_*.sql` — generated migration; seed INSERTs are appended manually before running

---

## Tasks

### Task 1: DB Schema — categories table + migration

**Files:**
- Create: `apps/api/src/infra/db/categories.schema.ts`
- Modify: `apps/api/drizzle.config.ts`
- Generated: `apps/api/src/infra/db/migrations/0003_*.sql` (edit after generation to add seed)

- [ ] **Step 1: Create the Drizzle schema file**

```ts
// apps/api/src/infra/db/categories.schema.ts
import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: varchar('id', { length: 64 }).primaryKey(),
  key: varchar('key', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  color: varchar('color', { length: 32 }),
});
```

- [ ] **Step 2: Add categories schema to drizzle.config.ts**

```ts
// apps/api/drizzle.config.ts
schema: [
  "./src/infra/db/keywordCategoryMap.schema.ts",
  "./src/infra/db/transactions.schema.ts",
  "./src/infra/db/categories.schema.ts",   // add this line
],
```

- [ ] **Step 3: Generate the migration**

```bash
cd apps/api && pnpm drizzle-kit generate
```

Expected: a new file `apps/api/src/infra/db/migrations/0003_*.sql` is created containing `CREATE TABLE "categories" ...`

- [ ] **Step 4: Append seed INSERTs to the generated migration file**

Open the generated `0003_*.sql` file and append these lines at the end (after the CREATE TABLE statement):

```sql
INSERT INTO "categories" ("id", "key", "name", "color") VALUES
  ('cat_housing',       'housing',       'Housing',       '#6366f1'),
  ('cat_food',          'food',          'Food',          '#3b82f6'),
  ('cat_transport',     'transport',     'Transport',     '#f59e42'),
  ('cat_health',        'health',        'Health',        '#f43f5e'),
  ('cat_education',     'education',     'Education',     '#fde68a'),
  ('cat_leisure',       'leisure',       'Leisure',       '#f472b6'),
  ('cat_subscriptions', 'subscriptions', 'Subscriptions', '#8b5cf6'),
  ('cat_savings',       'savings',       'Savings',       '#10b981'),
  ('cat_other',         'other',         'Other',         '#64748b')
ON CONFLICT ("key") DO NOTHING;
```

- [ ] **Step 5: Run the migration**

```bash
cd apps/api && pnpm drizzle-kit migrate
```

Expected: `categories` table created, 9 rows inserted. Verify:
```bash
# in psql or your DB client:
SELECT id, key, name, color FROM categories ORDER BY key;
# should return 9 rows
```

---

### Task 2: DB CRUD — categories

**Files:**
- Create: `apps/api/src/infra/db/categories.crud.ts`

- [ ] **Step 1: Create the CRUD file**

```ts
// apps/api/src/infra/db/categories.crud.ts
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
```

---

### Task 3: Service + Admin auth middleware

**Files:**
- Create: `apps/api/src/app/categories/categoriesService.ts`
- Create: `apps/api/src/http/middleware/adminAuth.ts`

- [ ] **Step 1: Create the service**

```ts
// apps/api/src/app/categories/categoriesService.ts
export {
  getAllCategories,
  getCategoryByKey,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../infra/db/categories.crud';
```

- [ ] **Step 2: Create the admin key middleware**

```ts
// apps/api/src/http/middleware/adminAuth.ts
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function requireAdminKey(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const adminKey = process.env.CATEGORIES_ADMIN_KEY;
  if (!adminKey) {
    reply.status(500).send({ message: 'Server misconfiguration: admin key not set' });
    return;
  }
  const provided = request.headers['x-admin-key'];
  if (provided !== adminKey) {
    reply.status(401).send({ message: 'Unauthorized' });
  }
}
```

- [ ] **Step 3: Add `CATEGORIES_ADMIN_KEY` to your local `.env` file and to `.env.example`**

In `apps/api/.env` (your local secret, never committed):
```
CATEGORIES_ADMIN_KEY=your-secret-key-here
```

In `apps/api/.env.example` (committed, documents required vars — add this line):
```
CATEGORIES_ADMIN_KEY=
```

---

### Task 4: Categories Route

**Files:**
- Create: `apps/api/src/http/routes/categories.ts`

- [ ] **Step 1: Create the route plugin**

```ts
// apps/api/src/http/routes/categories.ts
import type { FastifyPluginAsync } from 'fastify';
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
};

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
```

---

### Task 5: Wire backend — server.ts + transactions route

**Files:**
- Modify: `apps/api/src/server.ts`
- Modify: `apps/api/src/http/routes/transactions.ts`

- [ ] **Step 1: Update server.ts**

Three changes:

**a) Add `'DELETE'` to CORS methods and `'X-Admin-Key'` to allowedHeaders:**
```ts
methods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
allowedHeaders: ['Content-Type', 'X-Admin-Key'],
```

**b) Import and register `categoriesRoute`:**
```ts
import { categoriesRoute } from './http/routes/categories';
// ...
app.register(categoriesRoute);  // alongside the other route registrations
```

**c) Add `Category` to Swagger `components.schemas`:**
```ts
Category: {
  type: 'object',
  properties: {
    id: { type: 'string' },
    key: { type: 'string' },
    name: { type: 'string' },
    color: { type: 'string' },
  },
  required: ['id', 'key', 'name'],
  additionalProperties: true,
},
```

- [ ] **Step 2: Update `apps/api/src/http/routes/transactions.ts`**

Remove the `DEFAULT_CATEGORY_KEYS` import from `@clara/schemas` and replace the body schema enum with a DB validation. Updated file:

```ts
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
```

- [ ] **Step 3: Verify the API starts without errors**

```bash
pnpm -w -F @clara/api run dev:all
```

Expected: server starts, `GET /categories` returns the 9 seeded categories, Swagger UI at `/docs` shows the new `/categories` endpoints.

---

### Task 6: Frontend — API endpoints + useCategoriesQuery

**Files:**
- Modify: `apps/web/src/constants/apiEndpoints.ts`
- Create: `apps/web/src/features/dashboard/queries/useCategoriesQuery.ts`

- [ ] **Step 1: Add category endpoints to apiEndpoints.ts**

```ts
export const API_ENDPOINTS = {
  IMPORT_CSV: '/import/csv',
  TRANSACTIONS_UPDATE_CATEGORY: (id: string) => `/transactions/${id}/category`,
  CATEGORIES: '/categories',
  CATEGORY_UPDATE: (id: string) => `/categories/${id}`,
  CATEGORY_DELETE: (id: string) => `/categories/${id}`,
};
```

- [ ] **Step 2: Create useCategoriesQuery**

```ts
// apps/web/src/features/dashboard/queries/useCategoriesQuery.ts
import api from '@/api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { useQuery } from '@tanstack/react-query';

export type Category = {
  id: string;
  key: string;
  name: string;
  color: string | null;
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.CATEGORIES);
      return res.data as Category[];
    },
    staleTime: 5 * 60 * 1000, // categories change rarely — cache for 5 minutes
  });
}
```

---

### Task 7: Frontend — wire CategorySelectCell to live categories

**Files:**
- Modify: `apps/web/src/features/dashboard/components/CategorySelectCell.tsx`
- Modify: `apps/web/src/features/dashboard/utils/categoryColors.ts`

- [ ] **Step 1: Remove `CATEGORY_KEYS` from categoryColors.ts**

Delete the `CATEGORY_KEYS` export block from `apps/web/src/features/dashboard/utils/categoryColors.ts`. The file should only keep `CATEGORY_COLORS` and `CATEGORY_COLOR_ARRAY`. Updated file:

```ts
// categoryColors.ts
// Centralized category color mapping for both table and pie chart

export const CATEGORY_COLORS: Record<string, string> = {
  housing: '#6366f1',
  food: '#3b82f6',
  transport: '#f59e42',
  health: '#f43f5e',
  education: '#fde68a',
  leisure: '#f472b6',
  subscriptions: '#8b5cf6',
  savings: '#10b981',
  other: '#64748b',
  default: '#a3a3a3',
};

// For pie chart — ordered color cycling
export const CATEGORY_COLOR_ARRAY = [
  CATEGORY_COLORS.housing,
  CATEGORY_COLORS.food,
  CATEGORY_COLORS.transport,
  CATEGORY_COLORS.health,
  CATEGORY_COLORS.education,
  CATEGORY_COLORS.leisure,
  CATEGORY_COLORS.subscriptions,
  CATEGORY_COLORS.savings,
  CATEGORY_COLORS.other,
];
```

- [ ] **Step 2: Update CategorySelectCell to use useCategoriesQuery**

Replace the static `CATEGORY_KEYS` with live data from the hook. The full updated file:

```tsx
// apps/web/src/features/dashboard/components/CategorySelectCell.tsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { FaExclamationCircle, FaPencilAlt, FaSpinner } from 'react-icons/fa';
import type { useUpdateTransactionCategoryMutation } from '../queries/useUpdateTransactionCategoryMutation';
import { useCategoriesQuery } from '../queries/useCategoriesQuery';
import { CATEGORY_COLORS } from '../utils/categoryColors';

type UpdateMutation = ReturnType<typeof useUpdateTransactionCategoryMutation>;

interface CategorySelectCellProps {
  transactionId: string;
  currentCategoryKey: string | undefined;
  mutation: UpdateMutation;
  tableContainerRef: React.RefObject<HTMLDivElement>;
}

function CategoryBadge({
  categoryKey,
  color,
  chevron,
  muted,
}: {
  categoryKey: string;
  color?: string | null;
  chevron?: boolean;
  muted?: boolean;
}) {
  const bg = color || CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.default;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase transition-opacity"
      style={{ backgroundColor: bg, opacity: muted ? 0.5 : 1 }}
    >
      {categoryKey || 'Uncategorized'}
      {chevron && <span className="ml-0.5 text-[8px]">▼</span>}
    </span>
  );
}

export function CategorySelectCell({
  transactionId,
  currentCategoryKey,
  mutation,
  tableContainerRef,
}: CategorySelectCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useCategoriesQuery();

  const isLoading = mutation.isPending && mutation.variables?.id === transactionId;
  const isError = mutation.isError && mutation.variables?.id === transactionId;

  const currentCategory = categories.find((c) => c.key === currentCategoryKey);

  function openPopover() {
    if (!cellRef.current) return;
    const rect = cellRef.current.getBoundingClientRect();
    setPopoverPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    setIsOpen(true);
  }

  function closePopover() {
    setIsOpen(false);
    setPopoverPos(null);
  }

  function handleSelect(key: string) {
    mutation.mutate({ id: transactionId, categoryKey: key });
    closePopover();
  }

  useEffect(() => {
    if (!isOpen) return;
    const container = tableContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', closePopover);
    return () => container.removeEventListener('scroll', closePopover);
  }, [isOpen, tableContainerRef]);

  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (cellRef.current && cellRef.current.contains(e.target as Node)) return;
      closePopover();
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closePopover();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const popover =
    isOpen && popoverPos
      ? ReactDOM.createPortal(
          <div
            className="fixed z-[9999] bg-base-100 border border-base-300 rounded shadow-lg py-1 min-w-[160px]"
            style={{ top: popoverPos.top, left: popoverPos.left }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {categoriesLoading && (
              <div className="flex items-center justify-center px-3 py-2 text-base-content/50">
                <FaSpinner className="animate-spin w-3 h-3" />
              </div>
            )}
            {categoriesError && (
              <div className="px-3 py-2 text-error text-xs">Failed to load categories</div>
            )}
            {!categoriesLoading &&
              !categoriesError &&
              categories.map((cat) => {
                const isSelected = cat.key === currentCategoryKey;
                const color = cat.color || CATEGORY_COLORS[cat.key] || CATEGORY_COLORS.default;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={[
                      'flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-base-200 transition-colors',
                      isSelected ? 'bg-base-200 font-semibold' : '',
                    ].join(' ')}
                    onClick={() => handleSelect(cat.key)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelect(cat.key)}
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="capitalize">{cat.name}</span>
                  </button>
                );
              })}
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={cellRef} className="inline-flex items-center gap-1">
      <button
        type="button"
        className="cursor-pointer focus:outline-none"
        onClick={openPopover}
        disabled={isLoading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <CategoryBadge
          categoryKey={currentCategoryKey || ''}
          color={currentCategory?.color}
          chevron
          muted={isLoading}
        />
      </button>

      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-base-content/50 cursor-pointer">
        <FaPencilAlt className="w-2.5 h-2.5" />
      </span>

      {isError && (
        <span className="text-error ml-1" title="Failed to update category">
          <FaExclamationCircle className="w-3 h-3" />
        </span>
      )}

      {popover}
    </div>
  );
}
```

- [ ] **Step 3: Verify the frontend builds**

```bash
pnpm -w -F @clara/web dev
```

Open the browser. The category dropdown in the transactions table should now show categories fetched from `GET /categories`. Adding a new category via `POST /categories` (with the admin key) should make it appear in the dropdown after the next page load or cache invalidation.

---

## Notes

- **`CATEGORIES_ADMIN_KEY` env var** must be set in production. If unset, write endpoints return `500`. `GET /categories` is always public.
- **`key` is immutable** — the `PATCH /categories/:id` route accepts only `name` and `color`. Changing a key would orphan existing `categoryKey` values on transactions.
- **`id` format** — seed uses readable IDs (`cat_housing`). The `POST /categories` route derives the ID as `cat_${key}`. This keeps IDs predictable for seed data but means `key` uniqueness and `id` uniqueness are both enforced.
- **`CATEGORY_COLORS` in categoryColors.ts** stays as a frontend fallback. Categories fetched from the DB include a `color` field; `CATEGORY_COLORS[key]` is used as fallback only when `color` is null.
