/**
 * lib/hooks/useLocation.ts
 * Shared hook — gets real GPS location once and caches in sessionStorage.
 * Used by Dashboard, Weather, and any page needing user's location.
 *
 * Flow:
 *  1. Check sessionStorage cache (avoid repeated GPS prompts)
 *  2. Try browser GPS
 *  3. Reverse geocode with Nominatim (OpenStreetMap) — free, no key
 *  4. Fall back to Firebase profile state
 *  5. Final fallback: Bhopal default
 */

"use client";

import { useState, useEffect } from "react";
import { REGION_COORDS } from "@/lib/weather";
import { getUserProfile } from "@/lib/firebase/user-profile";

export interface LocationData {
  lat:   number;
  lng:   number;
  label: string;  // "New Delhi, Delhi"
  state: string;  // "Delhi" — for matching REGION_COORDS
}

const CACHE_KEY = "cropwise_user_location";

async function reverseGeocode(lat: number, lng: number): Promise<{ label: string; state: string }> {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en-US,en" } }
    );
    const data = await res.json();
    const addr  = data.address ?? {};
    const city  = addr.city || addr.town || addr.village || addr.county || addr.suburb || "";
    const state = addr.state || "";
    const label = city && state ? `${city}, ${state}` : state || "Your Location";
    return { label, state };
  } catch {
    return { label: "Your Location", state: "" };
  }
}

export function useLocation(userId?: string) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!userId) return;

    const detect = async () => {
      setLoading(true);

      // ── 1. Check session cache ──────────────────────────────────
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as LocationData;
          setLocation(parsed);
          setLoading(false);
          return;
        } catch { /* ignore corrupt cache */ }
      }

      // ── 2. Try browser GPS ──────────────────────────────────────
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            const { label, state } = await reverseGeocode(lat, lng);
            const loc: LocationData = { lat, lng, label, state };
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(loc));
            setLocation(loc);
            setLoading(false);
          },
          async () => {
            // GPS denied → profile fallback
            setError("Using profile location (GPS denied)");
            await loadFromProfile();
          },
          { timeout: 8000, enableHighAccuracy: false }
        );
      } else {
        await loadFromProfile();
      }
    };

    const loadFromProfile = async () => {
      const profile = await getUserProfile(userId!);
      const state   = profile?.location?.state ?? "";
      const coords  = REGION_COORDS[state] ?? REGION_COORDS["default"];

      // If profile has pincode/district, try to get better label
      let label = coords.label;
      if (profile?.location?.district && profile.location.state) {
        label = `${profile.location.district}, ${profile.location.state}`;
      }

      const loc: LocationData = { lat: coords.lat, lng: coords.lng, label, state };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(loc));
      setLocation(loc);
      setLoading(false);
    };

    detect();
  }, [userId]);

  // Force refresh GPS (called on "Refresh" button click)
  const refresh = () => {
    sessionStorage.removeItem(CACHE_KEY);
    setLocation(null);
    setLoading(true);

    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const { label, state } = await reverseGeocode(lat, lng);
        const loc: LocationData = { lat, lng, label, state };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(loc));
        setLocation(loc);
        setLoading(false);
      },
      () => setLoading(false),
      { timeout: 8000 }
    );
  };

  return { location, loading, error, refresh };
}