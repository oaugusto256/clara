# Clara — Project Tasks & Execution Plan

This document defines the **task system** used in the Clara project.

It describes:
- how work is organized
- what has priority
- how features are broken down
- what “done” means

This file is intentionally explicit to support **AI-assisted development**, clarity, and long-term maintainability.

---

## 1. Task Philosophy

### 1.1 Tasks Are Product-Oriented
- Tasks represent **user or system value**
- No task exists “just for refactoring”
- Every task should answer: *why does this matter?*

### 1.2 Small, Executable Units
- Tasks should be completable in a single focused session
- Prefer multiple small tasks over a single large one
- Tasks should be independently testable when possible

### 1.3 Deterministic Order
- Tasks are ordered to **reduce uncertainty**
- Foundational tasks always come before feature tasks
- No UI task before domain logic is defined

---

## 2. Task Levels

### Level 1 — Foundation
Core structure, contracts, and rules.
> Nothing depends on UI or infra here.

### Level 2 — Domain Logic
Pure business logic.
> Deterministic, testable, infrastructure-agnostic.

### Level 3 — Data Flow
Ingestion, transformation, persistence.
> Still UI-independent.

### Level 4 — User Experience
Frontend features and interactions.

### Level 5 — Product Polish
Performance, UX improvements, documentation, deploy.

---

## 3. Global Task Status

- [ ] Not started
- [~] In progress
- [x] Done

---

## 4. Task Backlog

### 4.1 Foundation Tasks (Level 1)

- [x] Define project vision and scope
- [x] Create `ENGINEERING_GUIDELINES.md`
- [x] Create `DOMAIN_SCHEMAS.md`
- [x] Define Open Finance positioning (Open Finance–ready)
- [x] Create `TASKS.md`
- [x] Define folder structure (monorepo)
- [x] Setup shared schemas package

---

### 4.2 Domain Logic Tasks (Level 2)

#### Financial Rules Engine

- [x] Define rules engine input/output contracts
- [ ] Implement transaction grouping by category
- [ ] Implement actual spending calculation
- [ ] Implement base recommendation calculation
- [ ] Implement recommendation status logic (above/within/below)
- [ ] Add explainability strings
- [ ] Write deterministic unit tests
- [ ] Document rules engine behavior

---

### 4.3 Data Ingestion Tasks (Level 3)

#### CSV / OFX Import

- [x] Define supported file formats
- [x] Create normalized transaction input schema
- [x] Implement CSV parser
- [ ] Implement OFX parser
- [x] Normalize imported data to canonical `Transaction`
- [x] Add validation and error handling
- [ ] Create ingestion reprocessing flow

---

### 4.4 Backend Tasks (Level 3)

- [x] Setup Fastify server
- [x] Setup PostgreSQL connection
- [x] Setup Drizzle ORM
- [ ] Implement transaction persistence
- [x] Implement category persistence
- [ ] Implement recommendation persistence
- [x] Expose read-only APIs for dashboard
- [ ] Add audit logging

---

### 4.5 Frontend Tasks (Level 4)

#### Dashboard

- [x] Define dashboard layout
- [x] Implement transactions table (basic upload & display)
- [x] Implement transactions table (virtualized)
- [x] Implement category pie chart
- [ ] Implement monthly evolution chart
- [ ] Implement recommendations summary
- [ ] Handle loading / empty / error states

#### UX & Interaction

- [ ] Manual category override
- [ ] Recalculate recommendations on change
- [ ] Explain recommendation differences
- [ ] Accessibility pass

---

### 4.6 Product Polish (Level 5)

- [ ] Performance optimizations
- [ ] Error boundaries
- [ ] Empty state copywriting
- [ ] README final review
- [ ] Demo data seeding
- [ ] Deployment setup (AWS)
- [ ] Production checklist

---

## 5. Definition of Done (DoD)

A task is considered **done** when:

- The task delivers clear value
- Edge cases are handled
- Types and schemas are respected
- Tests exist (when applicable)
- Code is readable and explainable
- No architectural rules are violated

---

## 6. How AI Should Use This File

When generating or modifying code:

1. Identify the relevant task
2. Respect the task level ordering
3. Do not skip foundational steps
4. Prefer minimal implementations first
5. Never introduce features not listed here

## 7. Technical Stack & Responsibilities

This section defines the **official technical stack** used in the Clara project and the **role of each technology**.

The goal is to:
- avoid ambiguity
- guide implementation decisions
- support AI-assisted development
- make the project readable for recruiters and collaborators

---

### 7.1 Frontend Stack (Primary Focus)

The frontend is the **primary focus** of this project.

#### Technologies
- React
- TypeScript
- Modern React patterns (hooks, composition)
- Charting library (to be defined)
- Data-fetching library (to be defined)

#### Responsibilities
- Owns all user-facing experiences
- Renders financial data in a clear, accessible way
- Handles complex UI states:
  - loading
  - empty
  - error
  - success
- Consumes backend data without re-implementing business logic
- Never performs financial calculations outside the rules engine

#### Principles
- Feature-based folder structure
- Schema-driven forms and UI
- Derived state over stored state
- Performance-first mindset for large datasets

---

### 7.2 Backend Stack

The backend exists to **serve the frontend**, not the opposite.

#### Technologies
- Node.js
- Fastify
- TypeScript
- Drizzle ORM
- PostgreSQL

#### Responsibilities
- Data persistence
- Validation at boundaries
- Expose simple, explicit APIs
- Never contain UI-specific logic
- Never duplicate business rules already defined in the rules engine

#### Principles
- Domain-oriented modules
- Explicit contracts
- Minimal middleware
- Predictable error handling

---

### 7.3 Database

#### Technology
- PostgreSQL

#### Responsibilities
- Persist canonical domain data
- Maintain data integrity
- Support auditability
- Enable efficient querying for dashboards

#### Principles
- Financial data is immutable
- Migrations are mandatory
- JSONB is used only when flexibility is required
- Schema reflects domain, not UI needs

---

### 7.4 Rules Engine (Shared Domain Logic)

#### Technology
- TypeScript
- Shared as a standalone package

#### Responsibilities
- All financial calculations
- Categorization logic
- Recommendation generation
- Explainability

#### Principles
- Pure functions
- Deterministic outputs
- Fully testable
- No dependencies on infrastructure, UI, or frameworks

---

### 7.5 Infrastructure

#### Technologies
- AWS (minimal setup)
- Environment-based configuration

#### Responsibilities
- Host backend and frontend
- Provide secure environment separation
- Support local development parity

#### Principles
- Prefer managed services
- Avoid premature scaling
- Infrastructure must not leak into business logic

---

### 7.6 What This Project Is NOT

- Not a backend-heavy system
- Not an infrastructure showcase
- Not a microservices architecture
- Not framework experimentation

This project is intentionally focused on:
> **Frontend architecture, domain clarity, and product-oriented engineering.**


---

## Final Note

This project is executed intentionally.

Speed is achieved through **clarity**, not shortcuts.
