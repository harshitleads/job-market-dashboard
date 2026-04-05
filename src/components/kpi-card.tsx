import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  delta: string;
  deltaType: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor: string;
}

export function KpiCard({
  title,
  value,
  delta,
  deltaType,
  icon: Icon,
  iconColor,
}: KpiCardProps) {
  const deltaColors = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  };

  return (
    <div className="glass-card rounded-xl border border-[#1e293b] bg-[#111827] p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#94a3b8]">{title}</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#e2e8f0]">
            {value}
          </p>
          <p className={`mt-1 text-sm ${deltaColors[deltaType]}`}>{delta}</p>
        </div>
        <div
          className="flex h-[30px] w-[30px] items-center justify-center rounded-lg"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
