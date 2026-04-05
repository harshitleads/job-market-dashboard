"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CustomTooltip } from "./custom-tooltip";
import { COLORS } from "@/lib/constants";
import type { FredObservation } from "@/lib/fred";

interface FlowChartProps {
  hires: FredObservation[];
  quits: FredObservation[];
  layoffs: FredObservation[];
}

interface MergedDataPoint {
  date: string;
  hires?: number;
  quits?: number;
  layoffs?: number;
}

export function FlowChart({ hires, quits, layoffs }: FlowChartProps) {
  const dataMap = new Map<string, MergedDataPoint>();

  for (const obs of hires) {
    dataMap.set(obs.date, { date: obs.date, hires: obs.value });
  }
  for (const obs of quits) {
    const existing = dataMap.get(obs.date) ?? { date: obs.date };
    existing.quits = obs.value;
    dataMap.set(obs.date, existing);
  }
  for (const obs of layoffs) {
    const existing = dataMap.get(obs.date) ?? { date: obs.date };
    existing.layoffs = obs.value;
    dataMap.set(obs.date, existing);
  }

  const data = Array.from(dataMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="hiresGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="quitsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="layoffsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          width={55}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
        <Area
          type="monotone"
          dataKey="hires"
          name="Hires"
          stroke={COLORS.accent}
          fill="url(#hiresGrad)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="quits"
          name="Quits"
          stroke={COLORS.purple}
          fill="url(#quitsGrad)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="layoffs"
          name="Layoffs"
          stroke={COLORS.red}
          fill="url(#layoffsGrad)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
