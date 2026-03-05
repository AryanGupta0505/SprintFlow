"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@repo/ui/card";
import { PinInput } from "../../../components/PinInput";
import { SprintFlowLoader } from "../../../components/SprintFlowLoader";

export default function UpiPinPage() {
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkPin() {
      const res = await axios.get("/api/upi-pin/check");
      setHasPin(res.data.hasPin);
    }
    checkPin();
  }, []);

  const handleSubmit = async () => {
    setMessage("");

    if (newPin.length !== 4) {
      return setMessage("PIN must be exactly 4 digits");
    }

    if (newPin !== confirmPin) {
      return setMessage("New PIN and Confirm PIN do not match");
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/upi-pin/set", {
        oldPin,
        newPin
      });

      setMessage(res.data.message);

      if (res.data.success) {
        setOldPin("");
        setNewPin("");
        setConfirmPin("");
        setHasPin(true);
      }
    } catch {
      setMessage("Something went wrong");
    }

    setLoading(false);
  };

  if (hasPin === null) return <SprintFlowLoader/>;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

      {/* PAGE HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[#6a51a6] tracking-tight">
          UPI PIN
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          {hasPin
            ? "Update your secure UPI PIN"
            : "Set your UPI PIN to enable transactions"}
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* LEFT SIDE */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <Card title={hasPin ? "Update UPI PIN" : "Set UPI PIN"}>
              <div className="space-y-8">

                {hasPin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-4 text-center">
                      Enter Old PIN
                    </label>
                    <PinInput value={oldPin} onChange={setOldPin} />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-4 text-center">
                    Enter New PIN
                  </label>
                  <PinInput value={newPin} onChange={setNewPin} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-4 text-center">
                    Confirm New PIN
                  </label>
                  <PinInput value={confirmPin} onChange={setConfirmPin} />
                </div>

                <button
                  disabled={loading}
                  onClick={handleSubmit}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition disabled:bg-gray-400"
                >
                  {loading
                    ? "Saving..."
                    : hasPin
                    ? "Update PIN"
                    : "Set PIN"}
                </button>

                {message && (
                  <div
                    className={`text-sm text-center ${
                      message.toLowerCase().includes("success")
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {message}
                  </div>
                )}

              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT SIDE — INFO CARD */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <Card title="Security Information">
              <ul className="space-y-4 text-slate-600 text-sm">
                <li>• Your UPI PIN is required for all transactions.</li>
                <li>• PIN must be exactly 4 digits.</li>
                <li>• Never share your PIN with anyone.</li>
                <li>• Multiple incorrect attempts may block transactions.</li>
                <li>• Always use a secure and private device.</li>
              </ul>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}