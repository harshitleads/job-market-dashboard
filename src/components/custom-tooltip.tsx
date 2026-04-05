"use client";

interface PayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const dateLabel = label
    ? new Date(label).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs text-[#94a3b8]">{dateLabel}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#94a3b8]">{entry.name}:</span>
          <span className="font-mono font-medium text-[#e2e8f0]">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
