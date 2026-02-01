// Shared domain schemas (canonical model) — minimal TypeScript implementation
// Source of truth: /DOMAIN_SCHEMAS.md

/**
 * Money values are stored as integers in minor units (e.g. cents).
 */
export type Money = {
  /** integer in minor units (cents) */
  amount: number;
  currency: string; // ISO 4217
};

export type User = {
  id: string;
  email: string;
  createdAt: string; // ISO date
};

export type UserProfile = {
  userId: string;
  country: string; // ISO 3166-1
  region?: string; // e.g. BR-SP
  monthlyIncome?: Money;
  householdSize?: number;
};

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'wallet';
  institution?: string;
  currency: string;
  createdAt: string; // ISO date
};

export type Transaction = {
  id: string;
  userId: string;
  accountId: string;

  description: string;
  amount: Money;
  direction: 'income' | 'expense';

  date: string; // ISO date
  postedAt?: string; // ISO date

  categoryId?: string;
  source: 'csv' | 'ofx' | 'open_finance_mock' | 'open_finance_real';

  metadata?: Record<string, unknown>;
};

export type Category = {
  id: string;
  key: string; // e.g. "housing", "food", "transport"
  name: string;
  color?: string;
};



export type Budget = {
  id: string;
  userId: string;
  categoryId: string;
  recommendedPercentage?: number; // 0–1
  customPercentage?: number;
  createdAt: string; // ISO date
};

export type EconomicRule = {
  id: string;
  categoryKey: string;
  basePercentage: number; // 0–1
  adjustments?: {
    country?: Record<string, number>;
    region?: Record<string, number>;
    incomeRange?: {
      min?: number;
      max?: number;
      adjustment: number;
    }[];
  };
  source: string;
};

export type Recommendation = {
  categoryKey: string;
  recommendedPercentage: number;
  actualPercentage: number;
  recommendedAmount: Money;
  actualAmount: Money;
  status: 'within' | 'above' | 'below';
  explanation: string;
};

export type NormalizedTransactionInput = {
  accountExternalId: string;
  description: string;
  amount: number;
  currency: string;
  date: string; // ISO date
};

export * from './schemas';

// Re-export runtime Zod schemas and helpers so other packages can import them
export {
  AccountSchema, BudgetSchema, CategorySchema, DEFAULT_CATEGORY_KEYS,
  DefaultCategoriesSchema, EconomicRuleSchema, MoneySchema, NormalizedTransactionInputSchema, RecommendationSchema, TransactionSchema, UserProfileSchema, UserSchema
} from './schemas';

