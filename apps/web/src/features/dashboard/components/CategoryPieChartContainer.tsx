import type { Transaction } from "@clara/schemas";
import { useMemo } from "react";
import CategoryPieChart from "./CategoryPieChart";

interface CategoryPieChartContainerProps {
  transactions: Transaction[];
}

export function CategoryPieChartContainer({ transactions }: CategoryPieChartContainerProps) {
  console.log(transactions)

  // Aggregate totals by categoryKey
  const data = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.categoryKey && tx.direction === "expense") {
        totals[tx.categoryKey] = (totals[tx.categoryKey] || 0) + (tx.amount?.amount || 0);
      }
    }
    return Object.entries(totals).map(([categoryKey, total]) => ({ categoryKey, total }));
  }, [transactions]);

  return <CategoryPieChart data={data} />;
}

export default CategoryPieChartContainer;
