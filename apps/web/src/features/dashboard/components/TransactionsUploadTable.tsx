import React, { useRef, useState } from "react";

interface Transaction {
  date: string;
  description: string;
  amount: number;
  currency: string;
}

function parseCSV(csv: string): Transaction[] {
  const lines = csv.trim().split("\n");
  const [header, ...rows] = lines;
  return rows.map((row) => {
    const [date, description, amount, currency] = row.split(",");
    return {
      date: date.trim(),
      description: description.trim(),
      amount: parseFloat(amount),
      currency: currency.trim(),
    };
  });
}

const TransactionsUploadTable = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setTransactions(parseCSV(text));
    };
    reader.readAsText(file);
  }

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
        <table className="table-auto min-w-full text-sm text-left text-gray-200">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-white">Date</th>
              <th className="px-6 py-4 font-semibold text-white">Description</th>
              <th className="px-6 py-4 font-semibold text-white">Amount</th>
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
                  <td className="px-6 py-4 text-right">{tx.amount.toLocaleString(undefined, { style: 'currency', currency: tx.currency })}</td>
                  <td className="px-6 py-4">{tx.currency}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsUploadTable;