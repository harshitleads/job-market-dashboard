"use client";

import { useState } from "react";
import { COLORS } from "@/lib/constants";
import type { PMSalary } from "@/lib/h1b-data";

interface SalaryChartProps {
  salaries: PMSalary[];
}

type SortMode = "filings" | "salary";

function normalizeEmployerName(name: string): string {
  return name
    .replace(/[\s.,;:!]+$/g, "")
    .replace(/\s+(LLC|INC|CORP|CORPORATION|Inc|Corp|Ltd|Limited|LP|LLP)[\s.,]*$/i, "")
    .replace(/[\s.,;:!]+$/g, "")
    .trim();
}

export function SalaryChart({ salaries }: SalaryChartProps) {
  const [sortMode, setSortMode] = useState<SortMode>("filings");

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

  const minFilings = sortMode === "filings" ? 5 : 2;

  const chartData = Array.from(employerMap.values())
    .filter((e) => e.count >= minFilings)
    .map((e) => ({
      employer: e.displayName,
      avgSalary: Math.round(e.totalSalary / e.count),
      count: e.count,
    }))
    .sort((a, b) =>
      sortMode === "filings"
        ? b.count - a.count || b.avgSalary - a.avgSalary
        : b.avgSalary - a.avgSalary
    )
    .slice(0, 15);

  if (chartData.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#94a3b8]">
        No PM salary data available for this region.
      </p>
    );
  }

  const maxSalary = Math.max(...chartData.map((d) => d.avgSalary));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#94a3b8]">
          Data from DOL LCA filings, FY2023-FY2024 (Oct 2022 - Sep 2024)
        </p>
        <div className="inline-flex gap-1 rounded-lg border border-[#1e293b] bg-[#111827] p-1">
          <button
            onClick={() => setSortMode("filings")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              sortMode === "filings"
                ? "bg-[#1e293b] text-[#e2e8f0]"
                : "text-[#94a3b8] hover:text-[#e2e8f0]"
            }`}
          >
            By Filings
          </button>
          <button
            onClick={() => setSortMode("salary")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              sortMode === "salary"
                ? "bg-[#1e293b] text-[#e2e8f0]"
                : "text-[#94a3b8] hover:text-[#e2e8f0]"
            }`}
          >
            By Salary
          </button>
        </div>
      </div>

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
                  <span className="ml-2 text-xs font-normal text-[#94a3b8]">
                    ({item.count})
                  </span>
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
