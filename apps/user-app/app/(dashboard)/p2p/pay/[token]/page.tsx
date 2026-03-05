
"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Card } from "@repo/ui/card";

export default function P2PPayPage() {
  const { token } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [amount, setAmount] = useState(0);
  const [receiver, setReceiver] = useState("");

  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");

  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);

  const [pin, setPin] = useState(["", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const fullPin = pin.join("");
  const isComplete = fullPin.length === 4;

  /* =========================
     READ PARAMS
  ========================= */
  useEffect(() => {
    const amt = searchParams.get("amount");
    const to = searchParams.get("to");

    if (!amt || !to) {
      router.replace("/p2p");
      return;
    }

    setAmount(Number(amt));
    setReceiver(to);

    // Focus first input on load
    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 100);

  }, [searchParams, router]);

  /* =========================
     PIN INPUT CHANGE
  ========================= */
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Move forward automatically
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /* =========================
     BACKSPACE HANDLING
  ========================= */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {

      if (pin[index]) {
        // If current box has value → clear only this
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      } 
      else if (index > 0) {
        // If empty → move to previous & clear it
        inputsRef.current[index - 1]?.focus();

        const newPin = [...pin];
        newPin[index - 1] = "";
        setPin(newPin);
      }
    }
  };

  /* =========================
     CONFIRM PAYMENT
  ========================= */
  const handleConfirm = async () => {
    if (!isComplete) return;

    setStatus("processing");

    const res = await fetch("/api/p2p/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, upiPin: fullPin })
    });

    const data = await res.json();

    if (data.success) {
      setStatus("success");

      setTimeout(() => {
        router.replace("/p2p?refresh=" + Date.now());
      }, 1500);

    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      setStatus("failed");
      setMessage(data.message || "Payment failed");

      setPin(["", "", "", ""]);
      inputsRef.current[0]?.focus();

      if (newAttempts >= 3) {
        setTimeout(() => {
          router.replace("/p2p?refresh=" + Date.now());
        }, 1500);
      } else {
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 2000);
      }
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl">

        <Card title="UPI Payment Gateway">

          {/* Amount Box */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 text-center mb-6">
            <p className="text-xs text-gray-500 mb-1">
              You are sending
            </p>

            <h2 className="text-3xl font-bold text-teal-700">
              ₹ {amount / 100}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              to{" "}
              <span className="font-medium text-gray-700">
                {receiver}
              </span>
            </p>
          </div>

          {/* STATUS */}
          {status === "processing" && (
            <div className="mb-5 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl text-center">
              ⏳ Processing payment...
            </div>
          )}

          {status === "success" && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center">
              ✅ Payment Successful
              <div className="text-xs mt-1">
                Redirecting to Wallet...
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
              ❌ {message}
              <div className="text-xs mt-1">
                Attempt {attempts}/3
              </div>
            </div>
          )}

          {/* PIN SECTION */}
          {status === "idle" && (
            <>
              <div className="text-center mb-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  Enter UPI PIN
                </h3>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleChange(e.target.value, index)
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(e, index)
                    }
                    className="w-14 h-14 text-center text-lg font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                ))}
              </div>

              <button
                disabled={!isComplete}
                onClick={handleConfirm}
                className={`w-full py-3 rounded-xl font-semibold transition
                  ${
                    isComplete
                      ? "bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Confirm Payment
              </button>
            </>
          )}

          <div className="mt-8 text-[10px] text-gray-400 text-center">
            🔒 256-bit SSL Encrypted | RBI Compliant
          </div>

        </Card>
      </div>
    </div>
  );
}