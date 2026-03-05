"use client";

import { useSidebar } from "./SidebarContext";

export default function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex min-h-[calc(100vh-96px)]">

      {/* SIDEBAR WRAPPER */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-0"}
          ${isOpen ? "border-r border-slate-200" : ""}
          overflow-hidden
          bg-white
          flex-shrink-0
        `}
      >
        {/* INNER CONTENT (padding only when open) */}
        <div className={`${isOpen ? "p-6 space-y-2" : "hidden"}`}>
          {sidebar}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10 transition-all duration-300">
        {children}
      </div>

    </div>
  );
}