import { describe, it, expect } from 'vitest';
import { parseCsvPure } from '../src/infra/csv/csvParser';

// Unit test for pure CSV parsing (no DB, no side effects)
describe('parseCsvPure', () => {
  it('parses a valid CSV and extracts transactions and keywords', () => {
    const csv = `accountExternalId,description,amount,currency,date\n"a1",Coffee,500,BRL,2026-02-01\n"a2",Lunch,1200,BRL,2026-02-02`;
    const { transactions, uniqueKeywords, errors } = parseCsvPure(csv);
    expect(errors.length).toBe(0);
    expect(transactions.length).toBe(2);
    expect(transactions[0].title).toBe('Coffee');
    expect(transactions[1].title).toBe('Lunch');
    expect(uniqueKeywords).toContain('coffee');
    expect(uniqueKeywords).toContain('lunch');
  });

  it('returns error for missing required columns', () => {
    const csv = `foo,bar\n1,2`;
    const { transactions, uniqueKeywords, errors } = parseCsvPure(csv);
    expect(transactions.length).toBe(0);
    expect(errors.length).toBeGreaterThan(0);
  });
});
