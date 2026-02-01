# Clara — Core Domain Schemas (Canonical Model)

This document defines the **canonical data model** for the Clara platform.

All layers of the system (frontend, backend, rules engine, ingestion pipeline) must conform to these schemas.

Schemas are written using **TypeScript (Zod-inspired)** definitions and represent the **single source of truth** for the domain.

---

## 1. Design Principles

- Schemas represent **business concepts**, not database tables
- Schemas must be explicit, versionable, and explainable
- Financial data is immutable by default
- Data source must never affect the schema

---

## 2. Money Representation

### Rules
- Monetary values are stored as integers
- Currency is always explicit
- No floating-point arithmetic

```ts
type Money = {
  amount: number // integer, in minor units (e.g. cents)
  currency: string // ISO 4217 (e.g. "BRL", "USD")
}
```

---

## 3. User & Profile

```ts
type User = {
  id: string
  email: string
  createdAt: string // ISO date
}
```

```ts
type UserProfile = {
  userId: string
  country: string // ISO 3166-1
  region?: string // e.g. BR-SP
  monthlyIncome?: Money
  householdSize?: number
}
```

---

## 4. Financial Accounts

Represents a logical account (bank, credit card, wallet).

```ts
type Account = {
  id: string
  userId: string
  name: string
  type: "checking" | "savings" | "credit_card" | "wallet"
  institution?: string
  currency: string
  createdAt: string // ISO date
}
```

---

## 5. Transactions (Core Entity)

```ts
type Transaction = {
  id: string
  userId: string
  accountId: string

  description: string
  amount: Money
  direction: "income" | "expense"

  date: string // ISO date
  postedAt?: string // ISO date

  categoryId?: string
  source: "csv" | "ofx" | "open_finance_mock" | "open_finance_real"

  metadata?: Record<string, unknown>
}
```

### Invariants
- Transactions are immutable
- Categorization is metadata, not identity
- Source is informational only

---

## 6. Categories

```ts
type Category = {
  id: string
  key: string // e.g. "housing", "food", "transport"
  name: string
  color?: string
}
```

Default categories:
- housing
- food
- transport
- health
- education
- leisure
- subscriptions
- savings
- other

---

## 7. Budgets & Targets

```ts
type Budget = {
  id: string
  userId: string
  categoryId: string
  recommendedPercentage?: number // 0–1
  customPercentage?: number
  createdAt: string // ISO date
}
```

---

## 8. Economic Rules

```ts
type EconomicRule = {
  id: string
  categoryKey: string
  basePercentage: number // 0–1
  adjustments?: {
    country?: Record<string, number>
    region?: Record<string, number>
    incomeRange?: {
      min?: number
      max?: number
      adjustment: number
    }[]
  }
  source: string
}
```

---

## 9. Recommendations

```ts
type Recommendation = {
  categoryKey: string
  recommendedPercentage: number
  actualPercentage: number
  recommendedAmount: Money
  actualAmount: Money
  status: "within" | "above" | "below"
  explanation: string
}
```

---

## 10. Data Ingestion (Normalized Input)

```ts
type NormalizedTransactionInput = {
  accountExternalId: string
  description: string
  amount: number
  currency: string
  date: string // ISO date
}
```

---

## 11. Global Invariants

- No financial calculation without currency
- No UI bypasses rules engine
- No mutation of historical data
- All recommendations must be explainable

---

## Final Note

If a concept is not defined here, **it does not exist** in the system.
