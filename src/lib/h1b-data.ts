import lcaData from "@/data/h1b/lca-processed.json";
import uscisData from "@/data/h1b/uscis-processed.json";
import { BAY_AREA_CITIES } from "./constants";

export interface Sponsor {
  employer: string;
  totalFilings: number;
  pmFilings: number;
  avgSalary: number;
  state: string;
  approvalRate?: number;
}

export interface PMSalary {
  employer: string;
  jobTitle: string;
  salaryFrom: number;
  salaryTo: number;
  city: string;
  state?: string;
  year: number;
}

export interface FilingYear {
  year: number;
  total: number;
  certified: number;
  denied: number;
}

export interface ApprovalTrend {
  year: string;
  initialApproved: number;
  initialDenied: number;
  continuingApproved: number;
  continuingDenied: number;
}

export interface TopEmployer {
  employer: string;
  totalApproved: number;
  totalDenied: number;
  approvalRate: number;
  state: string;
  naics: string;
}

function normalizeEmployer(name: string): string {
  return name
    .toUpperCase()
    .replace(/\s+(LLC|INC|CORP|CO|LTD|LP|LLP|INCORPORATED|CORPORATION)\.?$/g, "")
    .replace(/[.,]/g, "")
    .trim();
}

const bayAreaCitiesUpper = new Set(BAY_AREA_CITIES.map((c) => c.toUpperCase()));

function matchesGeography(
  state: string,
  city: string | undefined,
  geography: string
): boolean {
  if (geography === "us") return true;
  if (geography === "california") return state?.toUpperCase() === "CA";
  if (geography === "bayarea") {
    return (
      state?.toUpperCase() === "CA" &&
      !!city &&
      bayAreaCitiesUpper.has(city.toUpperCase())
    );
  }
  return true;
}

export function getTopSponsors(geography = "us"): Sponsor[] {
  // Sponsors are employer-level (no worksite city), so Bay Area falls back to CA
  const geoForSponsors = geography === "bayarea" ? "california" : geography;
  const sponsors = (lcaData.topSponsors as Sponsor[]).filter((s) =>
    matchesGeography(s.state, undefined, geoForSponsors)
  );

  // Join with USCIS approval rate data
  const uscisMap = new Map<string, number>();
  for (const emp of uscisData.topEmployers as TopEmployer[]) {
    uscisMap.set(normalizeEmployer(emp.employer), emp.approvalRate);
  }

  return sponsors.map((s) => ({
    ...s,
    approvalRate: uscisMap.get(normalizeEmployer(s.employer)),
  }));
}

// Known CA cities that appear in PM salary data but aren't in the Bay Area list
const knownCACities = new Set([
  ...BAY_AREA_CITIES.map((c) => c.toUpperCase()),
  "LOS ANGELES",
  "SAN DIEGO",
  "SACRAMENTO",
  "LOS GATOS",
  "IRVINE",
  "BURLINGAME",
  "SOUTH SAN FRANCISCO",
  "SAN MATEO",
  "FOSTER CITY",
  "MILPITAS",
  "PLEASANTON",
  "WALNUT CREEK",
  "EMERYVILLE",
  "HALF MOON BAY",
  "DALY CITY",
  "SAN CARLOS",
  "BELMONT",
  "SAN BRUNO",
  "CAMPBELL",
  "SANTA MONICA",
  "PASADENA",
]);

function inferIsCA(s: PMSalary): boolean {
  if (s.state) return s.state.toUpperCase() === "CA";
  if (!s.city) return false;
  const cityUp = s.city.toUpperCase();
  return knownCACities.has(cityUp) || bayAreaCitiesUpper.has(cityUp);
}

export function getPMSalaries(geography = "us"): PMSalary[] {
  return (lcaData.pmSalaries as PMSalary[]).filter((s) => {
    if (geography === "us") return true;
    if (geography === "california") return inferIsCA(s);
    if (geography === "bayarea") {
      return bayAreaCitiesUpper.has(s.city?.toUpperCase());
    }
    return true;
  });
}

export function getApprovalTrends(): ApprovalTrend[] {
  return uscisData.approvalTrends as ApprovalTrend[];
}

export function getTopEmployers(geography = "us"): TopEmployer[] {
  return (uscisData.topEmployers as TopEmployer[]).filter((e) =>
    matchesGeography(e.state, undefined, geography)
  );
}

export function lookupCompany(query: string): {
  lca: Sponsor | null;
  uscis: TopEmployer | null;
  salaries: PMSalary[];
} | null {
  if (!query || query.length < 2) return null;

  const q = query.toUpperCase();
  const lcaMatch = (lcaData.topSponsors as Sponsor[]).find((s) =>
    s.employer.toUpperCase().includes(q)
  );
  const uscisMatch = (uscisData.topEmployers as TopEmployer[]).find((e) =>
    e.employer.toUpperCase().includes(q)
  );
  const salaries = (lcaData.pmSalaries as PMSalary[]).filter((s) =>
    s.employer.toUpperCase().includes(q)
  );

  if (!lcaMatch && !uscisMatch && salaries.length === 0) return null;

  return {
    lca: lcaMatch ?? null,
    uscis: uscisMatch ?? null,
    salaries,
  };
}
