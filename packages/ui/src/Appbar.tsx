
"use client";

import { Button } from "./button";
import React from "react";
import Image from "next/image";

interface AppbarProps {
  user?: {
    name?: string | null;
  };
  onSignin: () => void;
  onSignout: () => void;
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
}

export const Appbar = ({
  user,
  onSignin,
  onSignout,
  rightContent,
  leftContent,
}: AppbarProps) => {
  return (
    <div className="h-24 flex justify-between items-center border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-10 shadow-sm">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* Hamburger */}
        {leftContent}

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="SprintFlow Logo"
            width={64}
            height={64}
            className="object-contain sm:w-[84px] sm:h-[84px]"
            priority
          />

          {/* Hide text below sm */}
          <div className="hidden sm:block text-2xl sm:text-3xl font-black tracking-tight select-none">
            <span className="text-blue-600">Sprint</span>
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              Flow
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 sm:gap-6">
        {rightContent}
        <Button onClick={user ? onSignout : onSignin}>
          {user ? "Logout" : "Login"}
        </Button>
      </div>
    </div>
  );
};