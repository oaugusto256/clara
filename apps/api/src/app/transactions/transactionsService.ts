import { fetchTransactions as fetchTransactionsDb, updateTransactionCategoryKey } from '../../infra/db/transactions.crud';

export async function fetchTransactions() {
  return fetchTransactionsDb();
}

export async function updateTransactionCategory(id: string, categoryKey: string) {
  return updateTransactionCategoryKey(id, categoryKey);
}
