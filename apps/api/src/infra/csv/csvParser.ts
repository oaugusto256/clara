// Canonical header aliases for CSV parsing
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
  // All possible aliases for description
  title: 'description',
  description: 'description',
  descricao: 'description',
  'descrição': 'description',
  details: 'description',
  detail: 'description',
  currency: 'currency',
};
import { categorizeTransactions, SimpleTransaction } from '@clara/rules-engine';
import { NormalizedTransactionInputSchema, type NormalizedTransactionInput } from '@clara/schemas';
import { parseAmountString, parseDateString } from './utils/helpers';
import { detectDelimiter, normalizeHeaderName, parseCSVLine } from './utils/parserUtils';
import { db } from '../db/client';
import { keywordCategoryMap } from '../db/keywordCategoryMap.schema';

export type ParseResult = {
  ok: NormalizedTransactionInput[];
  errors: { line: number; reason: string }[];
};

async function getKeywordCategoryMap(): Promise<Record<string, string>> {
  const rows = await db.select().from(keywordCategoryMap);
  return Object.fromEntries(rows.map(row => [row.keyword, row.category]));
}

async function saveKeywordCategory(keyword: string) {
  await db.insert(keywordCategoryMap).values({ keyword, category: 'other' }).onConflictDoNothing();
}

export async function parseCsv(raw: string): Promise<ParseResult> {
  const lines = raw.trim().split(/\r?\n/);
  const result: ParseResult = { ok: [], errors: [] };

  if (lines.length === 0) return result;

  // Parse header robustly and map to canonical keys
  const headerLine = lines[0];
  const delimiter = detectDelimiter(headerLine);
  const rawHeaders = parseCSVLine(headerLine, delimiter);
  const headerMap: Record<number, string> = {}

  rawHeaders.forEach((h, i) => {
    const n = normalizeHeaderName(h).replace(/[^a-z0-9]/g, '');
    if (known[n]) headerMap[i] = known[n];
  });

  // Require only canonical keys after mapping
  const requiredKeys = ['date', 'description', 'amount'];
  const mappedKeys = new Set(Object.values(headerMap));
  const hasRequired = requiredKeys.every((k) => mappedKeys.has(k));
  if (!hasRequired) {
    result.errors.push({ line: 0, reason: 'Invalid header - missing required columns' });
    return result;
  }

  const simpleTxs: SimpleTransaction[] = [];
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

    if (!obj.currency) obj.currency = 'BRL';
    if (obj.date && obj.description && typeof obj.amount === 'number') {
      simpleTxs.push({
        date: obj.date,
        title: obj.description,
        amount: obj.amount,
      });
    }
  }

  // Fetch and update keyword-category map
  let keywordCategoryMapDb = await getKeywordCategoryMap();
  for (const tx of simpleTxs) {
    const keyword = tx.title.toLowerCase();
    if (!keywordCategoryMapDb[keyword]) {
      await saveKeywordCategory(keyword);
      keywordCategoryMapDb[keyword] = 'other';
    }
  }

  // Categorize transactions
  const categorized = categorizeTransactions(simpleTxs, keywordCategoryMapDb);

  for (const tx of categorized) {
    const obj = {
      date: tx.date,
      description: tx.title,
      amount: tx.amount,
      currency: 'BRL',
      categoryKey: tx.categoryKey,
    };
    try {
      const parsed = NormalizedTransactionInputSchema.parse(obj);
      result.ok.push(parsed as NormalizedTransactionInput);
    } catch (err: any) {
      result.errors.push({ reason: err?.message ?? 'validation failed', line: 0 });
    }
  }

  return result;
}
