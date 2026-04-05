"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface LookupResult {
  found: boolean;
  lca?: {
    employer: string;
    totalFilings: number;
    pmFilings: number;
    avgSalary: number;
    state: string;
  } | null;
  uscis?: {
    employer: string;
    totalApproved: number;
    totalDenied: number;
    approvalRate: number;
  } | null;
  salaries?: {
    employer: string;
    jobTitle: string;
    salaryFrom: number;
    salaryTo: number;
    city: string;
    year: number;
  }[];
}

export function CompanyLookup() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResult(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`/api/h1b?view=lookup&q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResult(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a company (e.g., Google, Meta, Amazon)"
          className="w-full rounded-lg border border-[#1e293b] bg-[#111827] py-3 pl-10 pr-4 text-sm text-[#e2e8f0] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#00c896]"
        />
      </div>

      {loading && (
        <div className="mt-4 text-sm text-[#94a3b8]">Searching...</div>
      )}

      {result && !loading && !result.found && query.length >= 2 && (
        <div className="mt-4 rounded-lg border border-[#1e293b] bg-[#111827] p-4 text-sm text-[#94a3b8]">
          No results found for &quot;{query}&quot;
        </div>
      )}

      {result?.found && !loading && (
        <div className="mt-4 space-y-4">
          {/* Company overview */}
          <div className="rounded-lg border border-[#1e293b] bg-[#111827] p-4">
            <h4 className="text-sm font-medium text-[#e2e8f0]">
              {result.lca?.employer ?? result.uscis?.employer}
            </h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {result.lca && (
                <>
                  <Stat
                    label="Total H-1B Filings"
                    value={result.lca.totalFilings.toLocaleString()}
                  />
                  <Stat
                    label="PM Role Filings"
                    value={result.lca.pmFilings.toLocaleString()}
                  />
                  <Stat
                    label="Avg PM Salary"
                    value={
                      result.lca.avgSalary > 0
                        ? `$${(result.lca.avgSalary / 1000).toFixed(0)}K`
                        : "--"
                    }
                  />
                </>
              )}
              {result.uscis && (
                <Stat
                  label="Approval Rate"
                  value={`${result.uscis.approvalRate.toFixed(1)}%`}
                />
              )}
            </div>
          </div>

          {/* PM Salary details */}
          {result.salaries && result.salaries.length > 0 && (
            <div className="rounded-lg border border-[#1e293b] bg-[#111827] p-4">
              <h4 className="mb-3 text-sm font-medium text-[#e2e8f0]">
                PM Role Salary Ranges
              </h4>
              <div className="space-y-2">
                {result.salaries.slice(0, 5).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="text-[#e2e8f0]">{s.jobTitle}</span>
                      <span className="ml-2 text-[#94a3b8]">
                        {s.city}, {s.year}
                      </span>
                    </div>
                    <span className="font-mono text-[#00c896]">
                      ${(s.salaryFrom / 1000).toFixed(0)}K - $
                      {(s.salaryTo / 1000).toFixed(0)}K
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#94a3b8]">{label}</p>
      <p className="mt-0.5 font-mono text-lg font-medium text-[#e2e8f0]">
        {value}
      </p>
    </div>
  );
}
