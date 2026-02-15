import { Transaction } from '@clara/schemas';
import { db } from './client';
import { transactions } from './transactions.schema';

export async function saveTransactions(txList: Transaction[]): Promise<void> {
  if (!txList.length) return;
  await db.insert(transactions)
    .values(
      txList.map((tx) => ({
        id: tx.id,
        userId: tx.userId,
        accountId: tx.accountId,
        description: tx.description,
        amount: tx.amount.amount,
        currency: tx.amount.currency,
        direction: tx.direction,
        date: tx.date,
        postedAt: tx.postedAt,
        categoryId: tx.categoryId,
        categoryKey: tx.categoryKey,
        source: tx.source,
        metadata: tx.metadata,
      }))
    )
    .onConflictDoNothing();
}
