import DashboardLayout from "./DashboardLayout";
import TransactionsUploadTable from "./components/TransactionsUploadTable";

/**
 * Main dashboard page entrypoint.
 * Add widgets/components to the layout as they are implemented.
 */
export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Add summary, charts, etc. here as they are built */}
      <TransactionsUploadTable />
      {/* Example: <RecommendationsSummary /> <CategoryPieChart /> <MonthlyEvolutionChart /> */}
    </DashboardLayout>
  );
}
