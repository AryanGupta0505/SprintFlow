"use client";

import { useState, useMemo } from "react";
import { useNotifications } from "../../../components/NotificationProvider";
import NotificationItem from "../../../components/NotificationItem";

type DirectionFilter = "all" | "sent" | "received";
type TypeFilter = "all" | "p2p" | "bank";

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // safe local YYYY-MM-DD
}

function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (val: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 text-sm rounded-full transition ${
            value === opt.value
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function PushNotificationsPage() {
  const { notifications } = useNotifications();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("all");

  const [typeFilter, setTypeFilter] =
    useState<TypeFilter>("all");

  /* =========================
     QUICK DATE FILTERS
  ========================= */

  const applyToday = () => {
    const today = new Date();
    const local = formatDateLocal(today);
    setFromDate(local);
    setToDate(local);
  };

  const applyLast7Days = () => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 7);

    setFromDate(formatDateLocal(past));
    setToDate(formatDateLocal(today));
  };

  const applyThisMonth = () => {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);

    setFromDate(formatDateLocal(first));
    setToDate(formatDateLocal(today));
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setDirectionFilter("all");
    setTypeFilter("all");
  };

  /* =========================
     FILTER LOGIC
  ========================= */

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const created = new Date(n.createdAt);

      if (fromDate) {
        const from = new Date(fromDate + "T00:00:00");
        if (created < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate + "T23:59:59");
        if (created > to) return false;
      }

      if (typeFilter === "p2p") {
        if (
          n.event !== "PAYMENT_SENT" &&
          n.event !== "PAYMENT_RECEIVED"
        )
          return false;
      }

      if (typeFilter === "bank") {
        if (
          n.event !== "BANK_WITHDRAWAL_SUCCESS" &&
          n.event !== "BANK_DEPOSIT_SUCCESS"
        )
          return false;
      }

      if (directionFilter === "sent") {
        if (
          n.event !== "PAYMENT_SENT" &&
          n.event !== "BANK_DEPOSIT_SUCCESS"
        )
          return false;
      }

      if (directionFilter === "received") {
        if (
          n.event !== "PAYMENT_RECEIVED" &&
          n.event !== "BANK_WITHDRAWAL_SUCCESS"
        )
          return false;
      }

      return true;
    });
  }, [notifications, fromDate, toDate, directionFilter, typeFilter]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            All Notifications
          </h1>
          <p className="text-slate-500 mt-1">
            Manage and filter your activity history
          </p>
        </div>

        {/* FILTER CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm space-y-6">

          {/* DATE RANGE */}
          <div className="flex flex-wrap items-center gap-4">

            <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-xl">
              <div className="flex flex-col">
                <label className="text-xs text-slate-500">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-transparent text-sm outline-none"
                />
              </div>

              <div className="w-px h-8 bg-slate-300" />

              <div className="flex flex-col">
                <label className="text-xs text-slate-500">To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={applyToday}
                className="px-4 py-2 text-sm rounded-full bg-slate-200 hover:bg-slate-300 transition"
              >
                Today
              </button>

              <button
                onClick={applyLast7Days}
                className="px-4 py-2 text-sm rounded-full bg-slate-200 hover:bg-slate-300 transition"
              >
                Last 7 Days
              </button>

              <button
                onClick={applyThisMonth}
                className="px-4 py-2 text-sm rounded-full bg-slate-200 hover:bg-slate-300 transition"
              >
                This Month
              </button>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm rounded-full text-indigo-600 hover:bg-indigo-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* TOGGLES */}
          <div className="flex flex-wrap gap-8">

            <div>
              <p className="text-xs text-slate-500 mb-2">Direction</p>
              <ToggleGroup
                value={directionFilter}
                onChange={setDirectionFilter}
                options={[
                  { label: "All", value: "all" },
                  { label: "Sent", value: "sent" },
                  { label: "Received", value: "received" },
                ]}
              />
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-2">Type</p>
              <ToggleGroup
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { label: "All", value: "all" },
                  { label: "P2P", value: "p2p" },
                  { label: "Bank", value: "bank" },
                ]}
              />
            </div>

          </div>
        </div>

        {/* LIST */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              No notifications found
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}