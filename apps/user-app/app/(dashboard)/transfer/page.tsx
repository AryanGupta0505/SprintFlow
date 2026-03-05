import prisma from "@repo/db/client";
import { BalanceCard } from "../../../components/BalanceCard";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { Transactions } from "../../../components/Transactions";
import { BankTransferCard } from "../../../components/BankTransferCard";

async function getBalance() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  const balance = await prisma.balance.findUnique({
    where: { userId }
  });

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  return {
    amount: balance?.amount || 0,   // unlocked
    locked: balance?.locked || 0,
    autoEnabled: user?.autoReserveEnabled || false,
    autoLimit: user?.autoReserveLimit || null
  };
}

async function getOnRampTransactions() {
  const session = await getServerSession(authOptions);
  const txns = await prisma.onRampTransaction.findMany({
    where: {
      userId: Number(session?.user?.id),
    },
  });

  return txns.map((t) => ({
    time: t.startTime,
    amount: t.amount,
    status: t.status,
    provider: t.provider,
  }));
}

async function getOffRampTransactions() {
  const session = await getServerSession(authOptions);
  const txns = await prisma.offRampTransaction.findMany({
    where: {
      userId: Number(session?.user?.id),
    },
  });

  return txns.map((t) => ({
    time: t.startTime,
    amount: t.amount,
    status: t.status,
    provider: t.provider,
  }));
}

export default async function () {
  const balance = await getBalance();
  const onrampTxns = await getOnRampTransactions();
  const offrampTxns = await getOffRampTransactions();

  const transactions = [
    ...onrampTxns.map((t) => ({ ...t, type: "onramp" as const })),
    ...offrampTxns.map((t) => ({ ...t, type: "offramp" as const })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[#6a51a6] tracking-tight">
          Self-Transfer
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Manage your funds and bank transfers
        </p>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* LEFT SIDE — SMALLER TRANSFER CARD */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <BankTransferCard />
          </div>
        </div>

        {/* RIGHT SIDE — DOMINANT SECTION */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          {/* Balance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <BalanceCard
              autoEnabled={balance.autoEnabled}
              autoLimit={balance.autoLimit}
            />
          </div>

          {/* Bigger Transactions */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex-1">
            <Transactions transactions={transactions} />
          </div>

        </div>

      </div>
    </div>
  );
}