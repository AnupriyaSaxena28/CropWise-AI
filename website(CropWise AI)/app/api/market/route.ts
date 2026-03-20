/**
 * app/api/market/route.ts
 * Server-side market prices API route.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchMandiPrices, fetchHistoricalPrices } from "@/lib/market-prices";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const type  = searchParams.get("type") ?? "current";   // "current" | "historical"
  const crop  = searchParams.get("crop") ?? "Wheat";
  const state = searchParams.get("state") ?? undefined;

  try {
    if (type === "historical") {
      const data = await fetchHistoricalPrices(crop);
      return NextResponse.json({ success: true, data });
    }
    const data = await fetchMandiPrices(state);
    return NextResponse.json({ success: true, data }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err) {
    console.error("[Market API]", err);
    return NextResponse.json({ success: false, error: "Market data fetch failed" }, { status: 500 });
  }
}