import { getAllTransactions } from "../../lib/actions/getAllTransactions";
import { AllTransactions } from "../../../components/AllTransactions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import prisma  from "@repo/db/client";
async function getBalance() {
  const session = await getServerSession(authOptions);
  const balance = await prisma.balance.findFirst({
    where: {
      userId: Number(session?.user?.id),
    },
  });

  return {
    amount: balance?.amount || 0,
  };
}
export default async function TransactionsPage() {
  const transactions = await getAllTransactions();
  const balance = await getBalance(); 
  const ledgerSum = transactions
    .filter((t: any) => t.status === "Success")
    .reduce(
      (sum: number, t: any) =>
        sum + (t.direction === "received" ? t.amount : -t.amount),
      0
    );

  console.log("Ledger Computed:", ledgerSum / 100);
  console.log("DB Balance:", balance.amount / 100);
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[#6a51a6] tracking-tight">
          Transactions
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          View and manage all your P2P and Bank transactions
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <AllTransactions transactions={transactions as any} currentBalance={balance.amount} />
      </div>

    </div>
  );
}