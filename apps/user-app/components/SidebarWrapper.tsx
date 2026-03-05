"use client";

import { useState } from "react";

export default function SidebarWrapper({
  sidebar,
  content,
  appbar,
}: {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  appbar: (toggle: () => void) => React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-0"}
          overflow-hidden
          bg-white border-r border-slate-200
        `}
      >
        {sidebar}
      </div>

      {/* MAIN SECTION */}
      <div className="flex-1 flex flex-col w-full">

        {/* APPBAR (Now controls sidebar) */}
        {appbar(toggleSidebar)}

        {/* CONTENT */}
        <div className="flex-1 w-full">
          {content}
        </div>

      </div>
    </div>
  );
}