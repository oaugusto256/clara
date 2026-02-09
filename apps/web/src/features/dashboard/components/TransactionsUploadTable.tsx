
import type { Transaction } from "@clara/schemas";
import { Card } from "@clara/ui";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useRef, useState } from "react";
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

const columnHelper = createColumnHelper<Transaction>();

const columns = [
  columnHelper.accessor('date', {
    header: 'Date',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor(row => {
    // Defensive: return formatted string or empty
    if (row.amount && typeof row.amount.amount === 'number' && typeof row.amount.currency === 'string') {
      return row.amount.amount.toLocaleString(undefined, { style: 'currency', currency: row.amount.currency });
    }
    return '';
  }, {
    id: 'amount',
    header: 'Amount',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('categoryKey', {
    header: 'Category',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor(row => row.amount && typeof row.amount.currency === 'string' ? row.amount.currency : '', {
    id: 'currency',
    header: 'Currency',
    cell: info => info.getValue(),
  }),
];

const TransactionsUploadTable = ({ transactions, setTransactions, containerClassName = "", tableScrollClassName = "" }: TransactionsUploadTableProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

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

  // TanStack Table setup
  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: false,
  });

  // Virtualizer setup
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

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
      {/* Optional: Global filter input */}
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Filter transactions..."
          className="w-full max-w-xs px-3 py-2 rounded border border-primary bg-gray-900 text-white"
        />
      </div>
      {
        loading ? (
          <div className="p-8 text-center text-gray-400">Uploading and parsing CSV...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-500 inline-block">No transactions loaded. Upload a CSV file.</div>
        ) : (
          <div className="overflow-x-auto max-w-[calc(100vw-260px)] w-full">
            <div
              ref={tableContainerRef}
              className="overflow-y-auto max-h-[calc(100vh-260px)] w-full"
            >
              <table className="min-w-full w-full text-sm text-left text-white border border-primary shadow-lg table-fixed">
                <thead className="bg-gray-800 sticky top-0 z-20 text-white text-md font-semibold tracking-wide">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => {
                        let widthClass = "";
                        switch (header.column.id) {
                          case "date": widthClass = "w-24"; break;
                          case "description": widthClass = "w-64"; break;
                          case "amount": widthClass = "w-32"; break;
                          case "categoryKey": widthClass = "w-32"; break;
                          case "currency": widthClass = "w-24"; break;
                          default: widthClass = "";
                        }
                        return (
                          <th
                            key={header.id}
                            className={["p-2 border-1 cursor-pointer select-none", widthClass].join(" ")}
                            onClick={header.column.getCanSort() ? () => header.column.toggleSorting() : undefined}
                          >
                            {header.isPlaceholder ? null : header.column.columnDef.header}
                            {header.column.getCanSort() && (
                              <span className="ml-2 text-xs">
                                {header.column.getIsSorted() === 'asc' ? '▲' : header.column.getIsSorted() === 'desc' ? '▼' : ''}
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-gray-900">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-500 py-8">No transactions to display.</td>
                    </tr>
                  ) : (
                    <>
                      {/* Top spacer */}
                      {(() => {
                        const virtualItems = rowVirtualizer.getVirtualItems();
                        if (virtualItems.length === 0) return null;
                        const top = virtualItems[0].start;
                        return top > 0 ? (
                          <tr style={{ height: `${top}px` }} aria-hidden="true">
                            <td colSpan={5} style={{ padding: 0, border: 0 }}></td>
                          </tr>
                        ) : null;
                      })()}
                      {/* Rendered rows */}
                      {rowVirtualizer.getVirtualItems().map(virtualRow => {
                        const row = table.getRowModel().rows[virtualRow.index];
                        if (!row) return null;
                        return (
                          <tr
                            key={row.id}
                            className="border-t border-primary last:border-b hover:bg-primary/10 transition-colors w-full text-base font-medium"
                            style={{ height: `${virtualRow.size}px` }}
                          >
                            {row.getVisibleCells().map(cell => {
                              let widthClass = "";
                              let extraClass = "";
                              switch (cell.column.id) {
                                case "date": widthClass = "w-24"; break;
                                case "description": widthClass = "w-64"; break;
                                case "amount": widthClass = "w-32"; extraClass = "text-right"; break;
                                case "categoryKey": widthClass = "w-32"; break;
                                case "currency": widthClass = "w-24"; break;
                                default: widthClass = "";
                              }
                              return (
                                <td
                                  key={cell.id}
                                  className={["px-2 py-4 text-sm whitespace-nowrap", widthClass, extraClass].join(" ")}
                                >
                                  {cell.renderValue()}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      {/* Bottom spacer */}
                      {(() => {
                        const virtualItems = rowVirtualizer.getVirtualItems();
                        const totalSize = rowVirtualizer.getTotalSize();
                        if (virtualItems.length === 0) return null;
                        const last = virtualItems[virtualItems.length - 1];
                        const bottom = totalSize - (last.end ?? 0);
                        return bottom > 0 ? (
                          <tr style={{ height: `${bottom}px` }} aria-hidden="true">
                            <td colSpan={5} style={{ padding: 0, border: 0 }}></td>
                          </tr>
                        ) : null;
                      })()}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </Card >
  );
}

export default TransactionsUploadTable;