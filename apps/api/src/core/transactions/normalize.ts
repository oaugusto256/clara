import {
  NormalizedTransactionInputSchema,
  TransactionSchema,
  type NormalizedTransactionInput,
  type Transaction,
} from '@clara/schemas';
import { v4 as uuid } from 'uuid';

/**
 * Normalizes a normalized input payload into a canonical Transaction.
 * This function demonstrates using runtime schemas from `@clara/schemas`.
 */
export function normalizeInput(input: NormalizedTransactionInput): Transaction {
  // Validate incoming normalized input
  NormalizedTransactionInputSchema.parse(input);

  const tx: Transaction = {
    id: uuid(),
    userId: 'u1', // TODO: wire real user context
    accountId: input.accountExternalId ?? 'unknown',
    description: input.description,
    amount: { amount: Math.round(input.amount), currency: input.currency },
    direction: 'expense',
    date: input.date,
    source: 'csv',
  };

  try {
    TransactionSchema.parse(tx);
  } catch (err) {
    throw err;
  }

  return tx;
}
