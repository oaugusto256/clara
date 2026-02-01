# Clara — Engineering Rules & Principles

This document defines the **technical rules, architectural constraints, and engineering mindset** for the Clara project.

Its goal is to ensure consistency, quality, and long-term maintainability while enabling AI-assisted development and collaboration.

---

## 1. Core Engineering Principles

### 1.1 Product First
- Every technical decision must be traceable to **user value**
- Features must solve a real financial clarity problem
- Avoid building abstractions without a clear use case

### 1.2 Clarity Over Cleverness
- Prefer explicit, readable code over clever optimizations
- Financial software must be understandable and explainable
- Code should be readable by humans first, AI second

### 1.3 Incremental Complexity
- Start simple, evolve deliberately
- Architecture must allow growth, but not anticipate every future
- No speculative abstractions

---

## 2. Engineering Mindset (Senior React, Frontend-Focused)

### 2.1 Frontend as a First-Class Citizen
- Frontend is not a “thin layer”
- Business rules are shared, not duplicated
- Frontend owns:
  - user experience
  - performance
  - accessibility
  - explainability

### 2.2 Thinking in User States
- Every feature must define:
  - loading states
  - empty states
  - error states
  - success states
- Financial data must always have a **clear narrative**

### 2.3 Data-Driven UI
- UI reacts to data, not side effects
- Prefer derived state over stored state
- Avoid local component state for server data

---

## 3. Frontend Rules (React + TypeScript)

### 3.1 Architecture
- Feature-based folder structure
- Clear separation between:
  - UI components
  - domain logic
  - data access

```text
/features
/dashboard
/transactions
/categories
/recommendations
/shared
/components
/hooks
/utils
```


### 3.2 State Management
- Server state is managed via a dedicated data-fetching layer
- UI state is local and minimal
- No duplicated sources of truth

### 3.3 Forms & Validation
- All forms must be schema-driven
- Validation rules must live in shared schemas
- Frontend must not invent validation rules

### 3.4 Performance
- Assume large datasets by default
- Use virtualization for tables
- Avoid unnecessary re-renders
- Memoization must be intentional and justified

---

## 4. Backend Rules (Node.js + Fastify)

### 4.1 API Design
- APIs must be explicit and predictable
- Prefer simple REST endpoints
- Avoid magic behavior or implicit side effects

### 4.2 Modularity
- Backend is organized by domain modules
- Each module contains:
  - routes
  - services
  - repositories
  - schemas

### 4.3 Validation
- All input must be validated at the boundary
- Shared schemas are the source of truth
- Backend must not trust frontend input

---

## 5. Database Rules (PostgreSQL)

### 5.1 Data Modeling
- Prefer normalized data for core entities
- Use JSONB only when flexibility is required
- Financial data must be immutable when possible

### 5.2 Migrations
- All schema changes must be versioned
- Migrations must be reversible when feasible
- No manual changes in production databases

### 5.3 Auditability
- Critical financial actions must be auditable
- Historical data must not be silently overwritten

---

## 6. Rules Engine (Financial Logic)

### 6.1 Declarative Rules
- All financial rules must be declarative
- Rules must be data-driven, not hard-coded
- Rules must be explainable to the end user

### 6.2 Determinism
- Given the same inputs, rules must produce the same output
- No hidden state or side effects

### 6.3 Testability
- Rules must be unit-testable in isolation
- No dependency on infrastructure or external APIs

---

## 7. Data Ingestion Rules

### 7.1 Source Agnostic
- Data ingestion must be source-agnostic
- CSV, OFX, mock Open Finance must produce the same internal format

### 7.2 Reprocessing
- It must be possible to reprocess historical data
- Changing a rule must not corrupt past data

---

## 8. Infrastructure & Deployment

### 8.1 Simplicity First
- Prefer managed services
- Avoid complex infrastructure for the MVP
- Infrastructure must be reproducible

### 8.2 Environment Separation
- Clear separation between:
  - development
  - staging
  - production

### 8.3 Observability
- Errors must be visible and actionable
- Logs must be meaningful, not verbose

---

## 9. Testing Philosophy

### 9.1 Focus on Business Logic
- Test financial calculations first
- UI tests are secondary to logic tests

### 9.2 Deterministic Tests
- No flaky tests
- No time-dependent logic without control

---

## 10. Open Finance Philosophy

### 10.1 Compliance Awareness
- Open Finance integration is optional and future-oriented
- Architecture must allow integration without rewrites

### 10.2 Explicit Boundaries
- Financial data sources must be isolated
- No Open Finance logic leaking into core business rules

---

## 11. Developer Experience (DX)

### 11.1 AI-Assisted Development
- Code must be structured to help AI reason about it
- Clear naming, clear boundaries, clear intent
- Favor explicitness over brevity

### 11.2 Documentation
- README explains the “why”, not only the “how”
- Architectural decisions should be documented when relevant

---

## 12. What We Explicitly Avoid

- Overengineering
- Premature optimization
- Tight coupling between layers
- Hidden business rules
- Framework-specific hacks
- Financial “magic”

---

## 13. Definition of Done

A feature is considered done when:
- It delivers clear user value
- Edge cases are handled
- Business rules are tested
- UX states are defined
- Code is readable and explainable
- The system remains easy to change

---

## Final Note

Clara is not built to be clever.

It is built to be **clear**, **trustworthy**, and **useful**.
