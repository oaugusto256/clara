import type { Transaction } from "@clara/schemas";
import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import CategoryPieChartContainer from "./components/CategoryPieChartContainer";
import TransactionsUploadTable from "./components/TransactionsUploadTable";

/**
 * Main dashboard page entrypoint.
 * Add widgets/components to the layout as they are implemented.
 */
export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-4 mb-8 w-full min-h-0" style={{ height: 'calc(100vh - 5rem)' }}>
        <div className="flex-2 flex flex-col min-h-0">
          <TransactionsUploadTable
            transactions={transactions}
            setTransactions={setTransactions}
            containerClassName="flex-1 flex flex-col min-h-0"
            tableScrollClassName="flex-1 overflow-y-auto min-h-0 max-h-full"
          />
        </div>
        <div className="flex-1 flex flex-col items-center min-h-0">
          <div className="w-full min-h-0">
            <CategoryPieChartContainer transactions={transactions} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
