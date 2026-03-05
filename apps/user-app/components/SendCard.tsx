"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { p2pTransfer } from "../app/lib/actions/p2pTransfer";

export function SendCard({ selectedNumber }: { selectedNumber: string }) {
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (selectedNumber) {
      setNumber(selectedNumber);
    }
  }, [selectedNumber]);

  const handleTransfer = async () => {
    if (!number || !amount) return;

    setLoading(true);

    const amtInPaise = Number(amount) * 100;

    const res = await p2pTransfer(number, amtInPaise);

    if (res?.error) {
      setLoading(false);
      alert(res.error);
      return;
    }

    // ✅ Pass everything directly
    router.push(
      `/p2p/pay/${res.token}?amount=${amtInPaise}&to=${number}`
    );
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl">
        <Card title="Send Money">
          <div className="pt-6 space-y-6">

            <div className="text-sm text-gray-500">
              Transfer funds securely to your contacts
            </div>

            <TextInput
              placeholder="Enter phone number"
              label="Recipient Number"
              value={number}
              onChange={setNumber}
            />

            <TextInput
              placeholder="Enter amount"
              label="Amount (₹)"
              value={amount}
              onChange={setAmount}
            />

            <div className="pt-4 flex justify-center">
              <Button
                className="w-full bg-teal-600 text-white hover:bg-teal-700 active:opacity-90 transition"
                disabled={loading}
                onClick={handleTransfer}
              >
                {loading ? "Processing..." : "Pay Securely"}
              </Button>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
}