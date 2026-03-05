
"use client";

type TooltipProps = {
  active?: boolean;
  payload?: any[];
  label?: string;
};

export function CustomTooltip({
  active,
  payload,
  label
}: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 shadow-xl rounded-2xl px-5 py-4 min-w-[240px]">

      {/* Date label for Line Chart */}
      {label && (
        <div className="text-xs text-gray-500 mb-3 font-medium">
          {label}
        </div>
      )}

      <div className="space-y-3">
        {payload.map((entry, index) => {
          const value = Number(entry.value);
          const percentage = entry?.payload?.percentage;
          const color = entry.color || entry?.payload?.fill || "#374151";

          return (
            <div
              key={index}
              className="flex justify-between items-start"
            >
              <div className="flex items-center gap-2">
                {/* Colored dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />

                {/* Colored label */}
                <span
                  className="text-sm font-medium"
                  style={{ color }}
                >
                  {entry.name}
                </span>
              </div>

              <div className="text-right">
                {/* Colored amount */}
                <div
                  className="text-sm font-semibold"
                  style={{ color }}
                >
                  ₹ {value.toLocaleString()}
                </div>

                {/* Percentage (CategoryPie only) */}
                {percentage && (
                  <div className="text-xs text-gray-500">
                    {percentage}% of total
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}