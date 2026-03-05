"use client";

import { useRef } from "react";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PinInput({ value, onChange }: PinInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d?$/.test(digit)) return;

    const newValue = value.split("");
    newValue[index] = digit;
    const finalValue = newValue.join("");
    onChange(finalValue);

    if (digit && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-4 justify-center">
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          type="password"
          maxLength={1}
          value={value[index] || ""}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-14 h-14 text-center text-xl border border-slate-300 rounded-xl 
                     focus:ring-2 focus:ring-teal-500 outline-none
                     transition shadow-sm"
        />
      ))}
    </div>
  );
}