"use client";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { useSession } from "next-auth/react";

const SUPPORTED_BANKS = [
  { name: "HDFC Bank" },
  { name: "Axis Bank" },
  { name: "SBI Bank" },
  { name: "ICICI Bank" }
];

type TransferType = "onramp" | "offramp";

export const BankTransferCard = () => {
  const session = useSession();
  const userId = session?.data?.user?.id;

  const [transferType, setTransferType] = useState<TransferType>("onramp");
  const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
  const [amountInput, setAmountInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isOnRamp = transferType === "onramp";

  const title = isOnRamp
    ? "Withdraw Money from Bank Account"
    : "Deposit Money to Bank Account";

  const buttonText = isOnRamp ? "Withdraw Money" : "Deposit Money";

  const endpoint = isOnRamp
    ? `${process.env.NEXT_PUBLIC_BANK_SERVER_URL}/bank/onramptransaction`
    : `${process.env.NEXT_PUBLIC_BANK_SERVER_URL}/bank/offramptransaction`;

  const webhookUrl = isOnRamp
    ? `${process.env.NEXT_PUBLIC_BANK_WEBHOOK_URL}/onrampbankWebhook`
    : `${process.env.NEXT_PUBLIC_BANK_WEBHOOK_URL}/offrampbankWebhook`;

  const handleSubmit = async () => {
    if (!userId) {
      alert("User not logged in");
      return;
    }

    const numericAmount = Number(amountInput);

    if (!numericAmount || numericAmount <= 0) {
      alert("Enter valid amount");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: numericAmount * 100,
          webhookUrl,
          provider
        })
      });

      const data = await res.json();

      if (!data?.redirectUrl) {
        alert("Unable to initiate transaction");
        setLoading(false);
        return;
      }

      // 🔥 Force full reload navigation (no stale state)
      window.location.href = data.redirectUrl;
    } catch {
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card title={title}>
        {/* Transfer Type */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-teal-700 mb-2">
            Transfer Type
          </label>
          <div className="border border-teal-200 rounded-lg focus-within:ring-2 focus-within:ring-teal-400">
            <Select
              value={transferType}
              onSelect={(value) =>
                setTransferType(value as TransferType)
              }
              options={[
                { key: "Withdraw Money", value: "onramp" },
                { key: "Deposit Money", value: "offramp" }
              ]}
            />
          </div>
        </div>

        {/* Amount */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-teal-700 mb-2">
            Amount
          </label>

          <div className="relative">
            <span className="absolute left-3 top-2.5 text-teal-500 font-semibold">
              ₹
            </span>

            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-8 pr-4 py-2.5 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>
        </div>

        {/* Bank */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-teal-700 mb-2">
            Select Bank
          </label>

          <div className="border border-teal-200 rounded-lg focus-within:ring-2 focus-within:ring-teal-400">
            <Select
              value={provider}
              onSelect={(value) => setProvider(value)}
              options={SUPPORTED_BANKS.map((x) => ({
                key: x.name,
                value: x.name
              }))}
            />
          </div>
        </div>
        <Button
          disabled={loading}
          className={`
            w-full
            bg-teal-600
            text-white
            hover:bg-teal-700
            active:bg-teal-600
            active:opacity-90
            focus:outline-none
            focus:ring-0
            disabled:bg-teal-400
            disabled:cursor-not-allowed
            transition
          `}
          onClick={handleSubmit}
        >
          {loading ? "Processing..." : buttonText}
        </Button>
      </Card>
    </div>
  );
};