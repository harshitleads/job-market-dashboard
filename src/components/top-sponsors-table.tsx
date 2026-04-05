"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { Sponsor } from "@/lib/h1b-data";

interface TopSponsorsTableProps {
  sponsors: Sponsor[];
}

type SortKey = "totalFilings" | "pmFilings" | "avgSalary" | "approvalRate";

export function TopSponsorsTable({ sponsors }: TopSponsorsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("totalFilings");
  const [sortAsc, setSortAsc] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sorted = [...sponsors].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const displayed = showAll ? sorted : sorted.slice(0, 20);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortAsc ? (
      <ChevronUp size={14} className="inline" />
    ) : (
      <ChevronDown size={14} className="inline" />
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#1e293b] text-xs uppercase text-[#94a3b8]">
              <th className="px-3 py-3 font-medium">#</th>
              <th className="px-3 py-3 font-medium">Company</th>
              <th
                className="cursor-pointer px-3 py-3 font-medium hover:text-[#e2e8f0]"
                onClick={() => handleSort("totalFilings")}
              >
                H-1B Filings <SortIcon col="totalFilings" />
              </th>
              <th
                className="cursor-pointer px-3 py-3 font-medium hover:text-[#e2e8f0]"
                onClick={() => handleSort("pmFilings")}
              >
                PM Filings <SortIcon col="pmFilings" />
              </th>
              <th
                className="cursor-pointer px-3 py-3 font-medium hover:text-[#e2e8f0]"
                onClick={() => handleSort("avgSalary")}
              >
                Avg Salary <SortIcon col="avgSalary" />
              </th>
              <th
                className="cursor-pointer px-3 py-3 font-medium hover:text-[#e2e8f0]"
                onClick={() => handleSort("approvalRate")}
              >
                Approval Rate <SortIcon col="approvalRate" />
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((sponsor, i) => (
              <tr
                key={sponsor.employer}
                className="border-b border-[#1e293b]/50 transition-colors hover:bg-[#1e293b]/30"
              >
                <td className="px-3 py-3 font-mono text-[#94a3b8]">
                  {i + 1}
                </td>
                <td className="px-3 py-3 font-medium text-[#e2e8f0]">
                  {sponsor.employer}
                </td>
                <td className="px-3 py-3 font-mono text-[#e2e8f0]">
                  {sponsor.totalFilings.toLocaleString()}
                </td>
                <td className="px-3 py-3 font-mono text-[#e2e8f0]">
                  {sponsor.pmFilings.toLocaleString()}
                </td>
                <td className="px-3 py-3 font-mono text-[#e2e8f0]">
                  {sponsor.avgSalary > 0
                    ? `$${(sponsor.avgSalary / 1000).toFixed(0)}K`
                    : "--"}
                </td>
                <td className="px-3 py-3 font-mono text-[#e2e8f0]">
                  {sponsor.approvalRate != null
                    ? `${sponsor.approvalRate.toFixed(1)}%`
                    : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sponsors.length > 20 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-[#00c896] hover:underline"
        >
          {showAll ? "Show less" : `Show all ${sponsors.length} sponsors`}
        </button>
      )}
    </div>
  );
}
