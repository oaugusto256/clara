# Clara — MVP 1 Backlog

This document defines the **official backlog for Clara MVP 1**.

MVP 1 is focused on **delivering immediate value** to the user:
- understanding where money is going
- visualizing spending clearly
- comparing actual spending vs recommended budgets

No Open Finance integration is included in MVP 1.

---

## 🎯 MVP 1 Goal

> Help a user clearly visualize their expenses and understand whether their spending aligns with recommended financial guidelines.

---

## 🚫 Explicitly Out of Scope (MVP 1)

- Real Open Finance integration
- Automatic bank sync
- Alerts and notifications
- Financial goals
- Investments
- Mobile app
- User-to-user features

---
1. **Data Ingestion (Manual)**
2. **Financial Categorization**


### F-01 — Project Setup
- Setup base folder structure
- Setup TypeScript configs
**Acceptance Criteria**

**Status**: **Done** — implemented shared schemas package, exported runtime Zod schemas, added package-level tests, integrated with `@clara/rules-engine` and `@clara/api`, and updated CI to run `test:ci` (2026-02-01)
- Linting and formatting configured

**Dependencies**
- None

### F-02 — Domain Schemas

**Acceptance Criteria**
- Used consistently across packages

**Status**: **Done** — CSV parser, normalization utility, and tests implemented. Endpoint validates, parses, and normalizes CSV; errors are reported; output matches canonical `Transaction` schema. (2026-02-02)
**Dependencies**

**Status**: **Done** — implemented shared schemas package, exported runtime Zod schemas, added package-level tests, integrated with `@clara/rules-engine` and `@clara/api`, and updated CI to run `test:ci` (2026-02-01)




## 🟢 Data Ingestion (Manual Import)
**Description**
- Allow users to upload CSV files with transactions

**Status**: **Done** — contracts align with domain schemas, no infra dependencies (2026-02-01)
- CSV is parsed successfully
- Output matches canonical `Transaction` schema

**Dependencies**

**Status**: **Done** — CSV parser, normalization utility, and tests implemented. Endpoint validates, parses, and normalizes CSV; errors are reported; output matches canonical `Transaction` schema. (2026-02-02)

### D-02 — OFX Import
- Support OFX file import
**Status**: **Done** — aggregation logic and tests implemented (2026-02-01)

- OFX files are parsed
- Transactions are normalized

- F-02


## 🟢 Categorization

### C-01 — Default Categories
**Description**

**Status**: **Done** — recommendation logic and tests implemented (2026-02-01)
- Categories are available after setup

**Dependencies**
- F-02

---
**Description**
- Categorize transactions using simple rules (keywords / mappings)
- Transactions receive a category
- Rules are deterministic
**Dependencies**
**Status**: **Done** — Fastify server and health check implemented (2026-02-01)


### C-03 — Manual Category Override
**Description**

**Acceptance Criteria**
- Category change is persisted
- Recalculation is triggered


---
## 🟢 Rules Engine (Core Logic)
**Status**: **In Progress** — endpoints for transactions, categories, and recommendations not yet implemented (2026-02-02)
### R-01 — Rules Engine Contracts
**Description**
- Define input/output contracts for rules engine

**Acceptance Criteria**
- Contracts align with domain schemas
- No infra dependencies

**Dependencies**
- F-02

---

### R-02 — Spending Aggregation
**Description**
- Aggregate expenses by category

**Acceptance Criteria**
- Totals are correct
- Currency is respected

**Dependencies**
- R-01

---

### R-03 — Recommendation Calculation
**Description**
- Compare actual spending vs recommended percentages

**Acceptance Criteria**
- Recommendations include:
  - actual
  - recommended
  - status (above / within / below)

**Dependencies**
- R-02

---

## 🟢 Backend (Minimal)

### B-01 — API Setup
**Description**
- Setup Fastify server
- Basic health check

**Acceptance Criteria**
- Server starts
- Health endpoint responds


**Status**: **Done** — Fastify server and health check implemented (2026-02-01)

**Dependencies**
- F-01

---

### B-02 — Read-Only APIs
**Description**
- Expose APIs for:
  - transactions
  - categories
  - recommendations

**Acceptance Criteria**
- APIs return valid data
- No mutation endpoints required

**Dependencies**
- R-03

---

## 🟢 Frontend (User-Facing MVP)

### FE-01 — Dashboard Layout
**Description**
- Create main dashboard layout

**Acceptance Criteria**
- Layout renders correctly
- Responsive structure

**Dependencies**
- None

---

### FE-02 — Transactions Table
**Description**
- Display transactions in a table
- Support large datasets

**Acceptance Criteria**
- Table is virtualized
- Sorting and filtering work

**Dependencies**
- B-02

---

### FE-03 — Category Pie Chart
**Description**
- Visualize spending distribution

**Acceptance Criteria**
- Pie chart reflects aggregated data
- Colors are consistent

**Dependencies**
- R-03

---

### FE-04 — Recommendations Summary
**Description**
- Display recommendation results

**Acceptance Criteria**
- Status (above/within/below) is clear
- Explanation text is shown

**Dependencies**
- R-03

---

## 🟢 UX & States

### UX-01 — Loading & Empty States
**Description**
- Handle loading, empty, and error states

**Acceptance Criteria**
- No blank screens
- Clear user messaging

**Dependencies**
- FE-01

---

## 🟢 MVP 1 Definition of Done

MVP 1 is considered **complete** when:

- A user can upload financial data (CSV or OFX)
- Transactions are categorized
- Spending is visualized clearly
- Recommendations are generated
- UI handles all major states
- No Open Finance integration is required

---

## 📌 Final Note

MVP 1 prioritizes **clarity and correctness over automation**.

If users understand their finances better after using Clara,
the MVP has succeeded.
