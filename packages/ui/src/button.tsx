

"use client";

import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const Button = ({
  children,
  className = "",
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      type={props.type || "button"}
      className={`
        inline-flex items-center justify-center
        text-white
        bg-emerald-600
        hover:bg-emerald-700
        active:scale-[0.96]
        disabled:opacity-50
        disabled:cursor-not-allowed
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-emerald-400
        font-semibold
        rounded-2xl
        text-base
        px-6
        py-3
        shadow-md
        hover:shadow-lg
        transition-all duration-200 ease-in-out
        ${className}
      `}
    >
      {children}
    </button>
  );
};