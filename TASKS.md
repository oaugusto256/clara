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
- [ ] Create `TASKS.md`
- [ ] Define folder structure (monorepo)
- [ ] Setup shared schemas package

---

### 4.2 Domain Logic Tasks (Level 2)

#### Financial Rules Engine

- [ ] Define rules engine input/output contracts
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

- [ ] Define supported file formats
- [ ] Create normalized transaction input schema
- [ ] Implement CSV parser
- [ ] Implement OFX parser
- [ ] Normalize imported data to canonical `Transaction`
- [ ] Add validation and error handling
- [ ] Create ingestion reprocessing flow

---

### 4.4 Backend Tasks (Level 3)

- [ ] Setup Fastify server
- [ ] Setup PostgreSQL connection
- [ ] Setup Drizzle ORM
- [ ] Implement transaction persistence
- [ ] Implement category persistence
- [ ] Implement recommendation persistence
- [ ] Expose read-only APIs for dashboard
- [ ] Add audit logging

---

### 4.5 Frontend Tasks (Level 4)

#### Dashboard

- [ ] Define dashboard layout
- [ ] Implement transactions table (virtualized)
- [ ] Implement category pie chart
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

---

## Final Note

This project is executed intentionally.

Speed is achieved through **clarity**, not shortcuts.
