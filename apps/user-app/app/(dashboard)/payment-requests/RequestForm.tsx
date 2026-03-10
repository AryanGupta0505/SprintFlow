"use client";

import { useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { TextInput } from "@repo/ui/textinput";

export default function RequestForm({
  number,
  setNumber,
  refreshRequests
}: any) {

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);

  async function createRequest() {
    if (!number || !amount) return;

    setCreating(true);

    const res = await fetch("/api/payment-request/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        toUserNumber: number,
        amount: Number(amount) * 100,
        note
      })
    });

    if (!res.ok) {
      alert("Failed to create request");
      setCreating(false);
      return;
    }

    setAmount("");
    setNote("");

    await refreshRequests();
    window.dispatchEvent(new Event("payment-request-created"));

    setCreating(false);
  }

  return (
    <Card title="Make Requests to Friends">

      {/* HEIGHT CONTROL */}
      <div className="space-y-8 min-h-[360px] flex flex-col">

        <TextInput
          label="Phone Number"
          placeholder="Enter phone number"
          value={number}
          onChange={setNumber}
        />

        <TextInput
          label="Amount (₹)"
          placeholder="Enter amount"
          value={amount}
          onChange={setAmount}
        />

        <TextInput
          label="Note (optional)"
          placeholder="Dinner / Split bill"
          value={note}
          onChange={setNote}
        />
        
        <div className="mt-auto pt-8 pb-4">
          <Button
            className="bg-teal-600 text-white hover:bg-teal-700 w-full"
            disabled={creating}
            onClick={createRequest}
          >
            {creating ? "Creating..." : "Send Request"}
          </Button>
        </div>

      </div>

    </Card>
  );
}