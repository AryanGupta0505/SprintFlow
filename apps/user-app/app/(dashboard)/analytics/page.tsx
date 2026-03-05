
"use client";

import { useEffect, useMemo, useState } from "react";
import { getAnalytics } from "../../lib/actions/getAnalytics";
import { DailyGraph } from "../../../components/DailyGraph";
import { SentVsReceived } from "../../../components/SentVsReceived";
import { CategoryPie } from "../../../components/CategoryPie";
import { MonthlySummary } from "../../../components/MonthlySummary";
import { ChevronIcon } from "../../../components/ChevronIcon";
import { SprintFlowLoader } from "../../../components/SprintFlowLoader";
type Mode = "sent" | "received" | "both";

export default function AnalyticsPage() {
  const now = new Date();
  const [mode, setMode] = useState<Mode>("both");
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        label: d.toLocaleString("default", {
          month: "long",
          year: "numeric"
        }),
        month: d.getMonth(),
        year: d.getFullYear()
      };
    });
  }, []);

  // 🔥 Initial Load
  useEffect(() => {
    async function initialFetch() {
      const res = await getAnalytics(month, year);
      setData(res);
      setLoading(false);
    }
    initialFetch();
  }, []);

  // 🔥 Month Change (Smooth Transition)
  useEffect(() => {
    if (!data) return;

    async function fetchNewMonth() {
      setTransitioning(true);

      const res = await getAnalytics(month, year);

      // Small delay for smoother fade effect
      setTimeout(() => {
        setData(res);
        setTransitioning(false);
      }, 200);
    }

    fetchNewMonth();
  }, [month, year]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#6a51a6] tracking-tight">
            Spending Analytics
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Track and analyze your financial activity month-wise
          </p>
        </div>

        <div className="relative w-[220px]">
          <select
            value={`${month}-${year}`}
            onChange={(e) => {
              const [m, y] = e.target.value.split("-");
              setMonth(Number(m));
              setYear(Number(y));
            }}
            className="appearance-none w-full bg-white px-5 py-2.5 rounded-2xl border border-gray-300 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 hover:border-purple-500 transition"
          >
            {monthOptions.map((option) => (
              <option
                key={`${option.month}-${option.year}`}
                value={`${option.month}-${option.year}`}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <ChevronIcon />
          </div>
        </div>
      </div>

      {loading ? (
        // <div className="text-center text-gray-500 py-20">
        //   Loading analytics...
        // </div>
        <SprintFlowLoader/>
      ) : (
        <div
          className={`
            space-y-12
            transition-opacity duration-300
            ${transitioning ? "opacity-60" : "opacity-100"}
          `}
        >
          <MonthlySummary total={data.monthlyTotal} />
          <DailyGraph
            data={data.dailyData}
            mode={mode}
            setMode={setMode}
          />
          <SentVsReceived data={data.sentVsReceivedData} />
          <CategoryPie data={data.categoryData} />
        </div>
      )}
    </div>
  );
}