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

  const url = new URL(FRED_BASE_URL);
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("observation_start", startDate);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(
      `FRED API error for ${seriesId}: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  const observations: { date: string; value: string }[] =
    data.observations ?? [];

  return observations
    .filter((obs) => obs.value !== ".")
    .map((obs) => ({
      date: obs.date,
      value: parseFloat(obs.value),
    }));
}
