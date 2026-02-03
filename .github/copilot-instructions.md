
# Clara — AI Coding Agent Instructions

Welcome to the Clara codebase! This guide is for AI coding agents to maximize productivity and maintain architectural integrity.

## 🧱 Architecture Overview
- **Monorepo**: `apps/` (web, api), `packages/` (schemas, rules-engine, ui)
- **Canonical Domain Model**: All data contracts and validation are defined in `packages/schemas` and `docs/DOMAIN_SCHEMAS.md`. These are the single source of truth for all layers.
- **Rules Engine**: All financial logic (categorization, recommendations, calculations) lives in `packages/rules-engine` — pure, deterministic, infra-agnostic, and fully testable.
- **API**: Fastify backend in `apps/api` exposes REST endpoints, validates all input using shared schemas, and never duplicates business logic.
- **Frontend**: React app in `apps/web` — feature-based structure, consumes only API and schemas, never re-implements business rules.

## 🛠 Developer Workflows
- **Install**: `pnpm install && pnpm run bootstrap`
- **Build**: `pnpm run build` (all packages)
- **Lint/Format**: `pnpm run lint` (Biome), `pnpm run format`
- **Test**: `pnpm -w -F <package> run test` (e.g., `@clara/rules-engine`)
- **API Dev**: `pnpm -w -F @clara/api run dev`
- **Docs**: API docs at `http://localhost:3000/docs` (OpenAPI JSON at `/docs/json`)

## 📐 Project Conventions
- **Schema-Driven**: All validation and contracts use shared schemas. Never invent types or validation in isolation. All forms and API endpoints must use these schemas.
- **Feature-Based Structure**: Both frontend and backend are organized by domain features (e.g., `/dashboard`, `/transactions`), not technical layers.
- **No Business Logic in UI/API**: All calculations and rules must go through the rules engine. UI and API must not duplicate or bypass business logic.
- **Immutability**: Financial data is append-only; never mutate historical records. All changes are additive.
- **Declarative, Explainable Rules**: Rules are data-driven, versioned, and must be explainable to the end user.
- **Testing Focus**: Prioritize business logic and rules engine tests over UI tests. All rules must be unit-testable in isolation.
- **Explicit Task System**: All work must follow the task system in `docs/TASKS.md` (task levels, priorities, DoD). Never skip foundational steps or invent features not in the backlog.

## 🔗 Key Files & Directories
- `docs/DOMAIN_SCHEMAS.md`: Canonical domain model and invariants
- `docs/PROJECT_RULES.md`: Engineering rules for each layer
- `docs/TASKS.md`: Task system, priorities, and DoD
- `packages/schemas/`: Shared TypeScript/Zod schemas (single source of truth)
- `packages/rules-engine/`: Core financial logic (pure, deterministic)
- `apps/api/`: Fastify backend, API routes, input validation
- `apps/web/`: React frontend, feature-based structure

## 🤖 AI-Specific Guidance
- **Respect Task System**: Always identify the relevant task and follow task level ordering from `docs/TASKS.md`.
- **Follow Engineering Rules**: See `docs/PROJECT_RULES.md` for explicit rules per layer (frontend, backend, rules engine, infra).
- **No Hidden State**: All logic must be deterministic and testable. No side effects or hidden state.
- **No Premature Optimization**: Clarity and explainability over cleverness. Prefer explicit, readable code.
- **No Feature Creep**: Only implement features/tasks defined in the backlog. Never introduce features not listed.
- **No UI/Backend Business Logic**: All financial calculations and rules must go through the rules engine.
- **Schema-Driven Everything**: All forms, APIs, and validation must use shared schemas. Never invent types or validation in isolation.

## 📝 When in Doubt
- Reference the canonical schemas and rules docs (`docs/DOMAIN_SCHEMAS.md`, `docs/PROJECT_RULES.md`).
- Ask for clarification if a requirement or pattern is unclear.
- Review the task system in `docs/TASKS.md` before starting new work.

---

_This file is auto-generated. Update as the architecture or conventions evolve._
