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

## 🧱 MVP 1 Pillars

1. **Data Ingestion (Manual)**
2. **Financial Categorization**
3. **Clear Visualizations**
4. **Basic Financial Recommendations**

---

## 🗂 Backlog Structure

Each backlog item includes:
- a short description
- acceptance criteria
- dependency level

---

## 🟢 Foundation (Must-Have)

### F-01 — Project Setup
**Description**
- Initialize monorepo
- Setup base folder structure
- Setup TypeScript configs

**Acceptance Criteria**
- Project runs locally
- Linting and formatting configured
- Clear package boundaries

**Dependencies**
- None

---

### F-02 — Domain Schemas
**Description**
- Implement schemas defined in `DOMAIN_SCHEMAS.md`
- Export shared types

**Acceptance Criteria**
- Schemas compile
- Used consistently across packages

**Dependencies**
- F-01

---

## 🟢 Data Ingestion (Manual Import)

### D-01 — CSV Import
**Description**
- Allow users to upload CSV files with transactions
- Parse and validate data

**Acceptance Criteria**
- CSV is parsed successfully
- Invalid rows are rejected with clear errors
- Output matches canonical `Transaction` schema

**Dependencies**
- F-02

---

### D-02 — OFX Import
**Description**
- Support OFX file import
- Normalize OFX data

**Acceptance Criteria**
- OFX files are parsed
- Transactions are normalized

**Dependencies**
- F-02

---

## 🟢 Categorization

### C-01 — Default Categories
**Description**
- Seed default expense categories

**Acceptance Criteria**
- Categories are available after setup
- Categories are used by rules engine

**Dependencies**
- F-02

---

### C-02 — Automatic Categorization
**Description**
- Categorize transactions using simple rules (keywords / mappings)

**Acceptance Criteria**
- Transactions receive a category
- Rules are deterministic

**Dependencies**
- D-01, D-02

---

### C-03 — Manual Category Override
**Description**
- Allow user to change transaction category manually

**Acceptance Criteria**
- Category change is persisted
- Recalculation is triggered

**Dependencies**
- C-02

---

## 🟢 Rules Engine (Core Logic)

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
