
"use client";

import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip
} from "recharts";

import { CustomTooltip } from "./CustomTooltip";

type DataType = {
  category: string;
  amount: number;
};

const COLORS: Record<string, string> = {
  "P2P Sent": "#ef4444",        // red
  "P2P Received": "#10b981",    // emerald
  "Bank Deposits": "#6366f1",   // indigo
  "Wallet Topups": "#f59e0b"    // amber
};

// Custom outside label
const renderLabel = (props: any) => {
  const {
    cx,
    cy,
    midAngle,
    outerRadius,
    name
  } = props;

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 22;

  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={13}
      fontWeight={500}
    >
      {name}
    </text>
  );
};

export function CategoryPie({ data }: { data: DataType[] }) {
  const total = data.reduce((acc, curr) => acc + curr.amount, 0);

  const enhancedData = data.map((item) => ({
    ...item,
    fill: COLORS[item.category] || "#6b7280",
    percentage:
      total > 0
        ? ((item.amount / total) * 100).toFixed(1)
        : "0"
  }));

  return (
    <div className="analytics-card p-10">
      <h2 className="text-2xl font-semibold mb-8 text-gray-800">
        Category Breakdown
      </h2>

      <ResponsiveContainer width="100%" height={450}>
        <PieChart>
          <Pie
            data={enhancedData}
            dataKey="amount"
            nameKey="category"
            outerRadius={140}
            innerRadius={80}
            paddingAngle={3}
            labelLine
            label={renderLabel}
            isAnimationActive
          />
          <Tooltip
            content={<CustomTooltip />}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}