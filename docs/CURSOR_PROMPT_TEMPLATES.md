# Clara — Cursor Prompt Templates

Copy/paste and fill in the placeholders. These templates are designed to get consistent, actionable responses from Cursor’s AI.

## Template: Implement a feature

```text
Goal: [describe user value]
Task reference: [link to relevant section in docs/TASKS.md]
Scope: [which folders/files to touch]
Constraints:
  - [must]
  - [never]
Acceptance criteria:
  - [observable behavior]
  - [states / edge cases]
Verification:
  - [tests/build checks you expect]
```

## Template: Add/update an API endpoint (apps/api)

```text
Goal: [what the endpoint should return or do]
Task reference: [docs/TASKS.md]
Scope: [exact routes/services/repositories to update]
Domain schema requirements:
  - request/response must conform to: [relevant schema names in docs/DOMAIN_SCHEMAS.md]
Validation rules:
  - [how input should be validated]
Error handling:
  - [what errors should look like]
Verification:
  - [unit tests + any integration surface]
```

## Template: Update a React UI (apps/web)

```text
Goal: [new UI behavior]
Task reference: [docs/TASKS.md]
Scope: [components/hooks/queries to update]
State requirements:
  - loading: [what to show]
  - empty: [what to show]
  - error: [what to show]
  - success: [what to show]
Performance notes:
  - [virtualization/memoization considerations]
Verification:
  - [component tests if applicable, otherwise manual checklist]
```

## Template: Debug a bug

```text
Bug: [what is wrong + exact symptom]
Where: [file/path + function/component]
Expected vs actual:
  - expected: [...]
  - actual: [...]
Reproduction steps:
  - [...]
Investigation constraints:
  - [what not to change]
Verification:
  - [tests/build/run steps]
```

## Template: Add/upgrade tests

```text
Goal: [what behavior needs coverage]
Scope: [test files + target module]
Rules:
  - tests must be deterministic
  - cover edge cases (financial + UI states if applicable)
Verification:
  - [how to run]
```
