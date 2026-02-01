import { describe, expect, it } from 'vitest';
import {
  NormalizedTransactionInputSchema,
  RecommendationSchema,
  TransactionSchema,
} from '..';

describe('schemas: package root exports', () => {
  it('exports runtime Zod schemas at package root', () => {
    expect(typeof RecommendationSchema.parse).toBe('function');
    expect(typeof TransactionSchema.parse).toBe('function');
    expect(typeof NormalizedTransactionInputSchema.parse).toBe('function');
  });

  it('schemas can validate sample values', () => {
    const tx = {
      id: 't1',
      userId: 'u1',
      accountId: 'a1',
      description: 'Test',
      amount: { amount: 1000, currency: 'USD' },
      direction: 'expense' as const,
      date: '2026-02-01',
      source: 'csv' as const,
    };

    expect(() => TransactionSchema.parse(tx)).not.toThrow();

    const n = {
      accountExternalId: 'a1',
      description: 'Test',
      amount: 1000,
      currency: 'USD',
      date: '2026-02-01',
    };

    expect(() => NormalizedTransactionInputSchema.parse(n)).not.toThrow();
  });
});
