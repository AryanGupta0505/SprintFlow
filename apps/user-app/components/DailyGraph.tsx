
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

import { CustomTooltip } from "./CustomTooltip";
import { ChevronIcon } from "./ChevronIcon";
import { useState } from "react";

type Mode = "sent" | "received" | "both";
type Source = "both" | "bank" | "p2p";

type DataType = {
  date: string;
  p2pSent: number;
  p2pReceived: number;
  bankSent: number;
  bankReceived: number;
};

export function DailyGraph({
  data,
  mode,
  setMode
}: {
  data: DataType[];
  mode: Mode;
  setMode: (val: Mode) => void;
}) {
  const [source, setSource] = useState<Source>("both");

  // Merge data based on source selection
  const filteredData = data.map((item) => {
    let sent = 0;
    let received = 0;

    if (source === "both") {
      sent = item.p2pSent + item.bankSent;
      received = item.p2pReceived + item.bankReceived;
    }

    if (source === "bank") {
      sent = item.bankSent;
      received = item.bankReceived;
    }

    if (source === "p2p") {
      sent = item.p2pSent;
      received = item.p2pReceived;
    }

    return {
      date: item.date,
      sent,
      received
    };
  });

  return (
    <div className="analytics-card p-10">

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          Daily Activity
        </h2>

        <div className="flex gap-4">

          {/* Mode Filter */}
          <div className="relative w-[150px]">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="appearance-none w-full bg-white px-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            >
              <option value="both">Both</option>
              <option value="sent">Sent</option>
              <option value="received">Received</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronIcon />
            </div>
          </div>

          {/* Source Filter */}
          <div className="relative w-[150px]">
            <select
              value={source}
              onChange={(e) =>
                setSource(e.target.value as Source)
              }
              className="appearance-none w-full bg-white px-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            >
              <option value="both">All</option>
              <option value="bank">Bank</option>
              <option value="p2p">P2P</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronIcon />
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {mode === "both" && <Legend />}

          {(mode === "both" || mode === "sent") && (
            <Line
              type="monotone"
              dataKey="sent"
              name="Sent"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
            />
          )}

          {(mode === "both" || mode === "received") && (
            <Line
              type="monotone"
              dataKey="received"
              name="Received"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
