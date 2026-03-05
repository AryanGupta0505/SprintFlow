"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface BalanceContextType {
  amount: number;
  locked: number;
  setBalance: (amount: number, locked: number) => void;
}

const BalanceContext = createContext<BalanceContextType | null>(null);

export function BalanceProvider({
  children,
  initialAmount,
  initialLocked,
}: {
  children: React.ReactNode;
  initialAmount: number;
  initialLocked: number;
}) {
  const [amount, setAmount] = useState(initialAmount);
  const [locked, setLocked] = useState(initialLocked);

  // 🔥 Listen for WebSocket balance updates
  useEffect(() => {
    function handleBalanceUpdate(event: any) {
      const { amount, locked } = event.detail;

      setAmount(amount);
      setLocked(locked);
    }

    window.addEventListener("balance-update", handleBalanceUpdate);

    return () => {
      window.removeEventListener(
        "balance-update",
        handleBalanceUpdate
      );
    };
  }, []);

  const setBalance = (newAmount: number, newLocked: number) => {
    setAmount(newAmount);
    setLocked(newLocked);
  };

  return (
    <BalanceContext.Provider
      value={{ amount, locked, setBalance }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);

  if (!context) {
    throw new Error("useBalance must be used inside BalanceProvider");
  }

  return context;
}