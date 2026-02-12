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
import { db } from '../db/client';
import { keywordCategoryMap } from '../db/keywordCategoryMap.schema';
import { parseAmountString, parseDateString } from './utils/helpers';
import { detectDelimiter, normalizeHeaderName, parseCSVLine } from './utils/parserUtils';

export type ParseResult = {
  ok: NormalizedTransactionInput[];
  errors: { line: number; reason: string }[];
};

export async function getKeywordCategoryMap(): Promise<Record<string, string>> {
  const rows = await db.select().from(keywordCategoryMap);
  // Ensure deterministic ordering for substring-based categorization:
  // - Longer keywords first (more specific matches take precedence)
  // - Then lexicographically for stable tie-breaking
  rows.sort((a, b) => {
    const lengthDiff = b.keyword.length - a.keyword.length;
    if (lengthDiff !== 0) return lengthDiff;
    return a.keyword.localeCompare(b.keyword);
  });
  return Object.fromEntries(rows.map(row => [row.keyword, row.category]));
}

export async function saveKeywordCategory(keyword: string) {
  await db.insert(keywordCategoryMap).values({ keyword, category: 'other' }).onConflictDoNothing();
}


// Pure CSV parsing: returns transactions and unique keywords
export function parseCsvPure(raw: string): { transactions: SimpleTransaction[]; uniqueKeywords: string[]; errors: { line: number; reason: string }[] } {
  const lines = raw.trim().split(/\r?\n/);
  const errors: { line: number; reason: string }[] = [];
  if (lines.length === 0) return { transactions: [], uniqueKeywords: [], errors };

  const headerLine = lines[0];
  const delimiter = detectDelimiter(headerLine);
  const rawHeaders = parseCSVLine(headerLine, delimiter);
  const headerMap: Record<number, string> = {};
  rawHeaders.forEach((h, i) => {
    const n = normalizeHeaderName(h).replace(/[^a-z0-9]/g, '');
    if (known[n]) headerMap[i] = known[n];
  });
  const requiredKeys = ['date', 'description', 'amount'];
  const mappedKeys = new Set(Object.values(headerMap));
  const hasRequired = requiredKeys.every((k) => mappedKeys.has(k));
  if (!hasRequired) {
    errors.push({ line: 0, reason: 'Invalid header - missing required columns' });
    return { transactions: [], uniqueKeywords: [], errors };
  }
  const simpleTxs: SimpleTransaction[] = [];
  const keywordSet = new Set<string>();
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
      keywordSet.add(obj.description.toLowerCase());
    }
  }
  return { transactions: simpleTxs, uniqueKeywords: Array.from(keywordSet), errors };
}

// Main orchestrator: handles DB, categorization, and validation
export async function parseCsv(raw: string): Promise<ParseResult> {
  const { transactions, uniqueKeywords, errors } = parseCsvPure(raw);
  const result: ParseResult = { ok: [], errors: [...errors] };
  if (transactions.length === 0) return result;

  // Batch fetch keyword-category map
  let keywordCategoryMapDb = await getKeywordCategoryMap();
  // Save new keywords in batch
  const newKeywords = uniqueKeywords.filter(k => !(k in keywordCategoryMapDb));
  if (newKeywords.length) {
    await Promise.all(newKeywords.map(saveKeywordCategory));
    // Add to map for categorization
    for (const k of newKeywords) keywordCategoryMapDb[k] = 'other';
  }

  // Categorize
  const categorized = categorizeTransactions(transactions, keywordCategoryMapDb);
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
