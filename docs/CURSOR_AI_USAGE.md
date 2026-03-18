# Clara — Cursor AI Usage Standard

This document standardizes how to ask Cursor’s AI for help so changes stay aligned with Clara’s engineering rules.

## What to include in every prompt

- Goal: what you want to accomplish (feature, refactor, fix, or test).
- Scope: which packages/files/folders are involved (or which task it maps to in `docs/TASKS.md`).
- Constraints: any “must/never” rules (ex: “no financial calculations outside rules engine”).
- Acceptance criteria: what “done” means for this change.
- Verification: what tests/build checks you expect or want added.

## How Cursor’s AI should respond (preferred format)

1. A short plan tied to `docs/TASKS.md` and/or `docs/DOMAIN_SCHEMAS.md`.
2. The minimal code changes needed (small diffs, clear boundaries).
3. Edge cases and error cases considered (financial + UI states).
4. A short test/verification plan (unit tests first, then integration surface if applicable).
5. Any follow-up questions if key details are missing.

## Where to look for “ground truth”

- `docs/PROJECT_RULES.md`: engineering mindset + architectural constraints.
- `docs/DOMAIN_SCHEMAS.md`: canonical domain types and invariants.
- `docs/TASKS.md`: task ordering and Definition of Done.

## Common prompt pitfalls to avoid

- Asking for code without saying which task it supports or what “done” means.
- Asking the AI to “improve” without defining constraints or acceptance criteria.
- Requesting financial logic in layers that should only orchestrate (frontend/backend should not calculate).
