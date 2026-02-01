# @clara/schemas

Shared TypeScript domain schemas for Clara.

See `DOMAIN_SCHEMAS.md` at the repository root for the canonical model.

Export minimal types here and expand as the project grows.

Available exports:
- `Money`, `User`, `UserProfile`, `Account`, `Transaction`, `Category`, `Budget`, `EconomicRule`, `Recommendation`, `NormalizedTransactionInput`
- `DEFAULT_CATEGORY_KEYS` — canonical category keys used by the product

Notes:
- Types mirror the canonical model in `/DOMAIN_SCHEMAS.md` and are intended to be the single source of truth for domain contracts across packages.
