
import type { Transaction } from "@clara/schemas";
import { Card } from "@clara/ui";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';
import React, { useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useImportCsvMutation } from "../queries/useImportCsvMutation";
import { CATEGORY_COLORS } from '../utils/categoryColors';

interface TransactionsUploadTableProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  containerClassName?: string;
  tableScrollClassName?: string;
}

const columnHelper = createColumnHelper<Transaction>();

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return format(d, 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
}

function formatAmount(amount: any, currency: string | undefined) {
  if (typeof amount !== 'number') return '';
  if (currency) {
    try {
      return amount.toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
    }
  }
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function formatCurrency(currency: string) {
  if (!currency) return '';
  return currency.toUpperCase();
}

function CategoryBadge({ categoryKey }: { categoryKey: string }) {
  const color = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.default;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase"
      style={{ backgroundColor: color }}
    >
      {categoryKey || 'Uncategorized'}
    </span>
  );
}

const columns = [
  columnHelper.accessor('date', {
    header: 'Date',
    cell: info => formatDate(info.getValue()),
    size: 110,
    minSize: 80,
    maxSize: 200,
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: info => info.getValue(),
    size: 220,
    minSize: 100,
    maxSize: 400,
  }),
  columnHelper.accessor(row => (
    row.amount && typeof row.amount.amount === 'number'
      ? row.amount.amount
      : null
  ), {
    id: 'amount',
    header: 'Amount',
    cell: info => {
      const original = info.row.original;
      const value = info.getValue();
      const currency =
        original.amount && typeof original.amount.currency === 'string'
          ? original.amount.currency
          : undefined;
      return (
        <span className="font-mono">
          {formatAmount(value, currency)}
        </span>
      );
    },
    size: 100,
    minSize: 80,
    maxSize: 200,
  }),
  columnHelper.accessor('categoryKey', {
    header: 'Category',
    cell: info => <CategoryBadge categoryKey={info.getValue() || ''} />,
    size: 120,
    minSize: 80,
    maxSize: 200,
  }),
  columnHelper.accessor(row => row.amount && typeof row.amount.currency === 'string' ? row.amount.currency : '', {
    id: 'currency',
    header: 'Currency',
    cell: info => (
      <span className="inline-block text-xs text-base-content text-right font-semibold w-full px-4">
        {formatCurrency(info.getValue())}
      </span>
    ),
    size: 80,
    minSize: 60,
    maxSize: 80,
  }),
];

const TransactionsUploadTable = ({ transactions, setTransactions }: TransactionsUploadTableProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnSizing, setColumnSizing] = useState({});
  const [columnSizingInfo, setColumnSizingInfo] = useState({});

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
      columnSizing,
      columnSizingInfo,
    },
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnSizingChange: setColumnSizing,
    onColumnSizingInfoChange: setColumnSizingInfo,
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
      <div className="flex flex-col gap-4">
        <h2 className="card-title text-base-content">All Transactions</h2>
        <div className="flex justify-between w-full gap-4">
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
              <FaSearch className="w-3 h-3 text-base-content/60" />
            </span>
            <input
              type="text"
              value={globalFilter}
              name="filter-transactions-input"
              placeholder="Filter transactions"
              aria-label="Filter transactions"
              onChange={e => setGlobalFilter(e.target.value)}
              className="input input-bordered input-primary w-full pl-8"
            />
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            name="import-csv-input"
            className="block relative file-input file-input-bordered file-input-primary text-sm"
          />
        </div>
        {loading ? (
          <div className="p-8 text-center text-base-content">Uploading and parsing CSV...</div>
        ) : error ? (
          <div className="p-8 text-center text-error">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-base-content inline-block">No transactions loaded. Upload a CSV file.</div>
        ) : (
          <div className="overflow-x-auto max-w-[calc(100vw-260px)] w-full">
            <div
              ref={tableContainerRef}
              className="overflow-y-auto max-h-[calc(100vh-260px)] w-full"
            >
              <table className="table table-zebra table-xs min-w-full w-full text-left border-x border-base-100 table-fixed">
                <thead className="bg-base-300 sticky top-0 z-20 text-base-content text-md font-semibold">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => {
                        const isSortable = header.column.getCanSort();
                        return (
                          <th
                            key={header.id}
                            className={["p-2 select-none bg-base-300 border border-base-100 sticky top-0 z-30 relative group"].join(" ")}
                            style={{ width: header.getSize() }}
                          >
                            {header.isPlaceholder ? null : (
                              isSortable ? (
                                <button
                                  type="button"
                                  className="inline-flex items-center w-full cursor-pointer text-left"
                                  onClick={() => header.column.toggleSorting()}
                                >
                                  {typeof header.column.columnDef.header === 'string'
                                    ? header.column.columnDef.header
                                    : ''}
                                  <span className="ml-2 text-xs">
                                    {header.column.getIsSorted() === 'asc'
                                      ? '▲'
                                      : header.column.getIsSorted() === 'desc'
                                        ? '▼'
                                        : ''}
                                  </span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center w-full">
                                  {typeof header.column.columnDef.header === 'string'
                                    ? header.column.columnDef.header
                                    : ''}
                                </span>
                              )
                            )}
                            {/* Resizer handle */}
                            {header.column.getCanResize() && (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={[
                                  "absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none z-50 bg-transparent group-hover:bg-primary/40 transition-colors",
                                  header.column.getIsResizing() ? "bg-primary" : ""
                                ].join(" ")}
                                style={{ userSelect: 'none', touchAction: 'none' }}
                              />
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-base-300">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-base-content py-8">No transactions to display.</td>
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
                            className="border-base-100 last:border-b hover:bg-primary/10 transition-colors w-full text-base font-medium"
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
                                  className={["px-2 py-2 text-sm whitespace-nowrap text-gray-300 font-light", widthClass, extraClass].join(" ")}
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
      </div>
    </Card>
  );
}

export default TransactionsUploadTable;