# @clara/schemas

Shared TypeScript domain schemas for Clara.

See `DOMAIN_SCHEMAS.md` at the repository root for the canonical model.

## Runtime exports and usage

This package exports both TypeScript types and runtime Zod schemas. Import from the package root for types and runtime schemas:

```ts
import { Transaction, TransactionSchema, NormalizedTransactionInputSchema } from '@clara/schemas';
```

Use the runtime schemas for validation at boundaries (ingestion, API payloads, normalization).

## Schema versioning & governance

- Treat schema changes as breaking if they change types or validation shape.
- Bump package version and add a short CHANGELOG entry when making breaking changes to schemas.
- Add tests that assert runtime schemas are exported from the package root to avoid regressions (e.g., `packages/schemas/tests/exports.test.ts`).


Export minimal types here and expand as the project grows.

Available exports:
- `Money`, `User`, `UserProfile`, `Account`, `Transaction`, `Category`, `Budget`, `EconomicRule`, `Recommendation`, `NormalizedTransactionInput`
- `DEFAULT_CATEGORY_KEYS` — canonical category keys used by the product

Notes:
- Types mirror the canonical model in `/DOMAIN_SCHEMAS.md` and are intended to be the single source of truth for domain contracts across packages.
