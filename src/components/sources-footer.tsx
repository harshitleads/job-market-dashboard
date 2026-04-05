const sources = [
  {
    name: "FRED API",
    description: "Federal Reserve Economic Data - St. Louis Fed",
    series: "JTSJOL, UNRATE, JTSHIL, JTSQUL, JTSLLL, JTSTSL, CAUR, CANA",
  },
  {
    name: "DOL OFLC",
    description: "Labor Condition Application Disclosure Data",
    series: "H-1B data: FY2022-FY2025 (LCA filings, job titles, salaries)",
  },
  {
    name: "USCIS",
    description: "H-1B Employer Data Hub",
    series: "FY2020-FY2026 Q1 (approval/denial counts by employer)",
  },
  {
    name: "BLS JOLTS",
    description: "Job Openings and Labor Turnover Survey",
    series: "Monthly, seasonally adjusted",
  },
];

export function SourcesFooter() {
  return (
    <footer className="mt-16 border-t border-[#1e293b] pt-8">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#94a3b8]">
        Data Sources & Methodology
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sources.map((source) => (
          <div
            key={source.name}
            className="rounded-lg border border-[#1e293b] bg-[#111827] p-4"
          >
            <p className="text-sm font-medium text-[#e2e8f0]">
              {source.name}
            </p>
            <p className="mt-1 text-xs text-[#94a3b8]">
              {source.description}
            </p>
            <p className="mt-1 font-mono text-xs text-[#94a3b8]">
              {source.series}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-[#94a3b8]">
        FRED data refreshed every 24 hours. LCA filings represent applications,
        not final visa grants. All values seasonally adjusted unless noted.
      </p>
    </footer>
  );
}
