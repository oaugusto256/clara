
import type { Transaction } from "@clara/schemas";
import { Card } from "@clara/ui";
import React, { useState } from "react";
import { useImportCsvMutation } from "../queries/useImportCsvMutation";


interface TransactionsUploadTableProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}


interface TransactionsUploadTableProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  containerClassName?: string;
  tableScrollClassName?: string;
}

const TransactionsUploadTable = ({ transactions, setTransactions, containerClassName = "", tableScrollClassName = "" }: TransactionsUploadTableProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importCsvMutation = useImportCsvMutation({
    onSuccess: (data) => {
      setTransactions(data.normalized || []);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error || err.message || "Failed to import CSV");
      setTransactions([]);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      importCsvMutation.mutate(text);
    };

    reader.readAsText(file);
  }

  return (
    <Card>
      <div className="flex justify-between w-full gap-4 mb-6">
        <h2 className="text-lg font-semibold text-white">All Transactions</h2>
        <label className="block relative w-full max-w-xs">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-200 rounded-lg border border-primary bg-gray-900 pr-4 pl-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-primary file:hidden cursor-pointer transition-colors duration-150"
            style={{ paddingRight: '7rem' }}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white rounded px-4 py-1 text-sm font-semibold pointer-events-none select-none shadow">Choose File</span>
        </label>
      </div>
      {loading ? (
        <div className="p-8 text-center text-gray-400">Uploading and parsing CSV...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-400">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center text-gray-500 inline-block">No transactions loaded. Upload a CSV file.</div>
      ) : (
        <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 210px)' }}>
          <table className="table-auto min-w-full text-sm text-left text-gray-200">
            <thead className="bg-gray-600 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold text-white">Date</th>
                <th className="px-6 py-4 font-semibold text-white">Description</th>
                <th className="px-6 py-4 font-semibold text-white">Amount</th>
                <th className="px-6 py-4 font-semibold text-white">Category</th>
                <th className="px-6 py-4 font-semibold text-white">Currency</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i} className="border-t border-gray-800 last:border-b hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{tx.date}</td>
                  <td className="px-6 py-4">{tx.description}</td>
                  <td className="px-6 py-4 text-right">
                    {tx.amount && typeof tx.amount.amount === 'number' && typeof tx.amount.currency === 'string'
                      ? tx.amount.amount.toLocaleString(undefined, { style: 'currency', currency: tx.amount.currency })
                      : ''}
                  </td>
                  <td className="px-6 py-4">
                    {tx.categoryKey}
                  </td>
                  <td className="px-6 py-4">
                    {tx.amount && typeof tx.amount.currency === 'string' ? tx.amount.currency : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default TransactionsUploadTable;