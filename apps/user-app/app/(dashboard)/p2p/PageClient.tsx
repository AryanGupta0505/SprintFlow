
"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SendCard } from "../../../components/SendCard";
import { Users } from "../../../components/UsersCard";
import { P2PTransactions } from "../../../components/P2PTransactions";

export default function PageClient({ users, transactions, userId }: any) {

  const [selectedNumber, setSelectedNumber] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>();
  const [requestId, setRequestId] = useState<number | undefined>();

  const sendRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();

  /* =========================
     AUTO FILL FROM QUERY PARAMS
  ========================= */

  useEffect(() => {
    const numberParam = searchParams.get("number");
    const amountParam = searchParams.get("amount");
    const requestIdParam = searchParams.get("requestId");

    if (numberParam) {
      setSelectedNumber(numberParam);
      sendRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (amountParam) {
      setSelectedAmount(Number(amountParam));
    }

    if (requestIdParam) {
      setRequestId(Number(requestIdParam));
    }

  }, [searchParams]);

  const handleSelectUser = (number: string) => {
    setSelectedNumber(number);
    sendRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

      {/* HEADER */}

      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[#6a51a6] tracking-tight">
          Pay Anyone
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Pay Anyone. Anywhere, instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        <div className="lg:col-span-7 flex flex-col gap-10">

          <div
            ref={sendRef}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <SendCard
              selectedNumber={selectedNumber}
              selectedAmount={selectedAmount}
              requestId={requestId}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <P2PTransactions transactions={transactions} userId={userId} />
          </div>

        </div>

        <div className="lg:col-span-5">

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <Users
              users={users}
              onSelectUser={handleSelectUser}
            />
          </div>

        </div>

      </div>
    </div>
  );
}