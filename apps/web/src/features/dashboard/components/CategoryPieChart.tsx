// CategoryPieChart.tsx
// Pie chart for spending by category
import { Card } from "@clara/ui";
import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
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
  "#14b8a6", // teal
  "#f472b6", // pink
  "#facc15", // gold
  "#0ea5e9", // sky
  "#f87171", // light red
  "#8b5cf6", // deep violet
  "#22d3ee", // cyan
  "#fbbf24", // amber
  "#4ade80", // light green
  "#c026d3", // magenta
  "#fcd34d", // light yellow
  "#7c3aed", // purple blue
  "#a3e635", // lime
  "#fca5a5", // rose
  "#38bdf8", // blue sky
  "#fda4af", // rose pink
  "#fde68a", // pale yellow
  "#818cf8", // periwinkle
  "#f9a8d4", // light pink
  "#bef264", // light lime
  "#fef08a", // pale gold
];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  // Custom label for slices > 3% with consistent typography and color
  const renderLabel = (props: any) => {
    const { name, percent, cx, cy, midAngle, outerRadius, index } = props;
    if (percent === undefined || percent * 100 <= 3) return null;

    const RADIAN = Math.PI / 180;
    // Increase the radius offset to move label further from the arc and label line
    const radius = outerRadius + 28; // was 12, now 28 for more distance
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const color = COLORS[index % COLORS.length];

    // Capitalize first letter of name safely
    let labelName = name;
    if (typeof name === 'string' && name.length > 0) {
      labelName = name.charAt(0).toUpperCase() + name.slice(1);
    }

    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
        fill={color}
        fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
      >
        {labelName}: {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  // Custom labelLine: only render for >3% slices
  const renderLabelLine = (props: any) => {
    const { percent, points } = props;
    if (percent === undefined || percent * 100 <= 3) return null;
    // Default line rendering
    return (
      <polyline
        points={points.map((p: any) => `${p.x},${p.y}`).join(' ')}
        stroke="#a3a3a3"
        strokeWidth={1.5}
        fill="none"
      />
    );
  };

  // Custom tooltip
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const { name, value, payload: entry } = payload[0];
      // Calculate percent from value and total
      const percent = total > 0 ? (value / total) * 100 : 0;

      // Capitalize first letter of name safely
      let labelName = name;
      if (typeof name === 'string' && name.length > 0) {
        labelName = name.charAt(0).toUpperCase() + name.slice(1);
      }
      return (
        <div style={{
          background: '#18181b',
          color: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px #0003',
          padding: '8px',
          fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
          fontSize: 14,
          minWidth: 120
        }}>
          <div style={{ fontWeight: 500, fontSize: 12, marginBottom: 2 }}>{labelName}</div>
          <div style={{ color: '#a3e635', fontSize: 12, fontWeight: 700 }}>{value.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}</div>
          <div style={{ color: '#cbd5e1', fontSize: 12 }}>{percent.toFixed(1)}%</div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="flex flex-col gap-2">
        <h2 className="card-title text-base-content" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 700 }}>Spending by Category</h2>
        {data.length === 0 ? (
          <div className="text-base-content text-sm">No data to display.</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={420}>
              <PieChart width={360} height={420}>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="categoryKey"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  label={renderLabel}
                  labelLine={renderLabelLine}
                >
                  {data.map((entry, idx) => (
                    <Cell key={`cell-${entry.categoryKey}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                  <Label
                    position="center"
                    content={props => {
                      const xPos = props.viewBox.x + props.viewBox.width / 2;
                      const yPos = props.viewBox.y + props.viewBox.height / 2;

                      return (
                        <>
                          <text
                            x={xPos}
                            y={yPos - 4}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={18}
                            fontWeight={700}
                            fill="#fff"
                            fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
                          >
                            {total.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}
                          </text>
                          <text
                            x={xPos}
                            y={yPos + 16}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={12}
                            fill="#a3a3a3"
                            fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
                          >
                            Total
                          </text>
                        </>
                      );
                    }}
                  />
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend
                  wrapperStyle={{
                    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                    fontSize: 14,
                    fontWeight: 500,
                    marginTop: 12
                  }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </Card>
  );
}

export default CategoryPieChart;
