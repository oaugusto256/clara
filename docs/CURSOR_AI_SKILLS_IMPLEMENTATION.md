# Clara — AI Skills (Task-Focused Prompting)

These “skills” are reusable prompt patterns. They are not code modules; they are prompt structures that you can copy/paste.

## Skill 1: Implement a new API capability

When you need a new dashboard capability or read-only API behavior:

Prompt skeleton:
```text
You are an engineer working on apps/api.
Implement: [capability].
Task reference: [docs/TASKS.md].
Scope: [routes/services/repositories/schemas].
Domain constraints: [which DOMAIN_SCHEMAS invariants apply].
Please:
1) Propose the minimal architecture changes.
2) Implement with thin routes and validated inputs.
3) Add/extend tests for the business logic + API behavior.
Output expectations:
- Provide the exact routes/methods changed
- Mention new/updated schemas
- Include verification steps
```

## Skill 2: Build/update React UI for server data

When you change dashboard behavior or data presentation:

Prompt skeleton:
```text
You are an engineer working on apps/web.
Implement: [UI behavior].
Task reference: [docs/TASKS.md].
Scope: [components/hooks/queries].
State requirements:
- loading/empty/error/success must be handled
Constraints:
- avoid duplicating sources of truth
- server data should flow through the query/data layer
Please:
1) Explain where state lives and why.
2) Implement minimal changes.
3) Include performance considerations for large datasets.
Verification:
- [tests/build steps or manual checklist]
```

## Skill 3: Schema-aligned changes (domain model updates)

When you must update types/schemas:

Prompt skeleton:
```text
You are working with domain schemas.
Change request: [what concept needs to change].
Constraints:
- update canonical schemas in docs/DOMAIN_SCHEMAS.md (and corresponding code)
- keep invariants (money/currency, immutability, determinism)
Please:
1) Identify all downstream dependencies (frontend/back/backend).
2) Provide a migration/compatibility approach if applicable.
3) Implement minimal code changes and add tests.
```

## Skill 4: Debugging with guardrails

Prompt skeleton:
```text
Debug request:
Symptom: [exact error + where it occurs]
Where: [file + function/component]
Repro: [steps]
Constraints:
- do not refactor unrelated code
- keep boundaries (frontend no calculations; backend validate at boundary)
Please:
1) Propose likely causes.
2) Verify by inspecting the relevant code paths.
3) Implement the smallest fix.
4) Add/adjust tests if feasible.
```
