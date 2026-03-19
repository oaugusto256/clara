
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionSchema } from '@clara/schemas';
import { readFileSync } from 'fs';
import { normalizeInput } from '../src/core/transactions/normalize';
import * as csvParserModule from '../src/infra/csv/csvParser';

// Avoid hitting the real database from CSV normalization tests.
beforeEach(() => {
  vi.spyOn(csvParserModule, 'getKeywordCategoryMap').mockResolvedValue({});
  vi.spyOn(csvParserModule, 'saveKeywordCategory').mockResolvedValue();
});

describe('api: csv parsing and normalization', () => {
  it('reports invalid rows', async () => {
    const csv = `accountExternalId,description,amount,currency,date
"a1",Coffee,not-a-number,BRL,2026-02-01
"a2",Lunch,1200,BRL,2026-02-01`;

    const res = await csvParserModule.parseCsv(csv);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.ok.length).toBe(1);
  });

  it('parses bank CSV variant (Data,Valor,Identificador,Descrição) and normalizes', async () => {
    const csv = readFileSync(new URL('./fixtures/bank-sample.csv', import.meta.url), 'utf-8');

    const res = await csvParserModule.parseCsv(csv);
    expect(res.errors.length).toBe(1);
    expect(res.ok.length).toBe(5);

    const rows = res.ok;

    expect(rows[0].amount).toBe(-140);
    expect(rows[1].description).toContain('Salário');
    expect(rows[2].amount).toBe(-45);
    expect(rows[3].amount).toBe(3.5);
    expect(rows[4].amount).toBe(1234.56);
    expect(rows.every((r) => r.currency === 'BRL')).toBe(true);
    expect(rows[0].date).toBe('2026-01-01');

    for (const row of rows) {
      if (row.amount < 0) {
        expect(() => normalizeInput(row as any)).toThrow('Negative expense values are not included in spending totals');
      } else {
        const tx = normalizeInput(row as any);
        expect(() => TransactionSchema.parse(tx)).not.toThrow();
      }
    }
  });

  it('parses semicolon-delimited bank CSV and normalizes', async () => {
    const csv = readFileSync(new URL('./fixtures/bank-sample-semicolon.csv', import.meta.url), 'utf-8');

    const res = await csvParserModule.parseCsv(csv);
    expect(res.errors.length).toBe(0);
    expect(res.ok.length).toBe(2);

    expect(res.ok[0].amount).toBe(1234.56);
    expect(res.ok[1].amount).toBe(-200.5);
    expect(res.ok[1].description).toContain('Pagamento; Taxas');

    for (const row of res.ok) {
      if (row.amount < 0) {
        expect(() => normalizeInput(row as any)).toThrow('Negative expense values are not included in spending totals');
      } else {
        expect(() => TransactionSchema.parse(normalizeInput(row as any))).not.toThrow();
      }
    }
  });

  it('parses english header variant and normalizes', async () => {
    const csv = readFileSync(new URL('./fixtures/bank-sample-english.csv', import.meta.url), 'utf-8');

    const res = await csvParserModule.parseCsv(csv);
    expect(res.errors.length).toBe(0);
    expect(res.ok.length).toBe(2);

    expect(res.ok[0].description).toContain('Coffee');
    expect(res.ok[0].amount).toBe(500);
    expect(res.ok[1].amount).toBe(-25.5);

    for (const row of res.ok) {
      if (row.amount < 0) {
        expect(() => normalizeInput(row as any)).toThrow('Negative expense values are not included in spending totals');
      } else {
        expect(() => TransactionSchema.parse(normalizeInput(row as any))).not.toThrow();
      }
    }
  });
});
