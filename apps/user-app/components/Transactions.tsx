
"use client";

import { useState, useEffect } from "react";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useRouter } from "next/navigation";

type TransactionType = "onramp" | "offramp";
type FilterType = "all" | "onramp" | "offramp";
type StatusFilter = "all" | "Success" | "Processing" | "Failure";

const PAGE_SIZE = 10;

export const Transactions = ({
  transactions
}: {
  transactions: {
    time: Date;
    amount: number;
    status: string;
    provider: string;
    type: TransactionType;
  }[];
}) => {
  const router = useRouter();

  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [now, setNow] = useState(Date.now());

  // ✅ Pagination state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* ===========================
     GLOBAL TIMER
  =========================== */
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ===========================
     AUTO REFRESH WHEN EXPIRED
  =========================== */
  // useEffect(() => {
  //   const hasExpired = transactions.some((t) => {
  //     if (t.status !== "Processing") return false;

  //     const startTime = new Date(t.time).getTime();
  //     const diff = now - startTime;

  //     return diff >= 60 * 1000;
  //   });

  //   if (hasExpired) {
  //     router.refresh();
  //   }
  // }, [now, transactions, router]);

  /* ===========================
     FILTERING
  =========================== */
  const filteredTransactions = transactions.filter((t) => {
    const matchesType =
      typeFilter === "all" || t.type === typeFilter;

    const matchesStatus =
      statusFilter === "all" || t.status === statusFilter;

    return matchesType && matchesStatus;
  });

  // ✅ Apply pagination
  const paginatedTransactions = filteredTransactions.slice(0, visibleCount);

  const showViewMore =
    visibleCount === PAGE_SIZE &&
    filteredTransactions.length > PAGE_SIZE;

  const showViewAll =
    visibleCount === PAGE_SIZE * 2 &&
    filteredTransactions.length > PAGE_SIZE * 2;

  return (
    <Card title="Recent Transactions">
      <div className="p-4">

        {/* FILTERS */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <Select
            value={typeFilter}
            onSelect={(value) => {
              setTypeFilter(value as FilterType);
              setVisibleCount(PAGE_SIZE);
            }}
            options={[
              { key: "All Types", value: "all" },
              { key: "Received", value: "onramp" },
              { key: "Sent", value: "offramp" }
            ]}
          />

          <Select
            value={statusFilter}
            onSelect={(value) => {
              setStatusFilter(value as StatusFilter);
              setVisibleCount(PAGE_SIZE);
            }}
            options={[
              { key: "All Status", value: "all" },
              { key: "Success", value: "Success" },
              { key: "Processing", value: "Processing" },
              { key: "Failure", value: "Failure" }
            ]}
          />
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No Transactions Found
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <div className="space-y-4 pr-4">

              {/* {paginatedTransactions.map((t, index) => {
                const isOnRamp = t.type === "onramp";
                const startTime = new Date(t.time).getTime();
                const diff = now - startTime;
                const remaining = 60 - Math.floor(diff / 1000); */}
              {paginatedTransactions.map((t, index) => {
  const isOnRamp = t.type === "onramp";
  const startTime = new Date(t.time).getTime();
  const diff = now - startTime;

  const isExpired =
    t.status === "Processing" &&
    diff >= 60 * 1000;

  const displayStatus = isExpired ? "Failure" : t.status;

  const remaining = Math.max(0, 60 - Math.floor(diff / 1000));
                // const statusColor =
                //   t.status === "Success"
                //     ? "bg-green-100 text-green-700"
                //     : t.status === "Processing"
                //     ? "bg-yellow-100 text-yellow-700"
                //     : "bg-red-100 text-red-700";
                const statusColor =
  displayStatus === "Success"
    ? "bg-green-100 text-green-700"
    : displayStatus === "Processing"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-700";
                return (
                  <div
                    key={`${t.provider}-${t.time}-${index}`}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {isOnRamp
                          ? `Received INR via ${t.provider}`
                          : `Sent INR via ${t.provider}`}
                      </div>

                      <div className="text-slate-500 text-xs">
                        {new Date(t.time).toDateString()}
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                        >
                          {/* {t.status} */}
                          {displayStatus}
                        </span>

                        {displayStatus === "Processing" && remaining > 0 && (
                          <span className="text-xs text-yellow-600 font-medium">
                            ⏳ {remaining}s
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`text-lg font-semibold ${
                        isOnRamp ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isOnRamp ? "+" : "-"} ₹ {t.amount / 100}
                    </div>
                  </div>
                );
              })}

              {/* ✅ PAGINATION BUTTONS */}
              <div className="flex justify-center pt-4">
                {showViewMore && (
                  <button
                    onClick={() => setVisibleCount(PAGE_SIZE * 2)}
                    className="text-sm px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                  >
                    View More
                  </button>
                )}

                {showViewAll && (
                  <button
                    onClick={() => router.push("/transactions")}
                    className="text-sm px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                  >
                    View All
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </Card>
  );
};