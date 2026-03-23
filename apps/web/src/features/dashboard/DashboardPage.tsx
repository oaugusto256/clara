import DashboardLayout from "./DashboardLayout";
import CategoryPieChartContainer from "./components/CategoryPieChartContainer";
import TransactionsUploadTable from "./components/TransactionsUploadTable";
import { useTransactionsQuery } from "./queries/useTransactionsQuery";

/**
 * Main dashboard page entrypoint.
 */
export default function DashboardPage() {
  const { data, isLoading, isError } = useTransactionsQuery();

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-full">
        <div className="flex-2 flex flex-col min-h-0">
          <TransactionsUploadTable
            transactions={data ?? []}
            containerClassName="flex-1 flex flex-col min-h-0"
            tableScrollClassName="flex-1 overflow-y-auto min-h-0 max-h-full"
          />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="w-full min-h-0">
            <CategoryPieChartContainer transactions={data ?? []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
