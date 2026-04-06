export interface FredObservation {
  date: string;
  value: number;
}

/**
 * Fill gaps in monthly time series by linear interpolation.
 * If Sep=4.4 and Nov=4.5 with Oct missing, inserts Oct=4.45.
 */
export function fillGaps(data: FredObservation[]): FredObservation[] {
  if (data.length < 2) return data;

  const sorted = [...data].sort(
    (a, b) => a.date.localeCompare(b.date)
  );

  const result: FredObservation[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    // Parse YYYY-MM-DD as integers to avoid timezone issues
    const [prevY, prevM] = prev.date.split("-").map(Number);
    const [currY, currM] = curr.date.split("-").map(Number);

    // Walk month-by-month from prev to curr, collecting gaps
    let y = prevY;
    let m = prevM;
    const gaps: string[] = [];

    while (true) {
      m++;
      if (m > 12) { m = 1; y++; }
      if (y > currY || (y === currY && m >= currM)) break;
      gaps.push(`${y}-${String(m).padStart(2, "0")}-01`);
    }

    // Interpolate each gap
    const totalSteps = gaps.length + 1;
    for (let g = 0; g < gaps.length; g++) {
      const t = (g + 1) / totalSteps;
      const interpolated = prev.value + (curr.value - prev.value) * t;
      result.push({
        date: gaps[g],
        value: Math.round(interpolated * 100) / 100,
      });
    }

    result.push(curr);
  }

  return result;
}

const FRED_BASE_URL =
  "https://api.stlouisfed.org/fred/series/observations";

export async function fetchSeries(
  seriesId: string,
  startDate = "2021-01-01"
): Promise<FredObservation[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey || apiKey === "placeholder_get_from_fred") {
    throw new Error("FRED_API_KEY not configured");
  }

  const today = new Date().toISOString().split("T")[0];
  const url = new URL(FRED_BASE_URL);
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("observation_start", startDate);
  url.searchParams.set("limit", "100000");
  url.searchParams.set("sort_order", "asc");
  url.searchParams.set("realtime_start", today);
  url.searchParams.set("realtime_end", today);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const fetchUrl = url.toString();
    console.log(`[FRED] Fetching ${seriesId}`);

    const res = await globalThis.fetch(fetchUrl, {
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `FRED API ${res.status} for ${seriesId}: ${res.statusText} - ${body.slice(0, 200)}`
      );
    }

    const data = await res.json();
    const observations: { date: string; value: string }[] =
      data.observations ?? [];

    const result = observations
      .filter((obs) => obs.value !== ".")
      .map((obs) => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }));

    console.log(
      `[FRED] ${seriesId}: ${result.length} obs, last=${result[result.length - 1]?.date ?? "none"}`
    );

    return result;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`FRED API timeout (30s) for ${seriesId}`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
