import { NextRequest, NextResponse } from "next/server";
import { fetchSeries } from "@/lib/fred";
import { getCached, setCached } from "@/lib/cache";
import { MOCK_DATA } from "@/lib/mock-data";
import type { FredObservation } from "@/lib/fred";

export async function GET(request: NextRequest) {
  const seriesParam = request.nextUrl.searchParams.get("series");
  if (!seriesParam) {
    return NextResponse.json(
      { error: "Missing 'series' query parameter" },
      { status: 400 }
    );
  }

  const seriesIds = seriesParam.split(",").map((s) => s.trim());
  const result: Record<string, FredObservation[]> = {};

  const apiKey = process.env.FRED_API_KEY;
  const useMock = !apiKey || apiKey === "placeholder_get_from_fred";

  for (const id of seriesIds) {
    if (useMock) {
      result[id] = MOCK_DATA[id] ?? [];
      continue;
    }

    const cacheKey = `fred_${id}`;
    const cached = await getCached<FredObservation[]>(cacheKey);
    if (cached) {
      result[id] = cached;
      continue;
    }

    try {
      const data = await fetchSeries(id);
      await setCached(cacheKey, data);
      result[id] = data;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(
        `[FRED] Failed to fetch series ${id}: ${errMsg}`,
        err instanceof Error ? err.stack : ""
      );
      const fallback = MOCK_DATA[id] ?? [];
      console.warn(
        `[FRED] Using ${fallback.length > 0 ? "mock" : "empty"} fallback for ${id}`
      );
      result[id] = fallback;
    }
  }

  return NextResponse.json(result);
}
