/**
 * app/api/weather/route.ts
 * Server-side weather API — returns real weather + soil data from Open-Meteo.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherData, REGION_COORDS } from "@/lib/weather";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") ?? "default";
  const lat   = parseFloat(searchParams.get("lat") ?? "0");
  const lng   = parseFloat(searchParams.get("lng") ?? "0");
  const label = searchParams.get("label") ?? "";

  const coords = (lat && lng)
    ? { lat, lng, label: label || state }
    : (REGION_COORDS[state] ?? REGION_COORDS["default"]);

  try {
    const data = await fetchWeatherData(coords.lat, coords.lng, coords.label);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[Weather API]", err);
    return NextResponse.json(
      { success: false, error: "Weather fetch failed" },
      { status: 500 }
    );
  }
}