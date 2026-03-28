
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@repo/ui/card";

const ONE_MINUTE = 60;
const PAGE_SIZE = 10;

export function P2PTransactions({
  transactions,
  userId
}: {
  transactions: any[];
  userId: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [typeFilter, setTypeFilter] =
    useState<"All" | "Sent" | "Received">("All");

  const [statusFilter, setStatusFilter] = useState<
    null | "Success" | "Processing" | "Failure"
  >(null);

  const [now, setNow] = useState(Date.now());

  // ✅ Pagination state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* =========================
     REFRESH WHEN RETURNED
  ========================= */
  useEffect(() => {
    const refresh = searchParams.get("refresh");
    if (refresh) {
      router.replace("/p2p"); // remove param
    router.refresh();      // fetch fresh data
    }
  }, [searchParams, router]);
  
useEffect(() => {
  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      router.refresh(); // 🔥 fixes back button stale data
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, [router]);
  /* =========================
     LIVE CLOCK
  ========================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* =========================
     AUTO REFRESH WHEN EXPIRED
  ========================= */
  useEffect(() => {
    const expired = transactions.some((t) => {
      if (t.status !== "Processing") return false;
      const start = new Date(t.timestamp).getTime();
      return Date.now() - start > ONE_MINUTE * 1000;
    });

    if (expired) {
      router.refresh();
    }
  }, [now, transactions, router]);

  /* =========================
     FILTERING
  ========================= */
  const filteredTransactions = transactions.filter((t) => {
    const isSender = Number(t.fromUserId) === Number(userId);

    if (typeFilter === "Sent" && !isSender) return false;
    if (typeFilter === "Received" && isSender) return false;
    if (statusFilter && t.status !== statusFilter) return false;

    return true;
  });

  const paginatedTransactions = filteredTransactions.slice(0, visibleCount);

  const showViewMore =
    visibleCount === PAGE_SIZE &&
    filteredTransactions.length > PAGE_SIZE;

  const showViewAll =
    visibleCount === PAGE_SIZE * 2 &&
    filteredTransactions.length > PAGE_SIZE * 2;

  return (
    <div className="w-full max-w-xl">
      <Card title="P2P Transactions">

        {/* TYPE FILTER */}
        <div className="flex gap-2 pt-4">
          {["All", "Sent", "Received"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setTypeFilter(tab as any);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`px-3 py-1 rounded-full text-sm transition ${
                typeFilter === tab
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* STATUS FILTER */}
        <div className="flex gap-2 pt-3">
          {["Success", "Processing", "Failure"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(statusFilter === tab ? null : (tab as any));
                setVisibleCount(PAGE_SIZE);
              }}
              className={`px-3 py-1 rounded-full text-xs transition ${
                statusFilter === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 pt-5">

            {/* TRANSACTION LIST */}
            {/* {paginatedTransactions.map((t) => {
              const isSender = Number(t.fromUserId) === Number(userId);

              let remainingTime = 0;

              if (t.status === "Processing") {
                const start = new Date(t.timestamp).getTime();
                const diff = Math.floor(
                  (start + ONE_MINUTE * 1000 - now) / 1000
                );
                remainingTime = diff > 0 ? diff : 0;
              } */}
            {paginatedTransactions.map((t) => {
  const isSender = Number(t.fromUserId) === Number(userId);

  const start = new Date(t.timestamp).getTime();
  const diff = now - start;

  const isExpired =
    t.status === "Processing" &&
    diff >= ONE_MINUTE * 1000;

  const displayStatus = isExpired ? "Failure" : t.status;

  let remainingTime = 0;

  if (displayStatus === "Processing") {
    const remaining = Math.floor(
      (start + ONE_MINUTE * 1000 - now) / 1000
    );
    remainingTime = remaining > 0 ? remaining : 0;
  }
              return (
                <div
                  key={t.id}
                  className="flex justify-between items-center border rounded-lg p-4 hover:shadow-sm transition"
                >
                  <div>
                    <div
                      className={`flex items-center gap-2 font-semibold ${
                        isSender ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      <span className="text-lg">
                        {isSender ? "↗" : "↘"}
                      </span>
                      ₹ {t.amount / 100}
                    </div>

                    <div className="text-sm text-gray-500">
                      {isSender
                        ? `Sent to ${t.toUser.number}`
                        : `Received from ${t.fromUser.number}`}
                    </div>

                    <div className="text-xs text-gray-400">
                      {new Date(t.timestamp).toLocaleString()}
                    </div>

                    {displayStatus === "Processing" && remainingTime > 0 && (
                      <div className="text-xs text-orange-500 mt-1">
                        Expires in {remainingTime}s
                      </div>
                    )}

                    {displayStatus === "Processing" && remainingTime === 0 && (
                      <div className="text-xs text-red-500 mt-1">
                        Expired
                      </div>
                    )}
                  </div>

                  <div
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
  displayStatus === "Success"
    ? "bg-green-100 text-green-600"
    : displayStatus === "Processing"
    ? "bg-yellow-100 text-yellow-600"
    : "bg-red-100 text-red-600"
}`}
                  >
                    {displayStatus}
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
        )}
      </Card>
    </div>
  );
}