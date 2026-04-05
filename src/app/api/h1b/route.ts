import { NextRequest, NextResponse } from "next/server";
import {
  getTopSponsors,
  getPMSalaries,
  getApprovalTrends,
  getTopEmployers,
  lookupCompany,
} from "@/lib/h1b-data";

export async function GET(request: NextRequest) {
  const view = request.nextUrl.searchParams.get("view") ?? "sponsors";
  const geography = request.nextUrl.searchParams.get("geography") ?? "us";
  const query = request.nextUrl.searchParams.get("q") ?? "";

  try {
    switch (view) {
      case "sponsors":
        return NextResponse.json(getTopSponsors(geography));
      case "salaries":
        return NextResponse.json(getPMSalaries(geography));
      case "approvals":
        return NextResponse.json(getApprovalTrends());
      case "employers":
        return NextResponse.json(getTopEmployers(geography));
      case "lookup":
        const result = lookupCompany(query);
        if (!result) {
          return NextResponse.json({ found: false });
        }
        return NextResponse.json({ found: true, ...result });
      default:
        return NextResponse.json(
          { error: "Invalid view parameter" },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to load H-1B data" },
      { status: 500 }
    );
  }
}
