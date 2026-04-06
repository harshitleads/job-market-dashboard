import { NextRequest, NextResponse } from "next/server";
import { fetchSeries } from "@/lib/fred";
import { getCached, setCached } from "@/lib/cache";
import { MOCK_DATA } from "@/lib/mock-data";
import snapshotData from "@/data/fred-snapshot.json";
import type { FredObservation } from "@/lib/fred";

const snapshot = snapshotData as Record<string, FredObservation[]>;

export async function GET(request: NextRequest) {
  const seriesParam = request.nextUrl.searchParams.get("series");
  if (!seriesParam) {
    return NextResponse.json(
      { error: "Missing 'series' query parameter" },
      { status: 400 }
    );
  }

  const seriesIds = seriesParam.split(",").map((s) => s.trim());
  const bustCache = request.nextUrl.searchParams.get("bust") === "true";
  const result: Record<string, FredObservation[]> = {};

  const apiKey = process.env.FRED_API_KEY;
  const useMock = !apiKey || apiKey === "placeholder_get_from_fred";

  for (const id of seriesIds) {
    if (useMock) {
      result[id] = snapshot[id] ?? MOCK_DATA[id] ?? [];
      continue;
    }

    // Try file cache first (unless busting)
    if (!bustCache) {
      const cached = await getCached<FredObservation[]>(`fred_${id}`);
      if (cached) {
        result[id] = cached;
        continue;
      }
    }

    // Try live FRED API
    try {
      const data = await fetchSeries(id);
      await setCached(`fred_${id}`, data);
      result[id] = data;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[FRED] ${id}: ${errMsg}`);
      // Fall back to committed snapshot, then mock
      result[id] = snapshot[id] ?? MOCK_DATA[id] ?? [];
    }
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export const dynamic = "force-dynamic";
