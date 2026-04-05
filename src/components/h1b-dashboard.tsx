"use client";

import { useEffect, useState } from "react";
import { GeographyToggle, type Geography } from "./geography-toggle";
import { SectionTitle } from "./section-title";
import { ChartCard } from "./chart-card";
import { ChartSkeleton } from "./chart-skeleton";
import { TopSponsorsTable } from "./top-sponsors-table";
import { SalaryChart } from "./salary-chart";
import { ApprovalTrendChart } from "./approval-trend-chart";
import { CompanyLookup } from "./company-lookup";
import { SourcesFooter } from "./sources-footer";
import type { Sponsor, PMSalary, ApprovalTrend } from "@/lib/h1b-data";

export function H1bDashboard() {
  const [geography, setGeography] = useState<Geography>("us");
  const [sponsors, setSponsors] = useState<Sponsor[] | null>(null);
  const [salaries, setSalaries] = useState<PMSalary[] | null>(null);
  const [trends, setTrends] = useState<ApprovalTrend[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSponsors(null);
    setSalaries(null);

    Promise.all([
      fetch(`/api/h1b?view=sponsors&geography=${geography}`).then((r) =>
        r.json()
      ),
      fetch(`/api/h1b?view=salaries&geography=${geography}`).then((r) =>
        r.json()
      ),
      fetch(`/api/h1b?view=approvals`).then((r) => r.json()),
    ])
      .then(([s, sal, t]) => {
        setSponsors(s);
        setSalaries(sal);
        setTrends(t);
      })
      .catch((err) => setError(err.message));
  }, [geography]);

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-400">
          Failed to load H-1B data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Geography Toggle + Data freshness */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <GeographyToggle active={geography} onChange={setGeography} />
        <div className="flex flex-1 items-center justify-end">
          <span className="text-xs text-[#94a3b8]">
            H-1B data through Dec 2024 (DOL quarterly release) · FRED data
            refreshes daily
          </span>
        </div>
      </div>

      {/* Company Lookup */}
      <section className="mb-10">
        <SectionTitle
          title="Company Lookup"
          subtitle="Search any company to see their H-1B filing history, PM roles, and approval rates"
        />
        <ChartCard>
          <CompanyLookup />
        </ChartCard>
      </section>

      {/* Top Sponsors Table */}
      <section className="mb-10">
        <SectionTitle
          title="Top H-1B Sponsors"
          subtitle="Companies ranked by total LCA filings with PM-specific breakdowns"
        />
        <ChartCard>
          {!sponsors ? (
            <ChartSkeleton />
          ) : sponsors.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#94a3b8]">
              No sponsor data available for this geography.
            </p>
          ) : (
            <TopSponsorsTable sponsors={sponsors} />
          )}
        </ChartCard>
      </section>

      {/* PM Salary Chart */}
      <section className="mb-10">
        <SectionTitle
          title="PM Role Salary Ranges"
          subtitle="H-1B filed salary ranges for Product Manager roles by company"
        />
        <ChartCard>
          {!salaries ? (
            <ChartSkeleton />
          ) : salaries.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#94a3b8]">
              No PM salary data available for this geography.
            </p>
          ) : (
            <SalaryChart salaries={salaries} />
          )}
        </ChartCard>
      </section>

      {/* Approval Trends */}
      <section className="mb-10">
        <SectionTitle
          title="H-1B Approval Trends"
          subtitle="Total approvals and denials by fiscal year with overall approval rate"
        />
        <ChartCard>
          {!trends ? (
            <ChartSkeleton />
          ) : (
            <ApprovalTrendChart trends={trends} />
          )}
        </ChartCard>
      </section>

      <p className="mb-8 text-center text-xs text-[#94a3b8]">
        LCA filings represent applications, not final visa grants. Approval
        rates are from USCIS employer-level data.
      </p>

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
