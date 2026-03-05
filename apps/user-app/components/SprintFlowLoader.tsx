"use client";

export function SprintFlowLoader() {
  return (
    <div className="p-6 space-y-6 animate-pulse">

      {/* Page Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-md bg-slate-200" />
        <div className="h-4 w-96 rounded-md bg-slate-200" />
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-40 rounded-2xl bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-200" />
      </div>

      {/* Main Content Block */}
      <div className="h-[350px] rounded-2xl bg-slate-200" />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-72 rounded-2xl bg-slate-200" />
        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>

    </div>
  );
}