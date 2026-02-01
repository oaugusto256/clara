import { type NormalizedTransactionInput, type Transaction } from '@clara/schemas';
/**
 * Normalizes a normalized input payload into a canonical Transaction.
 * This function demonstrates using runtime schemas from `@clara/schemas`.
 */
export declare function normalizeInput(input: NormalizedTransactionInput): Transaction;
