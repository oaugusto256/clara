
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
        <div className="overflow-x-auto max-w-[calc(100vw-260px)] w-full">
          <table className="min-w-full w-full text-sm text-left text-white border border-primary shadow-lg table-fixed">
            <thead className="bg-gray-800 sticky top-0 z-20 text-white text-md font-semibold tracking-wide">
              <tr>
                <th className="p-2 w-24 border-1">Date</th>
                <th className="p-2 w-64 border-1">Description</th>
                <th className="p-2 w-32 border-1">Amount</th>
                <th className="p-2 w-32 border-1">Category</th>
                <th className="p-2 w-24 border-1">Currency</th>
              </tr>
            </thead>
          </table>
          <div className="overflow-y-auto max-h-[calc(100vh-260px)] w-full">
            <table className="min-w-full w-full text-sm text-left text-white table-fixed">
              <tbody className="bg-gray-900">
                {transactions.map((tx, i) => (
                  <tr key={i} className="border-t border-primary last:border-b hover:bg-primary/10 transition-colors w-full text-base font-medium">
                    <td className="px-2 py-4 text-sm whitespace-nowrap w-24">{tx.date}</td>
                    <td className="px-2 py-4 text-sm w-64">{tx.description}</td>
                    <td className="px-2 py-4 text-sm text-right w-32">
                      {tx.amount && typeof tx.amount.amount === 'number' && typeof tx.amount.currency === 'string'
                        ? tx.amount.amount.toLocaleString(undefined, { style: 'currency', currency: tx.amount.currency })
                        : ''}
                    </td>
                    <td className="px-2 py-4 text-sm w-32">{tx.categoryKey}</td>
                    <td className="px-2 py-4 text-sm w-24">{tx.amount && typeof tx.amount.currency === 'string' ? tx.amount.currency : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}

export default TransactionsUploadTable;