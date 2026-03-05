"use client";

type Props = {
  total: number;
};

export function MonthlySummary({ total }: Props) {
  return (
    <div
      className="
        analytics-card
        relative
        overflow-hidden
        p-10
        text-white
      "
      style={{
        background:
          "linear-gradient(135deg, #0f766e 0%, #14b8a6 45%, #2dd4bf 100%)"
      }}
    >
      <h2 className="text-sm opacity-90 tracking-wide">
        Total Spent This Month
      </h2>

      <p className="text-5xl font-bold mt-4 tracking-tight">
        ₹ {total.toLocaleString()}
      </p>

      {/* Soft glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}