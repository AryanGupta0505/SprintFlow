

"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card } from "@repo/ui/card";
import { useBalance } from "./BalanceProvider";

export const BalanceCard = ({
  autoEnabled,
  autoLimit
}: {
  autoEnabled: boolean;
  autoLimit: number | null;
}) => {

  const { amount, locked } = useBalance();

  const [input, setInput] = useState("");
  const [limitInput, setLimitInput] = useState(
    autoLimit ? (autoLimit / 100).toString() : ""
  );
  const [loading, setLoading] = useState(false);
  const [showLimitEditor, setShowLimitEditor] = useState(false);

  /* ================= BALANCE CALC ================= */

  const total = (amount + locked) / 100;
  const unlocked = amount / 100;
  const lockedAmount = locked / 100;

  const reservePercent =
    total > 0 ? Math.min((lockedAmount / total) * 100, 100) : 0;

  /* ================= ANIMATION STATE ================= */

  const [displayTotal, setDisplayTotal] = useState(total);
  const prevTotalRef = useRef(total);
  const [flash, setFlash] = useState<"green" | "red" | null>(null);

  useEffect(() => {
    const prev = prevTotalRef.current;

    if (total > prev) setFlash("green");
    if (total < prev) setFlash("red");

    let start = prev;
    let end = total;
    let duration = 400;
    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = start + (end - start) * progress;
      setDisplayTotal(Number(value.toFixed(2)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevTotalRef.current = total;
        setTimeout(() => setFlash(null), 600);
      }
    };

    requestAnimationFrame(animate);
  }, [total]);

  /* ================= LOCK ================= */

  const handleLock = async () => {
    if (!input) return;
    try {
      setLoading(true);
      await axios.post("/api/balance/lock", {
        amount: Number(input)
      });
      setInput("");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!input) return;
    try {
      setLoading(true);
      await axios.post("/api/balance/unlock", {
        amount: Number(input)
      });
      setInput("");
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTO RESERVE ================= */

  const toggleAutoReserve = async () => {
    try {
      setLoading(true);
      await axios.post("/api/balance/auto-reserve", {
        enabled: !autoEnabled,
        limit: Number(limitInput)
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const updateLimit = async () => {
    if (!limitInput) return;
    try {
      setLoading(true);
      await axios.post("/api/balance/auto-reserve", {
        enabled: true,
        limit: Number(limitInput)
      });
      setShowLimitEditor(false);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Card title="Wallet Overview">
      <div className="space-y-6">

        {/* ================= BALANCE HEADER ================= */}
        <div
          className={`rounded-2xl p-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md transition-all duration-500 ${
            flash === "green"
              ? "ring-4 ring-green-300"
              : flash === "red"
              ? "ring-4 ring-red-300"
              : ""
          }`}
        >
          <div className="text-sm opacity-80">Total Balance</div>

          <div
            className={`text-3xl font-bold mt-1 transition-colors duration-500 ${
              flash === "green"
                ? "text-green-200"
                : flash === "red"
                ? "text-red-200"
                : ""
            }`}
          >
            ₹ {displayTotal.toLocaleString()}
          </div>

          <div className="flex justify-between mt-4 text-sm">
            <span>Available: ₹ {unlocked.toLocaleString()}</span>
            <span>Reserved: ₹ {lockedAmount.toLocaleString()}</span>
          </div>

          <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${reservePercent}%` }}
            />
          </div>
        </div>

        {/* ================= LOCK / UNLOCK ================= */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-700">
            Manage Reserved Funds
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Amount (₹)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              disabled={loading}
              onClick={handleLock}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              Lock
            </button>

            <button
              disabled={loading}
              onClick={handleUnlock}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              Unlock
            </button>
          </div>
        </div>

        {/* ================= AUTO RESERVE ================= */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-slate-800">
                Auto Reserve
              </div>
              <div className="text-xs text-slate-500">
                Automatically reserve excess unlocked funds above a threshold
              </div>
            </div>

            <button
              onClick={toggleAutoReserve}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-50 ${
                autoEnabled
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {autoEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>

          {autoEnabled && (
            <>
              {!showLimitEditor && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-600">
                    Threshold: ₹ {(autoLimit! / 100).toLocaleString()}
                  </div>

                  <button
                    onClick={() => setShowLimitEditor(true)}
                    className="text-sm text-teal-600 hover:underline"
                  >
                    Edit Limit
                  </button>
                </div>
              )}

              {showLimitEditor && (
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    placeholder="New Threshold (₹)"
                    value={limitInput}
                    onChange={(e) => setLimitInput(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />

                  <button
                    onClick={updateLimit}
                    disabled={loading}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </Card>
  );
};