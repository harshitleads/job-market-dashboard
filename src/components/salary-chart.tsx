"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { COLORS } from "@/lib/constants";
import type { PMSalary } from "@/lib/h1b-data";

interface SalaryChartProps {
  salaries: PMSalary[];
}

interface PayloadEntry {
  name: string;
  value: number;
  color: string;
  payload: { employer: string; avgSalary: number; count: number };
}

function SalaryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: PayloadEntry[];
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-4 py-3 shadow-xl">
      <p className="text-sm font-medium text-[#e2e8f0]">{data.employer}</p>
      <p className="mt-1 font-mono text-xs text-[#94a3b8]">
        Avg PM Salary: ${(data.avgSalary / 1000).toFixed(0)}K
      </p>
      <p className="mt-0.5 font-mono text-xs text-[#94a3b8]">
        {data.count} filing{data.count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

function normalizeEmployerName(name: string): string {
  return name
    .replace(/[.,]+$/g, "")
    .replace(/\s+(LLC|INC|CORP|CORPORATION|Inc|Corp)\.?$/i, "")
    .trim();
}

export function SalaryChart({ salaries }: SalaryChartProps) {
  // Group by normalized employer name, average salary
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
      avgSalaryK: Math.round(e.totalSalary / e.count / 1000),
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

  return (
    <ResponsiveContainer
      width="100%"
      height={Math.max(400, chartData.length * 38)}
    >
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 60, left: 10, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e293b"
          horizontal={false}
        />
        <XAxis
          type="number"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
          domain={[0, "dataMax + 20000"]}
        />
        <YAxis
          type="category"
          dataKey="employer"
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          width={140}
        />
        <Tooltip content={<SalaryTooltip />} />
        <Bar dataKey="avgSalary" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS.accent} fillOpacity={0.8} />
          ))}
          <LabelList
            dataKey="avgSalaryK"
            position="right"
            formatter={(v) => `$${v}K`}
            style={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
