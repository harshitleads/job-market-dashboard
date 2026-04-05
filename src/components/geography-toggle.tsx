"use client";

export type Geography = "us" | "california" | "bayarea";

interface GeographyToggleProps {
  active: Geography;
  onChange: (geo: Geography) => void;
}

const OPTIONS: { id: Geography; label: string }[] = [
  { id: "us", label: "US" },
  { id: "california", label: "California" },
  { id: "bayarea", label: "Bay Area" },
];

export function GeographyToggle({ active, onChange }: GeographyToggleProps) {
  return (
    <div className="inline-flex gap-1 rounded-lg border border-[#1e293b] bg-[#111827] p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            active === opt.id
              ? "bg-[#1e293b] text-[#e2e8f0]"
              : "text-[#94a3b8] hover:text-[#e2e8f0]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
