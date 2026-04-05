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
  payload: { employer: string; salaryFrom: number; salaryTo: number; range: number };
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
        ${(data.salaryFrom / 1000).toFixed(0)}K - $
        {(data.salaryTo / 1000).toFixed(0)}K
      </p>
    </div>
  );
}

export function SalaryChart({ salaries }: SalaryChartProps) {
  // Aggregate by employer: take the top 15 by count, show avg range
  const employerMap = new Map<
    string,
    { count: number; totalFrom: number; totalTo: number }
  >();

  for (const s of salaries) {
    const existing = employerMap.get(s.employer) ?? {
      count: 0,
      totalFrom: 0,
      totalTo: 0,
    };
    existing.count++;
    existing.totalFrom += s.salaryFrom;
    existing.totalTo += s.salaryTo;
    employerMap.set(s.employer, existing);
  }

  const chartData = Array.from(employerMap.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15)
    .map(([employer, data]) => ({
      employer: employer.replace(/ (LLC|INC|CORP|CORPORATION)$/i, ""),
      salaryFrom: Math.round(data.totalFrom / data.count / 1000),
      salaryTo: Math.round(data.totalTo / data.count / 1000),
      range: Math.round(
        (data.totalTo / data.count - data.totalFrom / data.count) / 1000
      ),
    }))
    .sort((a, b) => b.salaryTo - a.salaryTo);

  return (
    <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 36)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 120, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis
          type="number"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          tickFormatter={(v: number) => `$${v}K`}
          domain={[0, "dataMax + 20"]}
        />
        <YAxis
          type="category"
          dataKey="employer"
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          width={110}
        />
        <Tooltip content={<SalaryTooltip />} />
        <Bar dataKey="salaryFrom" stackId="salary" fill="transparent" />
        <Bar dataKey="range" stackId="salary" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS.accent} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
