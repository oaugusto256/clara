import { z } from 'zod';

export const MoneySchema = z.object({
  amount: z.number().int(),
  currency: z.string().length(3),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.string(),
});

export const UserProfileSchema = z.object({
  userId: z.string(),
  country: z.string(),
  region: z.string().optional(),
  monthlyIncome: MoneySchema.optional(),
  householdSize: z.number().optional(),
});

export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: z.union([z.literal('checking'), z.literal('savings'), z.literal('credit_card'), z.literal('wallet')]),
  institution: z.string().optional(),
  currency: z.string(),
  createdAt: z.string(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accountId: z.string(),
  description: z.string(),
  amount: MoneySchema,
  direction: z.union([z.literal('income'), z.literal('expense')]),
  date: z.string(),
  postedAt: z.string().optional(),
  categoryId: z.string().optional(),
  source: z.union([z.literal('csv'), z.literal('ofx'), z.literal('open_finance_mock'), z.literal('open_finance_real')]),
  metadata: z.record(z.unknown()).optional(),
});

export const CategorySchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  color: z.string().optional(),
});

export const BudgetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  categoryId: z.string(),
  recommendedPercentage: z.number().min(0).max(1).optional(),
  customPercentage: z.number().min(0).max(1).optional(),
  createdAt: z.string(),
});

export const EconomicRuleSchema = z.object({
  id: z.string(),
  categoryKey: z.string(),
  basePercentage: z.number().min(0).max(1),
  adjustments: z
    .object({
      country: z.record(z.number()).optional(),
      region: z.record(z.number()).optional(),
      incomeRange: z
        .array(
          z.object({ min: z.number().optional(), max: z.number().optional(), adjustment: z.number() })
        )
        .optional(),
    })
    .optional(),
  source: z.string(),
});

export const RecommendationSchema = z.object({
  categoryKey: z.string(),
  recommendedPercentage: z.number().min(0).max(1),
  actualPercentage: z.number().min(0).max(1),
  recommendedAmount: MoneySchema,
  actualAmount: MoneySchema,
  status: z.union([z.literal('within'), z.literal('above'), z.literal('below')]),
  explanation: z.string(),
});

export const NormalizedTransactionInputSchema = z.object({
  accountExternalId: z.string().optional(),
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
});

export const DEFAULT_CATEGORY_KEYS = [
  'housing',
  'food',
  'transport',
  'health',
  'education',
  'leisure',
  'subscriptions',
  'savings',
  'other',
] as const;

// Small helper: validate DEFAULT_CATEGORY_KEYS shape
export const DefaultCategoriesSchema = z.array(z.string()).nonempty();
DefaultCategoriesSchema.parse(DEFAULT_CATEGORY_KEYS as unknown);

