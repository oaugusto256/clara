# Clara — AI Self-Check Checklist

Use this checklist at the end of any AI-assisted change request.

## Boundaries and correctness

- Frontend does not perform financial calculations (uses rules engine outputs only).
- Backend validates all inputs at the boundary using shared schemas.
- Domain invariants are preserved (money integer minor units + explicit currency; transactions immutable).

## UX and states (apps/web)

- New/changed UI includes `loading`, `empty`, `error`, and `success` states.
- No duplicated sources of truth between query/data layer and component local state.

## Determinism and explainability (rules/financial logic)

- Outputs are deterministic given the same inputs.
- Explanations are included when business logic produces a user-facing recommendation.

## Testing and verification

- Added/updated unit tests for business logic.
- If API behavior changed, added/updated API-level tests (or clear verification steps).
- Provided a short “how to verify” plan (commands + what to look for).

## Minimal, safe changes

- Changes are scoped to the requested task and acceptance criteria.
- Refactors avoid unrelated churn.
