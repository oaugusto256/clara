import { describe, expect, it } from 'vitest';
import { normalizeInput } from '../src/normalize';

describe('api: normalizeInput', () => {
  it('converts normalized input to Transaction and validates with shared schemas', () => {
    const input = {
      accountExternalId: 'a1',
      description: 'Coffee',
      amount: 500,
      currency: 'BRL',
      date: '2026-02-01',
    };

    const tx = normalizeInput(input as any);
    expect(tx.id).toBeTruthy();
    expect(tx.accountId).toBe('a1');
    expect(tx.amount.amount).toBe(500);
  });
});
