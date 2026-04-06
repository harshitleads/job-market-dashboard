export interface FredObservation {
  date: string;
  value: number;
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
