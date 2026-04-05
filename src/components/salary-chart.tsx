"use client";

import { COLORS } from "@/lib/constants";
import type { PMSalary } from "@/lib/h1b-data";

interface SalaryChartProps {
  salaries: PMSalary[];
}

function normalizeEmployerName(name: string): string {
  return name
    .replace(/[.,]+$/g, "")
    .replace(/\s+(LLC|INC|CORP|CORPORATION|Inc|Corp)\.?$/i, "")
    .trim();
}

export function SalaryChart({ salaries }: SalaryChartProps) {
  const employerMap = new Map<
    string,
    { displayName: string; totalSalary: number; count: number }
  >();

  for (const s of salaries) {
    const key = normalizeEmployerName(s.employer).toUpperCase();
    const existing = employerMap.get(key) ?? {
      displayName: normalizeEmployerName(s.employer),
      totalSalary: 0,
      count: 0,
    };
    existing.count++;
    existing.totalSalary += s.salaryFrom;
    employerMap.set(key, existing);
  }

  const chartData = Array.from(employerMap.values())
    .map((e) => ({
      employer: e.displayName,
      avgSalary: Math.round(e.totalSalary / e.count),
      count: e.count,
    }))
    .sort((a, b) => b.avgSalary - a.avgSalary)
    .slice(0, 15);

  if (chartData.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#94a3b8]">
        No PM salary data available for this region.
      </p>
    );
  }

  const maxSalary = chartData[0].avgSalary;

  return (
    <div className="space-y-3">
      {chartData.map((item) => {
        const pct = (item.avgSalary / maxSalary) * 100;
        const salaryK = Math.round(item.avgSalary / 1000);
        return (
          <div key={item.employer} className="group">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-[#e2e8f0]">
                {item.employer}
              </span>
              <span className="shrink-0 font-mono text-sm font-medium text-[#e2e8f0]">
                ${salaryK}K
              </span>
            </div>
            <div className="relative h-6 w-full overflow-hidden rounded bg-[#1e293b]/50">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: COLORS.accent,
                  opacity: 0.8,
                }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-xs text-[#94a3b8] opacity-0 transition-opacity group-hover:opacity-100">
                {item.count} filing{item.count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
