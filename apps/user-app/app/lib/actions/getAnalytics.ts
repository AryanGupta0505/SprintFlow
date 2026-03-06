
"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function getAnalytics(
  month?: number,
  year?: number
) {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!userId) {
    return {
      monthlyTotal: 0,
      sentVsReceivedData: [],
      dailyData: [],
      categoryData: []
    };
  }

  const now = new Date();

  const selectedMonth = month ?? now.getMonth(); // 0-11
  const selectedYear = year ?? now.getFullYear();

  const firstDay = new Date(Date.UTC(selectedYear, selectedMonth, 1, -5, -30));
const nextMonth = new Date(Date.UTC(selectedYear, selectedMonth + 1, 1, -5, -30));

  // ======================
  // FETCH TRANSACTIONS
  // ======================

  const [p2p, onramp, offramp] = await Promise.all([
    prisma.p2pTransfer.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ],
        timestamp: { gte: firstDay, lt: nextMonth },
        status: "Success"
      }
    }),
    prisma.onRampTransaction.findMany({
      where: {
        userId,
        startTime: { gte: firstDay, lt: nextMonth },
        status: "Success"
      }
    }),
    prisma.offRampTransaction.findMany({
      where: {
        userId,
        startTime: { gte: firstDay, lt: nextMonth },
        status: "Success"
      }
    })
  ]);

  // ======================
  // SENT VS RECEIVED TOTALS
  // ======================

  let totalSent = 0;
  let totalReceived = 0;

  p2p.forEach(t => {
    if (t.fromUserId === userId) totalSent += t.amount;
    else totalReceived += t.amount;
  });

  offramp.forEach(t => totalSent += t.amount);
  onramp.forEach(t => totalReceived += t.amount);

  const sentVsReceivedData = [
    { type: "Sent", amount: totalSent / 100 },
    { type: "Received", amount: totalReceived / 100 }
  ];

  // ======================
  // MONTHLY TOTAL (SPENT ONLY)
  // ======================

  const monthlyTotal =
    p2p
      .filter(t => t.fromUserId === userId)
      .reduce((acc, t) => acc + t.amount, 0) +
    offramp.reduce((acc, t) => acc + t.amount, 0);

  // ======================
  // DAILY DATA (WITH SOURCE SPLIT)
  // ======================

  function formatDateLocal(date: Date) {
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

  const y = istDate.getUTCFullYear();
  const m = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(istDate.getUTCDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

  const dailyMap: Record<
    string,
    {
      p2pSent: number;
      p2pReceived: number;
      bankSent: number;
      bankReceived: number;
    }
  > = {};

  const daysInMonth = new Date(
    selectedYear,
    selectedMonth + 1,
    0
  ).getDate();

  // Initialize all days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(selectedYear, selectedMonth, day);
    dailyMap[formatDateLocal(date)] = {
      p2pSent: 0,
      p2pReceived: 0,
      bankSent: 0,
      bankReceived: 0
    };
  }

  // Add P2P
  p2p.forEach(t => {
    const key = formatDateLocal(t.timestamp);
    if (!dailyMap[key]) return;

    if (t.fromUserId === userId) {
      dailyMap[key].p2pSent += t.amount;
    }

    if (t.toUserId === userId) {
      dailyMap[key].p2pReceived += t.amount;
    }
  });

  // Add Bank Offramp (sent)
  offramp.forEach(t => {
    const key = formatDateLocal(t.startTime);
    if (dailyMap[key]) {
      dailyMap[key].bankSent += t.amount;
    }
  });

  // Add Bank Onramp (received)
  onramp.forEach(t => {
    const key = formatDateLocal(t.startTime);
    if (dailyMap[key]) {
      dailyMap[key].bankReceived += t.amount;
    }
  });

  const dailyData = Object.entries(dailyMap)
    .map(([date, values]) => ({
      date,
      p2pSent: values.p2pSent / 100,
      p2pReceived: values.p2pReceived / 100,
      bankSent: values.bankSent / 100,
      bankReceived: values.bankReceived / 100
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ======================
  // CATEGORY DATA (WITH P2P SPLIT)
  // ======================

  let p2pSentTotal = 0;
  let p2pReceivedTotal = 0;

  p2p.forEach(t => {
    if (t.fromUserId === userId) p2pSentTotal += t.amount;
    if (t.toUserId === userId) p2pReceivedTotal += t.amount;
  });

  const categoryData = [
    {
      category: "P2P Sent",
      amount: p2pSentTotal / 100
    },
    {
      category: "P2P Received",
      amount: p2pReceivedTotal / 100
    },
    {
      category: "Bank Deposits",
      amount:
        offramp.reduce((acc, t) => acc + t.amount, 0) / 100
    },
    {
      category: "Wallet Topups",
      amount:
        onramp.reduce((acc, t) => acc + t.amount, 0) / 100
    }
  ];

  // ======================
  // RETURN FINAL DATA
  // ======================

  return {
    monthlyTotal: monthlyTotal / 100,
    sentVsReceivedData,
    dailyData,
    categoryData
  };
}