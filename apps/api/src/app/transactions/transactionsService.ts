import { fetchTransactions as fetchTransactionsDb } from '../../infra/db/transactions.crud';

export async function fetchTransactions() {
  return fetchTransactionsDb();
}
