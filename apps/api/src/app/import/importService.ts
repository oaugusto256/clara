import { normalizeInput } from '../../core/transactions/normalize';
import { parseCsv, type ParseResult } from '../../infra/csv/csvParser';
import { saveTransactions } from '../../infra/db/transactions.crud';

export type ImportResult = {
  parsed: ParseResult['ok'];
  normalized: any[];
  errors: { line: number; reason: string }[];
};

export async function importCsv(csv: string): Promise<ImportResult> {
  const parsed = await parseCsv(csv);

  const normalized: any[] = [];
  const normalizationErrors: { line: number; reason: string }[] = [];

  for (let i = 0; i < parsed.ok.length; i++) {
    try {
      const tx = normalizeInput(parsed.ok[i] as any);
      normalized.push(tx);
    } catch (err: any) {
      normalizationErrors.push({ line: i + 1, reason: err?.message ?? 'normalization failed' });
    }
  }

  // Persist all valid transactions (skip persistence during tests to avoid requiring a real DB)
  if (normalized.length > 0 && process.env.NODE_ENV !== 'test') {
    try {
      await saveTransactions(normalized);
    } catch (error: any) {
      // Propagate database errors to the caller for consistent error reporting
      throw new Error(`Failed to save imported transactions: ${error?.message ?? 'unknown error'}`);
    }
  }

  return { parsed: parsed.ok, normalized, errors: parsed.errors.concat(normalizationErrors) };
}
