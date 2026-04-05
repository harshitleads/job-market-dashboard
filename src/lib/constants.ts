export const FRED_SERIES = {
  jobOpenings: "JTSJOL",
  unemployment: "UNRATE",
  hires: "JTSHIL",
  quits: "JTSQUL",
  layoffs: "JTSLLL",
  separations: "JTSTSL",
} as const;

export type SeriesKey = keyof typeof FRED_SERIES;
export type SeriesId = (typeof FRED_SERIES)[SeriesKey];

export const COLORS = {
  background: "#0a0f1e",
  surface: "#111827",
  border: "#1e293b",
  text: "#e2e8f0",
  muted: "#94a3b8",
  accent: "#00c896",
  blue: "#3b82f6",
  orange: "#f97316",
  red: "#ef4444",
  purple: "#a855f7",
} as const;

export interface EventAnnotation {
  date: string;
  label: string;
  color: string;
}

export const EVENTS: EventAnnotation[] = [
  {
    date: "2022-03-01",
    label: "Peak job openings (~12M)",
    color: COLORS.accent,
  },
  {
    date: "2022-11-01",
    label: "ChatGPT launch + tech layoff wave",
    color: COLORS.orange,
  },
  {
    date: "2023-01-01",
    label: "Meta/Google/Amazon mass layoffs",
    color: COLORS.red,
  },
];

export const SERIES_LABELS: Record<string, string> = {
  JTSJOL: "Job Openings",
  UNRATE: "Unemployment Rate",
  JTSHIL: "Hires",
  JTSQUL: "Quits",
  JTSLLL: "Layoffs",
  JTSTSL: "Separations",
  CAUR: "CA Unemployment Rate",
  CANA: "CA Nonfarm Payrolls",
  CAICLAIMS: "CA Initial Claims",
  SANF806URN: "SF Metro Unemployment",
};

export const GEOGRAPHY_SERIES = {
  us: {
    unemployment: "UNRATE",
    payrolls: "PAYEMS",
    openings: "JTSJOL",
    hires: "JTSHIL",
    quits: "JTSQUL",
    layoffs: "JTSLLL",
  },
  california: {
    unemployment: "CAUR",
    payrolls: "CANA",
    claims: "CAICLAIMS",
  },
  bayarea: {
    unemployment: "SANF806URN",
  },
} as const;

export type Geography = "us" | "california" | "bayarea";

export const BAY_AREA_CITIES = [
  "San Francisco",
  "San Jose",
  "Mountain View",
  "Palo Alto",
  "Sunnyvale",
  "Menlo Park",
  "Cupertino",
  "Redwood City",
  "Santa Clara",
  "Oakland",
  "Berkeley",
  "Fremont",
];

export const PM_TITLE_KEYWORDS = [
  "Product Manager",
  "Product Analyst",
  "Program Manager",
  "Technical Program Manager",
  "Product Owner",
  "Product Development",
];
