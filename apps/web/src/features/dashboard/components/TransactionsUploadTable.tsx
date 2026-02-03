import api from "@/api";
import type { Transaction } from "@clara/schemas";
import { useMutation } from "@tanstack/react-query";
import React, { useRef, useState } from "react";

const TransactionsUploadTable = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importCsvMutation = useMutation({
    mutationFn: async (csvText: string) => {
      const res = await api.post("/import/csv", csvText, {
        headers: { "Content-Type": "text/csv" },
      });
      return res.data;
    },
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

  console.log(transactions)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
        />
      </div>
      <div className="overflow-x-auto shadow bg-gray-900 border border-gray-700 rounded-md">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Uploading and parsing CSV...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : (
          <table className="table-auto min-w-full text-sm text-left text-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-white">Date</th>
                <th className="px-6 py-4 font-semibold text-white">Description</th>
                <th className="px-6 py-4 font-semibold text-white">Amount</th>
                <th className="px-6 py-4 font-semibold text-white">Direction</th>
                <th className="px-6 py-4 font-semibold text-white">Currency</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No transactions loaded. Upload a CSV file.
                  </td>
                </tr>
              ) : (
                transactions.map((tx, i) => (
                  <tr key={i} className="border-t border-gray-800 last:border-b hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{tx.date}</td>
                    <td className="px-6 py-4">{tx.description}</td>
                    <td className="px-6 py-4 text-right">
                      {tx.amount && typeof tx.amount.amount === 'number' && typeof tx.amount.currency === 'string'
                        ? tx.amount.amount.toLocaleString(undefined, { style: 'currency', currency: tx.amount.currency })
                        : ''}
                    </td>
                    <td className="px-6 py-4">
                      {tx.direction}
                    </td>
                    <td className="px-6 py-4">
                      {tx.amount && typeof tx.amount.currency === 'string' ? tx.amount.currency : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TransactionsUploadTable;