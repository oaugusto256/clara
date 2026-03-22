# Editable Transaction Category Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to change a transaction's category from the dashboard table, persisting the change to the backend via `PATCH /transactions/:id/category`.

**Architecture:** Backend-first (CRUD → service → route), then frontend data layer (query cache + optimistic update), then UI (`CategorySelectCell` portal popover). The local `useState` in `DashboardPage` is removed so both table and pie chart read directly from TanStack Query cache.

**Tech Stack:** Fastify + Drizzle ORM + PostgreSQL (backend); React + TanStack Query + TanStack Table + ReactDOM.createPortal (frontend); shared `@clara/schemas` for `DEFAULT_CATEGORY_KEYS`.

---

## File Map

### New files
- `apps/web/src/features/dashboard/queries/useUpdateTransactionCategoryMutation.ts`
- `apps/web/src/features/dashboard/components/CategorySelectCell.tsx`

### Modified files
- `docs/DOMAIN_SCHEMAS.md`
- `apps/api/src/server.ts`
- `apps/api/src/infra/db/transactions.crud.ts`
- `apps/api/src/app/transactions/transactionsService.ts`
- `apps/api/src/http/routes/transactions.ts`
- `apps/web/src/constants/apiEndpoints.ts`
- `apps/web/src/features/dashboard/utils/categoryColors.ts`
- `apps/web/src/features/dashboard/queries/useImportCsvMutation.ts`
- `apps/web/src/features/dashboard/DashboardPage.tsx`
- `apps/web/src/features/dashboard/components/TransactionsUploadTable.tsx`

---

## Task 1: Update domain documentation

**Files:**
- Modify: `docs/DOMAIN_SCHEMAS.md`

- [ ] Open `docs/DOMAIN_SCHEMAS.md` and locate the `Transaction` type in section 5.

- [ ] Add `categoryKey` as an optional field with the union type of all valid category keys:

```ts
type Transaction = {
  id: string
  userId: string
  accountId: string

  description: string
  amount: Money
  direction: "income" | "expense"

  date: string // ISO date
  postedAt?: string // ISO date

  categoryId?: string
  categoryKey?: "housing" | "food" | "transport" | "health" | "education" | "leisure" | "subscriptions" | "savings" | "other"
  source: "csv" | "ofx" | "open_finance_mock" | "open_finance_real"

  metadata?: Record<string, unknown>
}
```

- [ ] In the Invariants section below, confirm the existing note "Categorization is metadata, not identity" covers `categoryKey`. No new invariant needed.

---

## Task 2: Backend — DB CRUD

**Files:**
- Modify: `apps/api/src/infra/db/transactions.crud.ts`

The existing `fetchTransactions` uses `db.select().from(transactions)` and maps rows to `Transaction`. The same row-mapping pattern is used here. `.returning()` is already established in `keywordCategoryMap.crud.ts`.

- [ ] Add the `updateTransactionCategoryKey` function at the end of `transactions.crud.ts`:

```ts
import { eq } from 'drizzle-orm'; // add to existing imports at the top

export async function updateTransactionCategoryKey(
  id: string,
  categoryKey: string
): Promise<Transaction | null> {
  const rows = await db
    .update(transactions)
    .set({ categoryKey })
    .where(eq(transactions.id, id))
    .returning();

  if (!rows.length) return null;

  const row = rows[0] as any;
  return {
    id: row.id,
    userId: row.userId,
    accountId: row.accountId,
    description: row.description,
    amount: { amount: row.amount, currency: row.currency },
    direction: row.direction,
    date: row.date,
    postedAt: row.postedAt ?? undefined,
    categoryId: row.categoryId ?? undefined,
    categoryKey: row.categoryKey ?? undefined,
    source: row.source,
    metadata: row.metadata ?? undefined,
  };
}
```

Note: `eq` is already imported by `keywordCategoryMap.crud.ts` — add it to `transactions.crud.ts` imports if not already there.

---

## Task 3: Backend — Service

**Files:**
- Modify: `apps/api/src/app/transactions/transactionsService.ts`

- [ ] Add `updateTransactionCategory` to the service:

```ts
import {
  fetchTransactions as fetchTransactionsDb,
  updateTransactionCategoryKey,
} from '../../infra/db/transactions.crud';

export async function fetchTransactions() {
  return fetchTransactionsDb();
}

export async function updateTransactionCategory(
  id: string,
  categoryKey: string
) {
  return updateTransactionCategoryKey(id, categoryKey);
}
```

---

## Task 4: Backend — Route + server.ts

**Files:**
- Modify: `apps/api/src/http/routes/transactions.ts`
- Modify: `apps/api/src/server.ts`

### 4a: Add PATCH route

The route validates `categoryKey` using a JSON Schema enum built from `DEFAULT_CATEGORY_KEYS`. Fastify uses JSON Schema for body validation — not Zod directly. The enum values are spread from the imported constant.

- [ ] Update `apps/api/src/http/routes/transactions.ts`:

```ts
import type { FastifyPluginAsync } from 'fastify';
import { DEFAULT_CATEGORY_KEYS } from '@clara/schemas';
import TransactionJsonSchema from '../../generated-schemas/Transaction.schema.json';
import { fetchTransactions, updateTransactionCategory } from '../../app/transactions/transactionsService';

export const transactionsRoute: FastifyPluginAsync = async (app) => {
  app.get(
    '/transactions',
    {
      schema: {
        summary: 'Get all transactions',
        tags: ['transactions'],
        response: {
          200: {
            type: 'array',
            items: TransactionJsonSchema,
          },
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
          properties: {
            id: { type: 'string', minLength: 1, maxLength: 64 },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            categoryKey: {
              type: 'string',
              enum: [...DEFAULT_CATEGORY_KEYS],
            },
          },
          required: ['categoryKey'],
          additionalProperties: false,
        },
        response: {
          200: TransactionJsonSchema,
          404: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { categoryKey } = request.body as { categoryKey: string };

      const updated = await updateTransactionCategory(id, categoryKey);

      if (!updated) {
        return reply.status(404).send({ error: 'Transaction not found' });
      }

      return reply.send(updated);
    }
  );
};
```

### 4b: Update server.ts

- [ ] In `apps/api/src/server.ts`, add `'PATCH'` to the CORS methods array:

```ts
app.register(fastifyCors, {
  origin: true,
  methods: ['POST', 'GET', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type'],
});
```

- [ ] Add `categoryKey` to the inline Swagger `Transaction` schema in the `components.schemas` block (the inline one in `server.ts`, not `Transaction.schema.json`):

```ts
Transaction: {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    accountId: { type: 'string' },
    description: { type: 'string' },
    amount: { /* ... existing ... */ },
    direction: { type: 'string', enum: ['income', 'expense'] },
    date: { type: 'string' },
    postedAt: { type: 'string' },
    categoryId: { type: 'string' },
    categoryKey: { type: 'string' },   // ADD THIS LINE
    source: { type: 'string', enum: ['csv', 'ofx', 'open_finance_mock', 'open_finance_real'] },
    metadata: { type: 'object' },
  },
  required: ['id', 'userId', 'accountId', 'description', 'amount', 'direction', 'date', 'source'],
  additionalProperties: true,
},
```

---

## Task 5: Frontend — Constants + Colors

**Files:**
- Modify: `apps/web/src/constants/apiEndpoints.ts`
- Modify: `apps/web/src/features/dashboard/utils/categoryColors.ts`

### 5a: API endpoint constant

- [ ] Update `apiEndpoints.ts`:

```ts
export const API_ENDPOINTS = {
  IMPORT_CSV: "/import/csv",
  TRANSACTIONS_UPDATE_CATEGORY: (id: string) => `/transactions/${id}/category`,
};
```

### 5b: Replace category colors

The current map has 13 legacy keys. Replace it with the 9 canonical keys. The `CATEGORY_COLOR_ARRAY` is used by `CategoryPieChart` for color cycling — it now has 9 entries in `DEFAULT_CATEGORY_KEYS` order.

- [ ] Replace `apps/web/src/features/dashboard/utils/categoryColors.ts` entirely:

```ts
// categoryColors.ts
// Centralized category color mapping — keys match DEFAULT_CATEGORY_KEYS from @clara/schemas

export const CATEGORY_COLORS: Record<string, string> = {
  housing: '#6366f1',      // indigo
  food: '#3b82f6',         // blue
  transport: '#f59e42',    // orange
  health: '#f43f5e',       // red
  education: '#fde68a',    // pale yellow
  leisure: '#f472b6',      // pink
  subscriptions: '#8b5cf6', // deep violet
  savings: '#10b981',      // green
  other: '#64748b',        // slate
  default: '#a3a3a3',      // gray fallback for unknown/legacy keys
};

// For pie chart — ordered to match DEFAULT_CATEGORY_KEYS
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

---

## Task 6: Frontend — Remove DashboardPage local state + fix CSV import

**Files:**
- Modify: `apps/web/src/features/dashboard/queries/useImportCsvMutation.ts`
- Modify: `apps/web/src/features/dashboard/DashboardPage.tsx`

### 6a: Add query invalidation to useImportCsvMutation

The hook adds internal query invalidation on success while preserving the callback interface so `TransactionsUploadTable` can still reset its local `loading`/`error` state.

- [ ] Update `useImportCsvMutation.ts`:

```ts
import api from "@/api";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useImportCsvMutation({
  onSuccess,
  onError,
  onSettled,
}: {
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
  onSettled?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (csvText: string) => {
      const res = await api.post(API_ENDPOINTS.IMPORT_CSV, csvText, {
        headers: { "Content-Type": "text/csv" },
      });
      return res.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess?.(data);
    },
    onError,
    onSettled,
  });
}
```

### 6b: Remove local state from DashboardPage

- [ ] Update `DashboardPage.tsx`:

```tsx
import DashboardLayout from "./DashboardLayout";
import CategoryPieChartContainer from "./components/CategoryPieChartContainer";
import TransactionsUploadTable from "./components/TransactionsUploadTable";
import { useTransactionsQuery } from "./queries/useTransactionsQuery";

export default function DashboardPage() {
  const { data } = useTransactionsQuery();
  const transactions = data ?? [];

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-full">
        <div className="flex-2 flex flex-col min-h-0">
          <TransactionsUploadTable
            transactions={transactions}
            containerClassName="flex-1 flex flex-col min-h-0"
            tableScrollClassName="flex-1 overflow-y-auto min-h-0 max-h-full"
          />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="w-full min-h-0">
            <CategoryPieChartContainer transactions={transactions} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

## Task 7: Frontend — useUpdateTransactionCategoryMutation

**Files:**
- Create: `apps/web/src/features/dashboard/queries/useUpdateTransactionCategoryMutation.ts`

- [ ] Create `useUpdateTransactionCategoryMutation.ts`:

```ts
import type { Transaction } from "@clara/schemas";
import api from "@/api";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateCategoryVariables {
  id: string;
  categoryKey: string;
}

interface MutationContext {
  previous: Transaction[] | undefined;
}

export function useUpdateTransactionCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, UpdateCategoryVariables, MutationContext>({
    mutationFn: async ({ id, categoryKey }) => {
      const res = await api.patch(
        API_ENDPOINTS.TRANSACTIONS_UPDATE_CATEGORY(id),
        { categoryKey }
      );
      return res.data;
    },

    onMutate: async ({ id, categoryKey }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      // Snapshot current cache
      const previous = queryClient.getQueryData<Transaction[]>(["transactions"]);

      // Optimistically update
      queryClient.setQueryData<Transaction[]>(["transactions"], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, categoryKey } : t))
      );

      return { previous };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },

    onError: (_error, _variables, context) => {
      // Roll back to snapshot
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["transactions"], context.previous);
      }
    },
  });
}
```

---

## Task 8: Frontend — CategorySelectCell component

**Files:**
- Create: `apps/web/src/features/dashboard/components/CategorySelectCell.tsx`

This component:
- Renders a `CategoryBadge` with a `▼` chevron and a hover pencil icon
- Opens a portal popover listing all 9 canonical categories
- Positions the popover using `getBoundingClientRect()` to work inside the virtualizer
- Dismisses on scroll (attached to the virtualizer container ref), outside click, or Escape

- [ ] Create `CategorySelectCell.tsx`:

```tsx
import { DEFAULT_CATEGORY_KEYS } from "@clara/schemas";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FaPencilAlt } from "react-icons/fa";
import { CATEGORY_COLORS } from "../utils/categoryColors";
import type { useUpdateTransactionCategoryMutation } from "../queries/useUpdateTransactionCategoryMutation";

interface CategorySelectCellProps {
  transactionId: string;
  currentCategoryKey: string | undefined;
  mutation: ReturnType<typeof useUpdateTransactionCategoryMutation>;
  tableContainerRef: React.RefObject<HTMLDivElement>;
}

function CategoryBadgeWithChevron({
  categoryKey,
  isPending,
  isError,
}: {
  categoryKey: string | undefined;
  isPending: boolean;
  isError: boolean;
}) {
  const color = CATEGORY_COLORS[categoryKey ?? ""] ?? CATEGORY_COLORS.default;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase cursor-pointer select-none transition-opacity"
      style={{
        backgroundColor: color,
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {isError && <span title="Failed to update">⚠</span>}
      {categoryKey || "Uncategorized"}
      <span className="ml-0.5 text-[8px]">▼</span>
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

  function openPopover() {
    if (!cellRef.current) return;
    const rect = cellRef.current.getBoundingClientRect();
    setPopoverPos({ top: rect.bottom + 4, left: rect.left });
    setIsOpen(true);
  }

  function closePopover() {
    setIsOpen(false);
    setPopoverPos(null);
  }

  function handleSelect(categoryKey: string) {
    mutation.mutate({ id: transactionId, categoryKey });
    closePopover();
  }

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function onMouseDown(e: MouseEvent) {
      const popoverEl = document.getElementById(`category-popover-${transactionId}`);
      if (popoverEl && !popoverEl.contains(e.target as Node) && !cellRef.current?.contains(e.target as Node)) {
        closePopover();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, transactionId]);

  // Close on scroll (virtualizer container)
  useEffect(() => {
    if (!isOpen) return;
    const el = tableContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", closePopover, { passive: true });
    return () => el.removeEventListener("scroll", closePopover);
  }, [isOpen, tableContainerRef]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closePopover();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const popover = isOpen && popoverPos
    ? ReactDOM.createPortal(
        <div
          id={`category-popover-${transactionId}`}
          className="fixed z-[9999] bg-base-200 border border-base-300 rounded shadow-lg py-1 min-w-[160px]"
          style={{ top: popoverPos.top, left: popoverPos.left }}
          role="listbox"
          aria-label="Select category"
        >
          {DEFAULT_CATEGORY_KEYS.map((key) => {
            const isSelected = key === currentCategoryKey;
            const color = CATEGORY_COLORS[key] ?? CATEGORY_COLORS.default;
            return (
              <button
                key={key}
                role="option"
                aria-selected={isSelected}
                className={[
                  "flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-base-300 transition-colors",
                  isSelected ? "font-semibold bg-base-300" : "",
                ].join(" ")}
                onClick={() => handleSelect(key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSelect(key);
                }}
              >
                <span
                  className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{key}</span>
              </button>
            );
          })}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div
        ref={cellRef}
        className="inline-flex items-center gap-1 group/cell cursor-pointer"
        onClick={openPopover}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") openPopover(); }}
        aria-label={`Change category: ${currentCategoryKey || "Uncategorized"}`}
      >
        <FaPencilAlt className="w-2.5 h-2.5 text-base-content/40 opacity-0 group-hover/cell:opacity-100 transition-opacity flex-shrink-0" />
        <CategoryBadgeWithChevron
          categoryKey={currentCategoryKey}
          isPending={mutation.isPending}
          isError={mutation.isError}
        />
      </div>
      {popover}
    </>
  );
}
```

---

## Task 9: Frontend — Wire CategorySelectCell into TransactionsUploadTable

**Files:**
- Modify: `apps/web/src/features/dashboard/components/TransactionsUploadTable.tsx`

This is the final wiring task. Three changes:
1. Remove `setTransactions` from props and the `onSuccess` callback
2. Replace the `categoryKey` column cell renderer with `CategorySelectCell`
3. Pass `tableContainerRef` to the cell via the column `cell` function

- [ ] Remove `setTransactions` from the props interface and the component signature:

```tsx
interface TransactionsUploadTableProps {
  transactions: Transaction[];
  // setTransactions removed
  containerClassName?: string;
  tableScrollClassName?: string;
}
```

- [ ] Add the mutation import and update the column definition:

```tsx
import { useUpdateTransactionCategoryMutation } from "../queries/useUpdateTransactionCategoryMutation";
import { CategorySelectCell } from "./CategorySelectCell";
```

- [ ] Change the `categoryKey` column inside the `columns` array. Because `tableContainerRef` is defined inside the component but `columns` is defined outside, move `columns` inside the component (or define it with `useMemo`). The simplest approach: define `columns` as a factory function that takes the mutation and ref, called inside the component.

Replace the static `columns` constant with a `useMemo` inside the component body:

```tsx
// Remove the top-level `const columns = [...]`
// Inside TransactionsUploadTable, after existing state declarations:

const updateCategoryMutation = useUpdateTransactionCategoryMutation();

const columns = React.useMemo(() => [
  columnHelper.accessor('date', {
    header: 'Date',
    cell: info => formatDate(info.getValue()),
    size: 110, minSize: 80, maxSize: 200,
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: info => info.getValue(),
    size: 220, minSize: 100, maxSize: 400,
  }),
  columnHelper.accessor(row => (
    row.amount && typeof row.amount.amount === 'number' ? row.amount.amount : null
  ), {
    id: 'amount',
    header: 'Amount',
    cell: info => {
      const original = info.row.original;
      const value = info.getValue();
      const currency = original.amount && typeof original.amount.currency === 'string'
        ? original.amount.currency : undefined;
      return <span className="font-mono">{formatAmount(value, currency)}</span>;
    },
    size: 100, minSize: 80, maxSize: 200,
  }),
  columnHelper.accessor('categoryKey', {
    header: 'Category',
    cell: info => (
      <CategorySelectCell
        transactionId={info.row.original.id}
        currentCategoryKey={info.getValue() ?? undefined}
        mutation={updateCategoryMutation}
        tableContainerRef={tableContainerRef}
      />
    ),
    size: 160, minSize: 120, maxSize: 240,
  }),
  columnHelper.accessor(row => row.amount && typeof row.amount.currency === 'string' ? row.amount.currency : '', {
    id: 'currency',
    header: 'Currency',
    cell: info => (
      <span className="inline-block text-xs text-base-content text-right font-semibold w-full px-4">
        {formatCurrency(info.getValue())}
      </span>
    ),
    size: 80, minSize: 60, maxSize: 80,
  }),
], [updateCategoryMutation, tableContainerRef]);
```

- [ ] Update the `onSuccess` callback in `useImportCsvMutation` call (inside the component) — remove `setTransactions`, keep `setError(null)`:

```tsx
const importCsvMutation = useImportCsvMutation({
  onSuccess: () => {         // was: (data) => { setTransactions(data.normalized || []); setError(null); }
    setError(null);
  },
  onError: (err: any) => {
    setError(err?.response?.data?.error || err.message || "Failed to import CSV");
  },
  onSettled: () => {
    setLoading(false);
  },
});
```

- [ ] Add `group` class to the `<tr>` element in the virtualized rows so that `group-hover/cell` works on the pencil icon (TailwindCSS group targeting):

```tsx
<tr
  key={row.id}
  className="group border-base-100 last:border-b hover:bg-primary/10 transition-colors w-full text-base font-medium"
  style={{ height: `${virtualRow.size}px` }}
>
```

---

## Verification Checklist

After all tasks:

- [ ] Start the API: `pnpm -w -F @clara/api run dev:all` — no TypeScript errors, server starts
- [ ] Run API tests: `pnpm -w -F @clara/api test` — existing tests still pass
- [ ] Start the web app: `pnpm -w -F @clara/web dev` — no TypeScript/build errors
- [ ] Upload a CSV — transactions appear in the table (query invalidation works)
- [ ] Click a category badge — popover opens with 9 options and current highlighted
- [ ] Select a different category — badge updates immediately (optimistic), PATCH fires to backend
- [ ] Verify in DB or network tab that the change persisted
- [ ] Scroll the table while a popover is open — popover dismisses cleanly
- [ ] Click outside the popover — dismisses without change
- [ ] Press Escape while popover is open — dismisses without change
- [ ] Simulate a network error — badge rolls back to previous value, error icon appears
- [ ] Pie chart still renders correctly after category change (reads from same query cache)
