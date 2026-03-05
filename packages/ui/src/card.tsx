"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

export function Card({
  title,
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`
        bg-white 
        rounded-2xl 
        shadow-xl 
        border border-teal-100
        overflow-hidden
        ${className}
      `}
    >
      {title && (
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
          <h2 className="text-white text-lg font-semibold">
            {title}
          </h2>
        </div>
      )}

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
