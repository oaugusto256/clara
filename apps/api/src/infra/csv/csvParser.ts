import { NormalizedTransactionInputSchema, type NormalizedTransactionInput } from '@clara/schemas';

export type ParseResult = {
  ok: NormalizedTransactionInput[];
  errors: { line: number; reason: string }[];
};

/**
 * Very small CSV parser for the MVP: expects header row and columns:
 * accountExternalId,description,amount,currency,date
 */
export function parseCsv(raw: string): ParseResult {
  const lines = raw.trim().split(/\r?\n/);
  const result: ParseResult = { ok: [], errors: [] };

  if (lines.length === 0) return result;

  // Parse header robustly and map to canonical keys
  const headerLine = lines[0];

  function detectDelimiter(line: string) {
    const commaCount = (line.match(/,/g) || []).length;
    const semiCount = (line.match(/;/g) || []).length;
    return semiCount > commaCount ? ';' : ',';
  }

  function parseCSVLine(line: string, delimiter = ',') {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  }

  function normalizeHeaderName(s: string) {
    return s
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .trim();
  }

  const delimiter = detectDelimiter(headerLine);
  const rawHeaders = parseCSVLine(headerLine, delimiter);
  const headerMap: Record<number, string> = {};

  const known: Record<string, string> = {
    accountexternalid: 'accountExternalId',
    id: 'accountExternalId',
    identifier: 'accountExternalId',
    identificador: 'accountExternalId',
    amount: 'amount',
    valor: 'amount',
    value: 'amount',
    data: 'date',
    date: 'date',
    description: 'description',
    descricao: 'description',
    'descrição': 'description',
    details: 'description',
    detail: 'description',
    currency: 'currency',
  };

  rawHeaders.forEach((h, i) => {
    const n = normalizeHeaderName(h).replace(/[^a-z0-9]/g, '');
    if (known[n]) headerMap[i] = known[n];
  });

  // required keys
  const requiredKeys = ['accountExternalId', 'amount', 'date', 'description'];
  const hasRequired = requiredKeys.every((k) => Object.values(headerMap).includes(k));
  if (!hasRequired) {
    result.errors.push({ line: 0, reason: 'Invalid header - missing required columns' });
    return result;
  }

  // helpers
  function parseAmountString(v: string) {
    if (!v) return NaN;
    const s = v.replace(/[^0-9,.-]/g, '').trim();
    if (s === '') return NaN;
    const hasComma = s.indexOf(',') !== -1;
    const hasDot = s.indexOf('.') !== -1;
    let normalized = s;
    if (hasComma && hasDot) {
      // decide decimal separator by last occurrence
      if (s.lastIndexOf('.') > s.lastIndexOf(',')) {
        // dot is decimal, remove commas
        normalized = s.replace(/,/g, '');
      } else {
        // comma is decimal
        normalized = s.replace(/\./g, '').replace(/,/g, '.');
      }
    } else if (hasComma && !hasDot) {
      normalized = s.replace(/,/g, '.');
    } else {
      normalized = s;
    }
    return Number(normalized);
  }

  function parseDateString(v: string) {
    if (!v) return v;
    const trimmed = v.trim();
    // handle dd/mm/yyyy
    const m = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      const [_, dd, mm, yyyy] = m;
      const iso = `${yyyy.padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      return iso;
    }
    return trimmed;
  }

  for (let i = 1; i < lines.length; i++) {
    const ln = lines[i];
    if (!ln.trim()) continue;
    const cols = parseCSVLine(ln, delimiter);
    const obj: any = {};

    for (const [idx, key] of Object.entries(headerMap)) {
      const index = Number(idx);
      const raw = cols[index] ?? '';
      if (key === 'amount') obj.amount = parseAmountString(raw);
      else if (key === 'date') obj.date = parseDateString(raw);
      else obj[key] = raw;
    }

    // default currency if not provided
    if (!obj.currency) obj.currency = 'BRL';

    try {
      const parsed = NormalizedTransactionInputSchema.parse(obj);
      result.ok.push(parsed as NormalizedTransactionInput);
    } catch (err: any) {
      result.errors.push({ line: i + 1, reason: err?.message ?? 'validation failed' });
    }
  }

  return result;
}
