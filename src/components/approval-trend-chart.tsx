"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { COLORS } from "@/lib/constants";
import type { ApprovalTrend } from "@/lib/h1b-data";

interface ApprovalTrendChartProps {
  trends: ApprovalTrend[];
}

interface PayloadEntry {
  name: string;
  value: number;
  color: string;
}

function ApprovalTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs text-[#94a3b8]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#94a3b8]">{entry.name}:</span>
          <span className="font-mono font-medium text-[#e2e8f0]">
            {typeof entry.value === "number" && entry.name === "Approval Rate"
              ? `${entry.value.toFixed(1)}%`
              : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ApprovalTrendChart({ trends }: ApprovalTrendChartProps) {
  const chartData = trends.map((t) => {
    const totalApproved = t.initialApproved + t.continuingApproved;
    const totalDenied = t.initialDenied + t.continuingDenied;
    const total = totalApproved + totalDenied;
    return {
      year: t.year,
      approved: totalApproved,
      denied: totalDenied,
      approvalRate: total > 0 ? (totalApproved / total) * 100 : 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="year"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          width={55}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          width={50}
          tickFormatter={(v: number) => `${v}%`}
          domain={[80, 100]}
        />
        <Tooltip content={<ApprovalTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
        <Bar
          yAxisId="left"
          dataKey="approved"
          name="Approved"
          fill={COLORS.accent}
          fillOpacity={0.7}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          yAxisId="left"
          dataKey="denied"
          name="Denied"
          fill={COLORS.red}
          fillOpacity={0.7}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="approvalRate"
          name="Approval Rate"
          stroke={COLORS.blue}
          strokeWidth={2}
          dot={{ fill: COLORS.blue, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
