"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  DoorOpen,
  FileText,
  BarChart3,
} from "lucide-react";
import { KpiCard } from "./kpi-card";
import { HeroChart } from "./hero-chart";
import { FlowChart } from "./flow-chart";
import { ChartCard } from "./chart-card";
import { SectionTitle } from "./section-title";
import { EventPill } from "./event-pill";
import { SourcesFooter } from "./sources-footer";
import { ChartSkeleton } from "./chart-skeleton";
import { GeographyToggle, type Geography } from "./geography-toggle";
import { EVENTS, COLORS, GEOGRAPHY_SERIES } from "@/lib/constants";
import type { FredObservation } from "@/lib/fred";

type SeriesData = Record<string, FredObservation[]>;

function getLatest(data: FredObservation[]): number {
  return data.length > 0 ? data[data.length - 1].value : 0;
}

function getDelta(data: FredObservation[], monthsBack = 12): string {
  if (data.length < 2) return "N/A";
  const current = data[data.length - 1].value;
  const prev = data[Math.max(0, data.length - 1 - monthsBack)].value;
  const diff = current - prev;
  const sign = diff > 0 ? "+" : "";
  if (current > 1000) {
    return `${sign}${(diff / 1000).toFixed(1)}K vs 12mo ago`;
  }
  return `${sign}${diff.toFixed(1)} vs 12mo ago`;
}

function getDeltaType(
  data: FredObservation[],
  higherIsBetter: boolean
): "up" | "down" | "neutral" {
  if (data.length < 13) return "neutral";
  const current = data[data.length - 1].value;
  const prev = data[Math.max(0, data.length - 13)].value;
  const isHigher = current > prev;
  if (higherIsBetter) return isHigher ? "up" : "down";
  return isHigher ? "down" : "up";
}

export function Dashboard() {
  const [geography, setGeography] = useState<Geography>("us");
  const [data, setData] = useState<SeriesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const geoSeries = GEOGRAPHY_SERIES[geography];
    const seriesIds = Object.values(geoSeries).join(",");
    fetch(`/api/fred?series=${seriesIds}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [geography]);

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-400">
          Failed to load data. Please try again later.
        </p>
      </div>
    );
  }

  const isLoading = loading || !data;

  return (
    <>
      {/* Geography Toggle */}
      <div className="mb-6">
        <GeographyToggle active={geography} onChange={setGeography} />
      </div>

      {geography === "us" && <USView data={data} isLoading={isLoading} />}
      {geography === "california" && (
        <CaliforniaView data={data} isLoading={isLoading} />
      )}
      {geography === "bayarea" && (
        <BayAreaView data={data} isLoading={isLoading} />
      )}

      <SourcesFooter />

      <div className="mt-8 pb-8 text-center text-sm text-[#94a3b8]">
        Built by{" "}
        <a
          href="https://harshit.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00c896] hover:underline"
        >
          Harshit Sharma
        </a>
        {" - "}
        <a
          href="https://harshit.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00c896] hover:underline"
        >
          harshit.ai
        </a>
      </div>
    </>
  );
}

function USView({
  data,
  isLoading,
}: {
  data: SeriesData | null;
  isLoading: boolean;
}) {
  const s = GEOGRAPHY_SERIES.us;
  const openings = data?.[s.openings] ?? [];
  const unemp = data?.[s.unemployment] ?? [];
  const hires = data?.[s.hires] ?? [];
  const quits = data?.[s.quits] ?? [];
  const layoffs = data?.[s.layoffs] ?? [];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Job Openings"
          value={isLoading ? "--" : `${(getLatest(openings) / 1000).toFixed(1)}M`}
          delta={isLoading ? "Loading..." : getDelta(openings)}
          deltaType={isLoading ? "neutral" : getDeltaType(openings, true)}
          icon={Briefcase}
          iconColor={COLORS.accent}
        />
        <KpiCard
          title="Unemployment Rate"
          value={isLoading ? "--" : `${getLatest(unemp).toFixed(1)}%`}
          delta={isLoading ? "Loading..." : getDelta(unemp)}
          deltaType={isLoading ? "neutral" : getDeltaType(unemp, false)}
          icon={TrendingDown}
          iconColor={COLORS.blue}
        />
        <KpiCard
          title="Monthly Hires"
          value={isLoading ? "--" : `${(getLatest(hires) / 1000).toFixed(1)}M`}
          delta={isLoading ? "Loading..." : getDelta(hires)}
          deltaType={isLoading ? "neutral" : getDeltaType(hires, true)}
          icon={TrendingUp}
          iconColor={COLORS.accent}
        />
        <KpiCard
          title="Quits Rate"
          value={isLoading ? "--" : `${(getLatest(quits) / 1000).toFixed(1)}M`}
          delta={isLoading ? "Loading..." : getDelta(quits)}
          deltaType={isLoading ? "neutral" : getDeltaType(quits, true)}
          icon={DoorOpen}
          iconColor={COLORS.purple}
        />
        <KpiCard
          title="Layoffs"
          value={isLoading ? "--" : `${(getLatest(layoffs) / 1000).toFixed(1)}M`}
          delta={isLoading ? "Loading..." : getDelta(layoffs)}
          deltaType={isLoading ? "neutral" : getDeltaType(layoffs, false)}
          icon={AlertTriangle}
          iconColor={COLORS.red}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {EVENTS.map((event) => (
          <EventPill key={event.date} event={event} />
        ))}
      </div>

      <section className="mt-10">
        <SectionTitle
          title="Job Openings vs Unemployment"
          subtitle="Dual-axis comparison showing labor demand against available workforce (2021-present)"
        />
        <ChartCard>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <HeroChart jobOpenings={openings} unemployment={unemp} />
          )}
        </ChartCard>
      </section>

      <section className="mt-10">
        <SectionTitle
          title="Labor Market Flows"
          subtitle="Monthly hires, voluntary quits, and layoffs showing workforce movement patterns"
        />
        <ChartCard>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <FlowChart hires={hires} quits={quits} layoffs={layoffs} />
          )}
        </ChartCard>
      </section>
    </>
  );
}

function CaliforniaView({
  data,
  isLoading,
}: {
  data: SeriesData | null;
  isLoading: boolean;
}) {
  const s = GEOGRAPHY_SERIES.california;
  const unemp = data?.[s.unemployment] ?? [];
  const payrolls = data?.[s.payrolls] ?? [];
  const claims = data?.[s.claims] ?? [];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="CA Unemployment Rate"
          value={isLoading ? "--" : `${getLatest(unemp).toFixed(1)}%`}
          delta={isLoading ? "Loading..." : getDelta(unemp)}
          deltaType={isLoading ? "neutral" : getDeltaType(unemp, false)}
          icon={TrendingDown}
          iconColor={COLORS.blue}
        />
        <KpiCard
          title="CA Nonfarm Payrolls"
          value={isLoading ? "--" : `${(getLatest(payrolls) / 1000).toFixed(1)}M`}
          delta={isLoading ? "Loading..." : getDelta(payrolls)}
          deltaType={isLoading ? "neutral" : getDeltaType(payrolls, true)}
          icon={BarChart3}
          iconColor={COLORS.accent}
        />
        <KpiCard
          title="CA Initial Claims"
          value={isLoading ? "--" : `${(getLatest(claims) / 1000).toFixed(1)}K`}
          delta={isLoading ? "Loading..." : getDelta(claims)}
          deltaType={isLoading ? "neutral" : getDeltaType(claims, false)}
          icon={FileText}
          iconColor={COLORS.orange}
        />
      </div>

      <section className="mt-10">
        <SectionTitle
          title="California Unemployment Trend"
          subtitle="Monthly unemployment rate for the state of California (2021-present)"
        />
        <ChartCard>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <HeroChart
              jobOpenings={payrolls}
              unemployment={unemp}
              leftLabel="Payrolls (thousands)"
              rightLabel="Unemployment %"
              leftName="Nonfarm Payrolls"
              rightName="Unemployment Rate"
            />
          )}
        </ChartCard>
      </section>

      <p className="mt-6 text-center text-sm text-[#94a3b8]">
        Some indicators (JOLTS openings, hires, quits, layoffs) are only
        available at the national level.
      </p>
    </>
  );
}

function BayAreaView({
  data,
  isLoading,
}: {
  data: SeriesData | null;
  isLoading: boolean;
}) {
  const s = GEOGRAPHY_SERIES.bayarea;
  const unemp = data?.[s.unemployment] ?? [];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard
          title="SF Metro Unemployment"
          value={isLoading ? "--" : `${getLatest(unemp).toFixed(1)}%`}
          delta={isLoading ? "Loading..." : getDelta(unemp)}
          deltaType={isLoading ? "neutral" : getDeltaType(unemp, false)}
          icon={TrendingDown}
          iconColor={COLORS.blue}
        />
      </div>

      <section className="mt-10">
        <SectionTitle
          title="Bay Area Unemployment Trend"
          subtitle="Monthly unemployment rate for the San Francisco metropolitan area (2021-present)"
        />
        <ChartCard>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <SimpleLineChart data={unemp} label="Unemployment Rate" color={COLORS.blue} />
          )}
        </ChartCard>
      </section>

      <p className="mt-6 text-center text-sm text-[#94a3b8]">
        Some indicators (JOLTS openings, hires, quits, layoffs) are only
        available at the national level.
      </p>
    </>
  );
}

function SimpleLineChart({
  data,
  label,
  color,
}: {
  data: FredObservation[];
  label: string;
  color: string;
}) {
  // Lazy import to keep this in the same bundle
  const {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
  } = require("recharts");
  const { CustomTooltip } = require("./custom-tooltip");

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          name={label}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
