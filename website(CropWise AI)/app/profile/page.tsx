/**
 * app/profile/page.tsx
 * Farm Profile — fully integrated with Firebase + real GPS location.
 * Auto-fills from Firebase Auth + GPS — user manually fills as little as possible.
 */

"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import IntelligenceScore from "@/components/profile/IntelligenceScore";
import {
  FileText, Download, ShieldCheck, X, Plus, Map,
  Save, Loader2, CheckCircle2, LocateFixed, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserProfile, updateUserProfile } from "@/lib/firebase/user-profile";
import { useLocation } from "@/lib/hooks/useLocation";
import type { FirestoreUser } from "@/lib/firestore-schema";

const INDIAN_STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

const SOIL_TYPES = [
  "Alluvial Soil","Black Cotton Soil","Red & Laterite Soil",
  "Loamy Silt","Loamy Soil","Sandy Soil","Clay Soil","Peaty Soil",
];

const ALL_CROPS = [
  "Winter Wheat","Soybeans","Maize","Rice","Cotton",
  "Mustard","Sugarcane","Tomato","Potato","Groundnut",
  "Sunflower","Tur (Arhar)","Moong","Chilli","Onion",
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी"  },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "mr", label: "मराठी"  },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்"  },
];

// ─── Intelligence score calculator ───────────────────────────────────────────
// Based on how complete the profile is + activity

function calculateScore(profile: Partial<FirestoreUser>): number {
  let score = 0;
  if (profile.farmName)                      score += 15;
  if (profile.landHolding && profile.landHolding > 0) score += 15;
  if (profile.location?.state)               score += 15;
  if (profile.location?.district)            score += 10;
  if (profile.location?.pincode)             score += 5;
  if (profile.primaryCrops?.length)          score += 20;
  if (profile.preferredLanguage && profile.preferredLanguage !== "en") score += 5;
  if (profile.isOnboarded)                   score += 15;
  return Math.min(score, 100);
}

// ─── Crop tag ─────────────────────────────────────────────────────────────────

function CropTag({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2ea82e]/15 border border-[#2ea82e]/30 text-[#4dc24d] text-xs font-semibold uppercase tracking-wide">
      {name}
      <button onClick={onRemove} className="hover:text-rose-400 transition-colors ml-0.5">
        <X className="w-3 h-3" strokeWidth={2.5} />
      </button>
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user }  = useAuth();
  const { location, loading: locationLoading } = useLocation(user?.uid);

  // Form state
  const [farmName,   setFarmName]   = useState("");
  const [landSize,   setLandSize]   = useState("");
  const [soilType,   setSoilType]   = useState("");
  const [crops,      setCrops]      = useState<string[]>([]);
  const [state,      setState_]     = useState("");
  const [district,   setDistrict]   = useState("");
  const [pincode,    setPincode]    = useState("");
  const [language,   setLanguage]   = useState("en");
  const [lat,        setLat]        = useState("");
  const [lng,        setLng]        = useState("");
  const [showCropPicker, setShowCropPicker] = useState(false);

  // UI state
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [score,      setScore]      = useState(0);
  const [profile,    setProfile]    = useState<FirestoreUser | null>(null);

  // ── Load profile from Firebase ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        setFarmName(p.farmName || "");
        setLandSize(p.landHolding ? String(p.landHolding) : "");
        setSoilType("");
        setCrops(p.primaryCrops || []);
        setState_(p.location?.state || "");
        setDistrict(p.location?.district || "");
        setPincode(p.location?.pincode || "");
        setLanguage(p.preferredLanguage || "en");
        if (p.location?.coordinates) {
          setLat(String(p.location.coordinates.lat));
          setLng(String(p.location.coordinates.lng));
        }
        setScore(calculateScore(p));
      } else {
        // New user — pre-fill from Auth
        setFarmName(user.displayName ? `${user.displayName}'s Farm` : "");
      }
      setLoading(false);
    });
  }, [user]);

  // ── Auto-fill GPS coordinates when location detected ──────────────────
  useEffect(() => {
    if (!location) return;
    // Only auto-fill if user hasn't set them manually
    if (!lat && !lng) {
      setLat(String(location.lat.toFixed(4)));
      setLng(String(location.lng.toFixed(4)));
    }
    // Auto-fill state if empty
    if (!state && location.state) {
      setState_(location.state);
    }
    // Auto-fill district from label (e.g. "Ludhiana, Punjab" → "Ludhiana")
    if (!district && location.label.includes(",")) {
      setDistrict(location.label.split(",")[0].trim());
    }
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeCrop = (c: string) => setCrops((p: string[]) => p.filter((x: string) => x !== c));
  const addCrop    = (c: string) => {
    if (!crops.includes(c)) setCrops((p: string[]) => [...p, c]);
    setShowCropPicker(false);
  };

  // ── Save to Firebase ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated: Partial<Omit<FirestoreUser, "uid" | "createdAt">> = {
        farmName,
        landHolding:       parseFloat(landSize) || 0,
        primaryCrops:      crops,
        preferredLanguage: language as FirestoreUser["preferredLanguage"],
        isOnboarded:       true,
        location: {
          state:    state,
          district: district,
          pincode:  pincode,
          ...(lat && lng ? {
            coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
          } : {}),
        },
      };
      await updateUserProfile(user.uid, updated);

      // Recalculate score
      const updatedProfile = { ...profile, ...updated } as FirestoreUser;
      setScore(calculateScore(updatedProfile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // ── Get location button ──────────────────────────────────────────────
  const detectLocation = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setLat(latitude.toFixed(4));
      setLng(longitude.toFixed(4));
      // Reverse geocode
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "Accept-Language": "en-US" } }
        );
        const data = await res.json();
        const addr = data.address ?? {};
        if (addr.state)   setState_(addr.state);
        if (addr.city || addr.town) setDistrict(addr.city || addr.town);
        if (addr.postcode) setPincode(addr.postcode);
      } catch { /* ignore */ }
    }, console.error, { enableHighAccuracy: true });
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Farmer";
  const subtitle    = [district, state].filter(Boolean).join(", ") || "Update your location below";

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2ea82e]/20 border border-[#2ea82e]/40 flex items-center justify-center overflow-hidden">
              {user?.photoURL
                ? <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                : <User className="w-5 h-5 text-[#4dc24d]" strokeWidth={1.5} />
              }
            </div>
            <div>
              <h1 className="text-base font-bold text-[#e8f5e9] leading-tight">
                {farmName || `${displayName}'s Farm`}
              </h1>
              <p className="text-xs text-[#5a7460]">{subtitle}</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className={cn("btn-primary gap-2 disabled:opacity-60", saved && "bg-[#1a6b1a]")}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" />
             : saved  ? <CheckCircle2 className="w-4 h-4" />
             : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : "Update Profile"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-5 h-5 text-[#4dc24d] animate-spin" />
            <p className="text-sm text-[#5a7460]">Loading your profile...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

            {/* ── LEFT: General Information ──────────────────── */}
            <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-6 space-y-5">
              <div className="flex items-center gap-2 pb-1 border-b border-[#1e2d20]">
                <FileText className="w-4 h-4 text-[#4dc24d]" strokeWidth={2} />
                <h2 className="text-base font-bold text-[#e8f5e9]">General Information</h2>
              </div>

              {/* Auto-filled from Auth notice */}
              {user?.displayName && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2ea82e]/5 border border-[#2ea82e]/20 text-xs text-[#4dc24d]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Signed in as <span className="font-semibold">{user.email}</span> via Google
                </div>
              )}

              {/* Farm Name */}
              <div>
                <label className="block text-xs font-medium text-[#5a7460] mb-1.5">Farm Name</label>
                <input type="text" value={farmName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFarmName(e.target.value)}
                  placeholder={`${displayName}'s Farm`}
                  className="input-field text-sm" />
              </div>

              {/* Size + Soil Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5a7460] mb-1.5">Size (Acres)</label>
                  <div className="relative">
                    <input type="number" value={landSize} min="0" step="0.5"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLandSize(e.target.value)}
                      placeholder="e.g. 5.0" className="input-field text-sm pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5a7460] font-medium">AC</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5a7460] mb-1.5">Soil Type</label>
                  <select value={soilType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSoilType(e.target.value)}
                    className="input-field text-sm">
                    <option value="">Select...</option>
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Primary Crops */}
              <div>
                <label className="block text-xs font-medium text-[#5a7460] mb-2">Primary Crops</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {crops.map((c: string) => (
                    <React.Fragment key={c}>
                      <CropTag name={c} onRemove={() => removeCrop(c)} />
                    </React.Fragment>
                  ))}
                  <div className="relative">
                    <button onClick={() => setShowCropPicker((p: boolean) => !p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#3d5c40] text-xs font-semibold text-[#5a7460] hover:border-[#4dc24d] hover:text-[#4dc24d] transition-colors">
                      <Plus className="w-3 h-3" strokeWidth={2.5} /> Add Crop
                    </button>
                    {showCropPicker && (
                      <div className="absolute z-20 top-full left-0 mt-1 w-44 rounded-xl bg-[#0d1a10] border border-[#2a3d2c] shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {ALL_CROPS.filter(c => !crops.includes(c)).map(c => (
                          <button key={c} onClick={() => addCrop(c)}
                            className="w-full text-left text-xs text-[#94a896] px-3 py-2.5 hover:bg-[#182419] hover:text-[#e8f5e9] transition-colors">
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-medium text-[#5a7460] mb-1.5">Preferred Language</label>
                <select value={language}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
                  className="input-field text-sm">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>

              {/* Location section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#5a7460]">Location</label>
                  <button onClick={detectLocation}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#4dc24d] hover:text-[#82d882] transition-colors">
                    <LocateFixed className="w-3.5 h-3.5" />
                    {locationLoading ? "Detecting..." : "Use GPS"}
                  </button>
                </div>

                {/* State + District */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#5a7460] mb-1">State</label>
                    <select value={state}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setState_(e.target.value)}
                      className="input-field text-sm">
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7460] mb-1">District</label>
                    <input type="text" value={district}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistrict(e.target.value)}
                      placeholder="e.g. Ludhiana"
                      className="input-field text-sm" />
                  </div>
                </div>

                {/* Pincode + Coordinates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#5a7460] mb-1">Pincode</label>
                    <input type="text" value={pincode} maxLength={6}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPincode(e.target.value)}
                      placeholder="e.g. 141001"
                      className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7460] mb-1">GPS Coordinates</label>
                    <div className="input-field text-xs text-[#5a7460] flex items-center gap-1 cursor-default">
                      <Map className="w-3 h-3 flex-shrink-0" />
                      {lat && lng
                        ? `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lng).toFixed(4)}°E`
                        : <span className="text-[#3d4d3e]">Click "Use GPS"</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Satellite map */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#2a3d2c]">
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(135deg,#0d2e0d 0%,#1a4d1a 25%,#2a6b2a 50%,#1f5c1f 75%,#0f3a0f 100%)" }} />
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: "repeating-linear-gradient(30deg,#4dc24d 0,#4dc24d 1px,transparent 0,transparent 40px),repeating-linear-gradient(120deg,#4dc24d 0,#4dc24d 1px,transparent 0,transparent 40px)" }} />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0b1410]/80 border border-[#2ea82e]/40 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4dc24d] animate-pulse" />
                  <span className="text-[10px] font-semibold text-[#4dc24d] uppercase tracking-wider">
                    {location?.label ?? "Detecting location..."}
                  </span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Score + Documents ──────────────────── */}
            <div className="space-y-5">

              {/* Farm Intelligence Score — calculated from profile completeness */}
              <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-6 flex flex-col items-center">
                <h2 className="text-sm font-semibold text-[#e8f5e9] mb-1 self-start">
                  Farm Intelligence Score
                </h2>
                <p className="text-xs text-[#5a7460] self-start mb-5">
                  Based on profile completeness
                </p>
                <IntelligenceScore score={score} />

                {/* Completion hints */}
                {score < 100 && (
                  <div className="w-full mt-4 space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5a7460] mb-2">
                      Improve your score
                    </p>
                    {!farmName   && <p className="text-xs text-[#5a7460]">• Add farm name (+15)</p>}
                    {!landSize   && <p className="text-xs text-[#5a7460]">• Add land size (+15)</p>}
                    {!state      && <p className="text-xs text-[#5a7460]">• Add your state (+15)</p>}
                    {!district   && <p className="text-xs text-[#5a7460]">• Add district (+10)</p>}
                    {crops.length === 0 && <p className="text-xs text-[#5a7460]">• Add crops (+20)</p>}
                  </div>
                )}
              </div>

              {/* Account Info — from Firebase Auth (auto-filled) */}
              <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-5 space-y-3">
                <h2 className="text-sm font-semibold text-[#e8f5e9]">Account</h2>
                <div className="space-y-2">
                  {[
                    { label: "Email",        value: user?.email ?? "—"                        },
                    { label: "Name",         value: user?.displayName ?? "Not set"            },
                    { label: "Member since", value: user?.metadata.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString("en-IN")
                        : "—"
                    },
                    { label: "Last sign in", value: user?.metadata.lastSignInTime
                        ? new Date(user.metadata.lastSignInTime).toLocaleDateString("en-IN")
                        : "—"
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-[#1e2d20] last:border-0">
                      <span className="text-xs text-[#5a7460]">{label}</span>
                      <span className="text-xs font-medium text-[#e8f5e9] truncate max-w-[160px]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blockchain Verified */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#182419] border border-[#2a3d2c]">
                <ShieldCheck className="w-5 h-5 text-[#4dc24d] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-xs font-bold text-[#e8f5e9] mb-0.5">Data Secured</p>
                  <p className="text-[11px] text-[#5a7460] leading-relaxed">
                    Your farm data is encrypted and stored securely in Firebase. Only you can access it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}