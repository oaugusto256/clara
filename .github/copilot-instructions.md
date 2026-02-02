# Clara — AI Coding Agent Instructions

Welcome to the Clara codebase! This guide is for AI coding agents to maximize productivity and maintain architectural integrity.

## 🧱 Architecture Overview
- **Monorepo**: `apps/` (web, api), `packages/` (schemas, rules-engine, ui)
- **Domain Model**: Canonical schemas in `packages/schemas` and `docs/DOMAIN_SCHEMAS.md` are the single source of truth for all layers.
- **Rules Engine**: All financial logic (categorization, recommendations) lives in `packages/rules-engine` — pure, deterministic, infra-agnostic.
- **API**: Fastify backend in `apps/api` exposes REST endpoints, validates all input using shared schemas.
- **Frontend**: React app in `apps/web` — never duplicates business logic, consumes only API and schemas.

## 🛠 Developer Workflows
- **Install**: `pnpm install && pnpm run bootstrap`
- **Build**: `pnpm run build` (all packages)
- **Lint/Format**: `pnpm run lint` (Biome), `pnpm run format`
- **Test**: `pnpm -w -F <package> run test` (e.g., `@clara/rules-engine`)
- **API Dev**: `pnpm -w -F @clara/api run dev`
- **Docs**: API docs at `http://localhost:3000/docs`

## 📐 Project Conventions
- **Schema-Driven**: All validation and contracts use shared schemas. Never invent types or validation in isolation.
- **Feature-Based Structure**: Both frontend and backend are organized by domain features, not technical layers.
- **No Business Logic in UI/API**: All calculations and rules must go through the rules engine.
- **Immutability**: Financial data is append-only; never mutate historical records.
- **Declarative Rules**: Rules are data-driven, versioned, and explainable.
- **Testing Focus**: Prioritize business logic and rules engine tests over UI tests.

## 🔗 Key Files & Directories
- `docs/DOMAIN_SCHEMAS.md`: Canonical domain model
- `packages/schemas/`: Shared TypeScript/Zod schemas
- `packages/rules-engine/`: Core financial logic
- `apps/api/`: Fastify backend, API routes
- `apps/web/`: React frontend

## ⚠️ AI-Specific Guidance
- **Respect Task System**: See `docs/TASKS.md` for task levels, priorities, and DoD. Never skip foundational steps.
- **Follow Engineering Rules**: `docs/PROJECT_RULES.md` defines explicit rules for each layer (frontend, backend, rules engine, infra).
- **No Hidden State**: All logic must be deterministic and testable.
- **No Premature Optimization**: Clarity and explainability over cleverness.
- **No Feature Creep**: Only implement features/tasks defined in backlog.

## 📝 When in Doubt
- Reference the canonical schemas and rules docs.
- Ask for clarification if a requirement or pattern is unclear.

---

_This file is auto-generated. Update as the architecture or conventions evolve._
