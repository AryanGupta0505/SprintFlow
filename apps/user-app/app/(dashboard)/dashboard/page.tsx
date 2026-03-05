
import axios from "axios";
import prisma from "@repo/db/client";
import { headers } from "next/headers";
import Link from "next/link";

export default async function DashboardPage() {
  const userDetails = await getUserDetails();
  const userId = Number(userDetails.user?.id);

  const balance = await getBalance(userId);
  const recentTransactions = await getRecentTransactions(userId);

  return (
    <div className=" py-2">
  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-7xl mx-auto">
    
    <div className="w-full px-3 md:px-8 space-y-12">
      {/* Your entire page content */}
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-emerald-500 text-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold drop-shadow-sm">
          Welcome {userDetails.user?.name || "User"} 👋
        </h1>
        <p className="mt-2 text-white/90 text-lg">
          Manage your wallet and track your activity
        </p>
      </div>

      {/* BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-emerald-100">
          <div className="text-sm text-slate-500">Available Balance</div>
          <div className="text-3xl font-bold text-emerald-600 mt-3">
            ₹ {(balance?.amount || 0) / 100}
          </div>
          <div className="text-xs text-emerald-500 mt-1">
            Ready to spend
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-amber-100">
          <div className="text-sm text-slate-500">Locked Balance</div>
          <div className="text-3xl font-bold text-amber-600 mt-3">
            ₹ {(balance?.locked || 0) / 100}
          </div>
          <div className="text-xs text-amber-500 mt-1">
            Temporarily reserved
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-indigo-100">
          <div className="text-sm text-slate-500">Recent Transactions</div>
          <div className="text-3xl font-bold text-indigo-600 mt-3">
            {recentTransactions.length}
          </div>
          <div className="text-xs text-indigo-500 mt-1">
            Last 5 activities
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8">
        <div className="text-xl font-semibold mb-6 text-slate-800">
          Quick Actions
        </div>

        <div className="flex flex-wrap gap-5">

          <Link
            href="/p2p"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Send Money
          </Link>

          <Link
            href="/transfer"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Transfer Funds
          </Link>

          <Link
            href="/transactions"
            className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-black shadow-md hover:shadow-lg transition-all duration-300"
          >
            View Transactions
          </Link>

        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-semibold text-slate-800">
            Recent Activity
          </div>

          <Link
            href="/transactions"
            className="text-sm text-indigo-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-slate-500 text-center py-10">
            No recent transactions
          </div>
        ) : (
          <div className="space-y-5">
            {recentTransactions.map((t) => {
              const isReceived = t.direction === "received";

              return (
                <div
                  key={t.id}
                  className="flex justify-between items-center border-b border-slate-100 pb-4 last:border-none shadow-sm hover:shadow-md transition-all duration-200 rounded-lg p-3"
                >
                  <div className="space-y-1">

                    <div
                      className={`flex items-center gap-2 text-lg font-semibold ${
                        isReceived
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      <span>
                        {isReceived ? "↘" : "↗"}
                      </span>
                      ₹ {t.amount / 100}
                    </div>

                    <div className="text-sm text-slate-600">
                      {t.description}
                    </div>

                    <div className="text-xs text-slate-400">
                      {new Date(t.time).toLocaleString()}
                    </div>
                  </div>

                  <div
                    className={`text-xs font-medium px-4 py-1 rounded-full shadow-sm ${
                      t.status === "Success"
                        ? "bg-emerald-100 text-emerald-700"
                        : t.status === "Processing"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {t.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

  </div>
</div>
  );
}

/* Helpers unchanged */

/* Helpers unchanged */

/* ================= HELPERS (UNCHANGED LOGIC) ================= */

async function getUserDetails() {
  const cookie = headers().get("cookie");

  const res = await axios.get(`/api/user`, {
    headers: {
      Cookie: cookie || "",
    },
  });

  return res.data;
}

async function getBalance(userId: number) {
  if (!userId) return null;

  return prisma.balance.findFirst({
    where: { userId }
  });
}

async function getRecentTransactions(userId: number) {
  if (!userId) return [];

  const p2p = await prisma.p2pTransfer.findMany({
    where: {
      OR: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    },
    include: {
      fromUser: true,
      toUser: true
    }
  });

  const onramp = await prisma.onRampTransaction.findMany({
    where: { userId }
  });

  const offramp = await prisma.offRampTransaction.findMany({
    where: { userId }
  });

  const formattedP2P = p2p.map(t => ({
    id: `p2p-${t.id}`,
    direction: t.fromUserId === userId ? "sent" : "received",
    amount: t.amount,
    status: t.status,
    time: t.timestamp,
    description:
      t.fromUserId === userId
        ? `Sent to ${t.toUser.number}`
        : `Received from ${t.fromUser.number}`
  }));

  const formattedOnRamp = onramp.map(t => ({
    id: `on-${t.id}`,
    direction: "received",
    amount: t.amount,
    status: t.status,
    time: t.startTime,
    description: `Withdrawn via ${t.provider}`
  }));

  const formattedOffRamp = offramp.map(t => ({
    id: `off-${t.id}`,
    direction: "sent",
    amount: t.amount,
    status: t.status,
    time: t.startTime,
    description: `Deposited via ${t.provider}`
  }));

  return [
    ...formattedP2P,
    ...formattedOnRamp,
    ...formattedOffRamp
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);
}