
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";

import { CustomTooltip } from "./CustomTooltip";

type DataType = {
  type: string;
  amount: number;
};

export function SentVsReceived({
  data
}: {
  data: DataType[];
}) {

  const enhancedData = data.map((item) => ({
    ...item,
    fill:
      item.type === "Sent"
        ? "#ef4444"
        : "#10b981"
  }));

  return (
    <div
      className="analytics-card bg-white p-10 rounded-3xl shadow-lg outline-none"
    >
      <h2 className="text-2xl font-semibold mb-8 text-gray-800">
        Monthly Sent vs Received
      </h2>

      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={enhancedData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="amount"
            radius={[14, 14, 0, 0]}
            activeBar={false}   // 🔥 removes grey overlay
            isAnimationActive
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}