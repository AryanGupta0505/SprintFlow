
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export function PayPage() {
  const { token, type } = useParams();

  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
const MAX_ATTEMPTS = 3;
  const [isExpired, setIsExpired] = useState(false);

  const [pin, setPin] = useState(["", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const fullPin = pin.join("");
  const isPinComplete = fullPin.length === 4;

  /* ===============================
     FETCH TRANSACTION
  =============================== */
  useEffect(() => {
    async function fetchTransaction() {
      if (!token || !type) return;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BANK_SERVER_URL}/bank/${type}transaction/${token}`
        );

        setAmount(res.data.amount);
        setProvider(res.data.provider);
      } catch {
        setIsExpired(true);

        setTimeout(() => {
          window.location.replace(
            `${import.meta.env.VITE_USER_APP_URL}/transfer?refresh=` + Date.now()
          );
        }, 1500);
      }
    }

    fetchTransaction();
  }, [token, type]);

  /* ===============================
     PIN HANDLING
  =============================== */
  const handlePinChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    if (value && index === 3) {
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  /* ===============================
     HANDLE PAYMENT
  =============================== */
  const handlePay = async () => {
    if (!token || !isPinComplete || isLocked || isExpired) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BANK_WEBHOOK_URL}/${type}bankWebhook`,
        { token, upiPin: fullPin }
      );

      if (res.data.success) {
        setStatus("success");

        setTimeout(() => {
          window.location.replace(
            `${import.meta.env.VITE_USER_APP_URL}/transfer?refresh=` + Date.now()
          );
        }, 1500);
      } else {
        setErrorMessage(res.data.message);
        const newAttempts = attempts + 1;
setAttempts(newAttempts);
        if (res.data.message?.toLowerCase().includes("locked")) {
  setIsLocked(true);

  // ✅ ADD THIS REDIRECT
  setTimeout(() => {
    window.location.replace(
      `${import.meta.env.VITE_USER_APP_URL}/transfer?refresh=` + Date.now()
    );
  }, 1500);

  return; // ✅ VERY IMPORTANT
}

        setPin(["", "", "", ""]);
        inputsRef.current[0]?.focus();
      }
    } catch {
      setErrorMessage("Payment failed. Please try again.");
    }

    setLoading(false);
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl overflow-hidden border border-teal-100">

        <div className="bg-teal-700 px-6 py-4 text-white">
          <h1 className="text-2xl font-bold">
            {provider || "Loading Bank..."}
          </h1>
          <p className="text-teal-100 text-xs mt-1">
            Secure UPI Payment Gateway
          </p>
        </div>

        <div className="px-8 py-10">

          {isExpired && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl text-center">
              ⏳ Transaction expired. Redirecting...
            </div>
          )}

          {!isExpired && (
            <>
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 mb-8 text-center">
                <p className="text-xs text-gray-500 mb-1">Payment Amount</p>
                <h2 className="text-3xl font-bold text-teal-700">
                  ₹ {Number(amount) / 100 || 0}
                </h2>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Enter UPI PIN
                </h3>
                <p className="text-gray-500 text-xs">
  {attempts === 0
    ? "3 incorrect attempts will lock this transaction"
    : `Attempts left: ${MAX_ATTEMPTS - attempts}`}
</p>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    type="password"
                    maxLength={1}
                    value={digit}
                    disabled={isLocked}
                    onChange={(e) =>
                      handlePinChange(e.target.value, index)
                    }
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-14 h-14 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition disabled:bg-gray-100"
                  />
                ))}
              </div>

              <button
                ref={buttonRef}
                disabled={
  !isPinComplete ||
  loading ||
  isLocked ||
  attempts >= MAX_ATTEMPTS
}
                onClick={handlePay}
                className={`w-full py-3 rounded-xl text-base font-semibold transition duration-300
                  ${
                    loading
                      ? "bg-teal-500 text-white cursor-not-allowed opacity-80"
                      : isLocked
                      ? "bg-red-400 text-white cursor-not-allowed"
                      : isPinComplete
                      ? "bg-teal-600 hover:bg-teal-700 active:opacity-90 active:scale-[0.98] text-white shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {loading
                  ? "Processing..."
                  : isLocked
                  ? "Transaction Locked"
                  : `Pay ₹ ${Number(amount) / 100 || 0}`}
              </button>

              {status === "success" && (
                <div className="mt-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center">
                  ✅ Payment Successful <br />
                  Redirecting to Wallet...
                </div>
              )}

              {errorMessage && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
                  ❌ {errorMessage}
                </div>
              )}
            </>
          )}

          <div className="mt-8 text-[10px] text-gray-400 text-center">
            🔒 256-bit SSL Encrypted | RBI Compliant
          </div>

        </div>
      </div>
    </div>
  );
}