# Editable Transaction Category — Design Spec

**Date:** 2026-03-21
**Branch:** feat/let-edit-transaction-category
**Status:** Approved

---

## Overview

Allow users to change the category of any transaction directly from the transactions table in the dashboard. The change persists to the backend via a new PATCH endpoint. The UI uses optimistic updates for a snappy feel, with automatic rollback on error.

---

## Domain Context

- `Transaction.categoryKey` is metadata, not identity (per `DOMAIN_SCHEMAS.md` invariant: "Categorization is metadata, not identity"). `categoryKey` is present in `@clara/schemas` (Zod) and the DB schema but not yet in `DOMAIN_SCHEMAS.md` — that doc must be updated as part of this feature.
- Valid categories are the 9 values in `DEFAULT_CATEGORY_KEYS` from `@clara/schemas`: `housing`, `food`, `transport`, `health`, `education`, `leisure`, `subscriptions`, `savings`, `other`.
- The `category_key` column already exists on the `transactions` DB table — no migration required.
- Transactions are immutable in the financial sense; updating `category_key` is explicitly permitted as it is metadata.
- `categoryId` will **not** be updated by this feature — no `categories` lookup table exists. Only `category_key` is updated.

---

## Backend

### New Endpoint

```
PATCH /transactions/:id/category
```

**Request body:**
```ts
{ categoryKey: string } // z.enum(DEFAULT_CATEGORY_KEYS) imported from @clara/schemas — not re-declared locally
```

**Validation (at route boundary):**
- `id`: non-empty string path param (varchar up to 64 chars)
- `categoryKey`: `z.enum(DEFAULT_CATEGORY_KEYS)` — imported directly from `@clara/schemas`

**Service behavior:**
- Updates `category_key` on the matching transaction row
- Does **not** touch `category_id`
- Returns the updated transaction

**Response:**
- `200` with the updated `Transaction` object
- `400` if `categoryKey` is not a valid domain category
- `404` if transaction not found

**Architecture:** route → service → DB CRUD — no business logic, no rules engine involvement.

### `server.ts` changes

- Add `'PATCH'` to the CORS `methods` array (currently `['POST', 'GET', 'OPTIONS']`)
- Add `categoryKey: { type: 'string' }` to the **inline** Swagger `Transaction` schema in the `components.schemas` block. Note: `apps/api/src/generated-schemas/Transaction.schema.json` (used by the GET route) already includes `categoryKey` and does not need to be changed.

---

## Frontend — Data Layer

### `apiEndpoints.ts`

Add a new constant for the update endpoint:
```ts
TRANSACTIONS_UPDATE_CATEGORY: (id: string) => `/transactions/${id}/category`
```

### Remove local state layer in `DashboardPage`

Currently `DashboardPage` seeds a `useState<Transaction[]>` from the query result via `useEffect` and passes that state to both `TransactionsUploadTable` and `CategoryPieChartContainer`. This layer is removed so both components derive their data directly from the TanStack Query cache:

```tsx
// Before
const [transactions, setTransactions] = useState<Transaction[]>([]);
useEffect(() => { if (data) setTransactions(data); }, [data]);

// After — both children receive:
transactions={data ?? []}
```

### `useImportCsvMutation` refactor

The hook internally adds `queryClient.invalidateQueries(["transactions"])` to its own `onSuccess` handler (before delegating to the passed `onSuccess` callback). The callback interface (`onSuccess`, `onError`, `onSettled`) is preserved so `TransactionsUploadTable` can still:
- `onSuccess`: call `setError(null)` (remove the `setTransactions(data.normalized || [])` call)
- `onError`: set the error message as before
- `onSettled`: call `setLoading(false)` as before — unchanged

This means `TransactionsUploadTable`'s `loading` and `error` local state continue to work exactly as before. Only `setTransactions` is removed from the `onSuccess` callback.

The `setTransactions` prop is removed from `TransactionsUploadTableProps` entirely.

### New hook: `useUpdateTransactionCategoryMutation`

Location: `apps/web/src/features/dashboard/queries/useUpdateTransactionCategoryMutation.ts`

**Behavior:**
- Calls `PATCH /transactions/:id/category` via `API_ENDPOINTS.TRANSACTIONS_UPDATE_CATEGORY(id)`
- **`onMutate`:** cancel in-flight queries, snapshot the cache, apply optimistic update:
  ```ts
  await queryClient.cancelQueries({ queryKey: ["transactions"] });
  const previous = queryClient.getQueryData<Transaction[]>(["transactions"]);
  queryClient.setQueryData<Transaction[]>(["transactions"], (old = []) =>
    old.map(t => t.id === id ? { ...t, categoryKey } : t)
  );
  return { previous }; // context for rollback
  ```
- **`onSuccess`:** call `queryClient.invalidateQueries({ queryKey: ["transactions"] })` to sync with server
- **`onError`:** `queryClient.setQueryData(["transactions"], context.previous)` to restore snapshot; surface a per-cell error indicator via mutation context

---

## Frontend — UI

### Update `categoryColors.ts`

The current `CATEGORY_COLORS` record uses legacy keys (`car`, `grocery`, `subscription` singular, `study`, `travel`, `pharmacy`, `shopping`, `insurance`) that do not match `DEFAULT_CATEGORY_KEYS`.

**Changes:**
- Replace the record to map all 9 canonical keys: `housing`, `food`, `transport`, `health`, `education`, `leisure`, `subscriptions`, `savings`, `other` — each with a distinct color. Keep `default` as a fallback.
- Remove all non-canonical keys. Legacy transaction data carrying old keys (e.g. `car`, `grocery`) will fall back to `CATEGORY_COLORS.default` (gray).
- Update `CATEGORY_COLOR_ARRAY` to contain exactly the 9 canonical key colors in `DEFAULT_CATEGORY_KEYS` order. This changes the array from 13 entries to 9. The pie chart uses this array for color cycling — this is an acceptable change since legacy category keys are no longer used.

### Changes to `TransactionsUploadTable`

- Remove `setTransactions` prop and its type from `TransactionsUploadTableProps`
- Replace the `categoryKey` column `cell` renderer with `CategorySelectCell`, receiving `transactionId` (`row.original.id`), `currentCategoryKey` (`info.getValue()`), and the update mutation
- Forward `tableContainerRef` to `CategorySelectCell` so it can attach a scroll listener for popover dismissal

### New component: `CategorySelectCell`

Location: `apps/web/src/features/dashboard/components/CategorySelectCell.tsx`

**Visual affordances (always visible):**
- `CategoryBadge` renders with a `▼` chevron appended on its right
- On row hover (via CSS `group-hover` on the `<tr>`), a pencil icon appears to the left of the badge

**Popover:**
- Controlled `isOpen: boolean` state local to the cell
- Clicking the badge/chevron toggles open
- Lists all 9 `DEFAULT_CATEGORY_KEYS` as selectable options, each with its color swatch (from updated `CATEGORY_COLORS`) + label
- Currently selected category is visually highlighted
- Selecting an option fires the mutation and closes the popover
- **Keyboard:** `Escape` closes without change; `Enter` on a focused option selects it

**Virtualizer-safe portal positioning:**
- The popover is rendered via `ReactDOM.createPortal` to `document.body`
- Position is computed from `cellRef.current.getBoundingClientRect()` on open
- A `scroll` event listener is attached to the virtualised scroll container (`tableContainerRef.current`, the inner `div` that holds virtual rows) — scroll events close the popover
- A `mousedown` listener on `document` closes the popover when clicking outside the portal

**Loading state:** While the PATCH is in-flight, the badge renders at reduced opacity.

**Error state:** On mutation error, the optimistic update rolls back (handled by the hook); a small inline error icon appears next to the badge for that row.

---

## States to Handle

| State | Behavior |
|-------|----------|
| Loading (PATCH in-flight) | Badge at reduced opacity |
| Success | Cache invalidated, badge reflects new category |
| Error | Rollback via snapshot, inline error icon on cell |
| Popover open | Lists 9 options, current highlighted; Escape closes |
| Popover closed | Static badge with chevron + hover pencil |
| Row scrolled out while popover open | Portal popover dismissed via scroll listener on `tableContainerRef.current` |

---

## Files Affected

### New files
- `apps/web/src/features/dashboard/queries/useUpdateTransactionCategoryMutation.ts`
- `apps/web/src/features/dashboard/components/CategorySelectCell.tsx`

### Modified files
- `apps/api/src/server.ts` — add `'PATCH'` to CORS methods; add `categoryKey` to inline Swagger Transaction schema
- `apps/api/src/http/routes/transactions.ts` — add PATCH route
- `apps/api/src/app/transactions/transactionsService.ts` — add `updateTransactionCategory` method
- `apps/api/src/infra/db/transactions.crud.ts` — add update CRUD function
- `apps/web/src/constants/apiEndpoints.ts` — add `TRANSACTIONS_UPDATE_CATEGORY` constant
- `apps/web/src/features/dashboard/DashboardPage.tsx` — remove local state layer; pass `data ?? []` to both child components
- `apps/web/src/features/dashboard/components/TransactionsUploadTable.tsx` — remove `setTransactions` prop; update `categoryKey` column renderer; forward `tableContainerRef`
- `apps/web/src/features/dashboard/queries/useImportCsvMutation.ts` — add internal `invalidateQueries(["transactions"])` on success
- `apps/web/src/features/dashboard/utils/categoryColors.ts` — replace with 9 canonical keys; update `CATEGORY_COLOR_ARRAY`
- `docs/DOMAIN_SCHEMAS.md` — add `categoryKey` to the canonical `Transaction` type, noting it is constrained to `DEFAULT_CATEGORY_KEYS` when set (already `z.string().optional()` in Zod schema — doc update is for domain documentation only, no schema migration needed)

### No changes needed
- DB migrations (`category_key` column already exists)
- `@clara/schemas` (types and `DEFAULT_CATEGORY_KEYS` already exported)
- `apps/api/src/generated-schemas/Transaction.schema.json` (`categoryKey` already present)

---

## Out of Scope

- Bulk category editing
- Custom (user-defined) categories
- Recalculating recommendations on category change (tracked separately in `TASKS.md`)
- Full accessibility pass (tracked separately in `TASKS.md`); minimum keyboard support (`Escape` + `Enter`) is in scope
