// CategoryPieChart.tsx
// Pie chart for spending by category
import { Card } from "@clara/ui";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface CategoryTotal {
  categoryKey: string;
  total: number;
}

interface CategoryPieChartProps {
  data: CategoryTotal[];
}

const COLORS = [
  "#6366f1", // indigo
  "#f59e42", // orange
  "#10b981", // green
  "#f43f5e", // red
  "#eab308", // yellow
  "#3b82f6", // blue
  "#a21caf", // purple
  "#64748b", // slate
  "#6d28d9", // violet
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  return (
    <Card>
      <div className="flex flex-col gap-2">
        <h2 className="card-title text-base-content">Spending by Category</h2>
        {data.length === 0 ? (
          <div className="text-base-content text-sm">No data to display.</div>
        ) : (
          <>
            {total > 0 && (
              <div className="text-sm text-gray-400">Total: <span className="text-md font-bold text-gray-200">{total.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}</span></div>
            )}
            <ResponsiveContainer width="100%" height={320}>
              <PieChart width={320} height={320}>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="categoryKey"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, percent }) =>
                    `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
                  }
                >
                  {data.map((entry, idx) => (
                    <Cell key={`cell-${entry.categoryKey}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    typeof value === 'number'
                      ? value.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })
                      : ''
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </Card>
  );
}

export default CategoryPieChart;
