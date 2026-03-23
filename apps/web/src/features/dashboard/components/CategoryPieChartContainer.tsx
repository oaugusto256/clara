import type { Transaction } from "@clara/schemas";
import { useMemo } from "react";
import { useCategoriesQuery } from "../queries/useCategoriesQuery";
import CategoryPieChart from "./CategoryPieChart";

interface CategoryPieChartContainerProps {
  transactions: Transaction[];
}

export function CategoryPieChartContainer({ transactions }: CategoryPieChartContainerProps) {
  const { data: categories = [] } = useCategoriesQuery();

  const colorByKey = useMemo(
    () => Object.fromEntries(categories.map(c => [c.key, c.color])),
    [categories]
  );

  const data = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.categoryKey && tx.direction === "expense") {
        totals[tx.categoryKey] = (totals[tx.categoryKey] || 0) + (tx.amount?.amount || 0);
      }
    }
    return Object.entries(totals).map(([categoryKey, total]) => ({
      categoryKey,
      total,
      color: colorByKey[categoryKey] ?? null,
    }));
  }, [transactions, colorByKey]);

  return <CategoryPieChart data={data} />;
}

export default CategoryPieChartContainer;
