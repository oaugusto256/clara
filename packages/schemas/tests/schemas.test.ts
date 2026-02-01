import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CATEGORY_KEYS,
  MoneySchema,
  RecommendationSchema,
  TransactionSchema,
} from '../src/schemas';

describe('schemas: basic validation', () => {
  it('validates a Money value', () => {
    const ok = { amount: 1000, currency: 'USD' };
    expect(() => MoneySchema.parse(ok)).not.toThrow();
  });

  it('rejects invalid Money (non-integer)', () => {
    const bad = { amount: 12.34, currency: 'USD' };
    expect(() => MoneySchema.parse(bad)).toThrow();
  });

  it('validates a minimal Transaction', () => {
    const tx = {
      id: 't1',
      userId: 'u1',
      accountId: 'a1',
      description: 'Coffee',
      amount: { amount: 500, currency: 'BRL' },
      direction: 'expense',
      date: '2026-02-01',
      source: 'csv',
    };

    expect(() => TransactionSchema.parse(tx)).not.toThrow();
  });

  it('validates DEFAULT_CATEGORY_KEYS', () => {
    expect(DEFAULT_CATEGORY_KEYS.length).toBeGreaterThan(0);
  });

  it('validates a Recommendation shape', () => {
    const r = {
      categoryKey: 'food',
      recommendedPercentage: 0.15,
      actualPercentage: 0.2,
      recommendedAmount: { amount: 15000, currency: 'BRL' },
      actualAmount: { amount: 20000, currency: 'BRL' },
      status: 'above' as const,
      explanation: 'You spent more than recommended',
    };

    expect(() => RecommendationSchema.parse(r)).not.toThrow();
  });
});
