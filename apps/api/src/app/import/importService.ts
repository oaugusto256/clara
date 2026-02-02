import { normalizeInput } from '../../core/transactions/normalize';
import { parseCsv, type ParseResult } from '../../infra/csv/csvParser';

export type ImportResult = {
  parsed: ParseResult['ok'];
  normalized: any[];
  errors: { line: number; reason: string }[];
};

export function importCsv(csv: string): ImportResult {
  const parsed = parseCsv(csv);

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

  return { parsed: parsed.ok, normalized, errors: parsed.errors.concat(normalizationErrors) };
}
