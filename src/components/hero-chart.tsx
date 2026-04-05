"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import { CustomTooltip } from "./custom-tooltip";
import { EVENTS, COLORS } from "@/lib/constants";
import type { FredObservation } from "@/lib/fred";

interface HeroChartProps {
  jobOpenings: FredObservation[];
  unemployment: FredObservation[];
  leftLabel?: string;
  rightLabel?: string;
  leftName?: string;
  rightName?: string;
}

interface MergedDataPoint {
  date: string;
  jobOpenings?: number;
  unemployment?: number;
}

export function HeroChart({
  jobOpenings,
  unemployment,
  leftLabel = "Openings (thousands)",
  rightLabel = "Unemployment %",
  leftName = "Job Openings",
  rightName = "Unemployment Rate",
}: HeroChartProps) {
  const dataMap = new Map<string, MergedDataPoint>();

  for (const obs of jobOpenings) {
    dataMap.set(obs.date, { date: obs.date, jobOpenings: obs.value });
  }
  for (const obs of unemployment) {
    const existing = dataMap.get(obs.date) ?? { date: obs.date };
    existing.unemployment = obs.value;
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
      <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
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
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
        />
        {EVENTS.map((event) => (
          <ReferenceLine
            key={event.date}
            x={event.date}
            yAxisId="left"
            stroke={event.color}
            strokeDasharray="4 4"
            strokeOpacity={0.6}
          />
        ))}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="jobOpenings"
          name={leftName}
          stroke={COLORS.accent}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLORS.accent }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="unemployment"
          name={rightName}
          stroke={COLORS.blue}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLORS.blue }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
