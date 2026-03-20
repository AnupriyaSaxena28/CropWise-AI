/**
 * app/dashboard/page.tsx — Real Firebase + Weather API integration
 */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts";
import { MapPin, Droplets, Wind, TrendingUp, CloudRain, ClipboardList, MessageSquare, ScanSearch, Store, BrainCircuit, Loader2, RefreshCw, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserActivityLogs, type ActivityLogEntry } from "@/lib/firebase/activity-log";
import { useLocation } from "@/lib/hooks/useLocation";
import type { MarketPrice } from "@/types";
import type { ExtendedWeatherData } from "@/lib/weather";

const QUICK_ACTIONS = [
  { href: "/activity-log",   icon: ClipboardList, label: "Log Activity",  bg: "bg-blue-900/40  border-blue-800/40",  ic: "text-blue-400"  },
  { href: "/chat",           icon: MessageSquare, label: "Ask AI",        bg: "bg-[#2ea82e]/15 border-[#2ea82e]/30", ic: "text-[#4dc24d]" },
  { href: "/pest-diagnosis", icon: ScanSearch,    label: "Scan Pest",     bg: "bg-rose-900/40  border-rose-800/40",  ic: "text-rose-400"  },
  { href: "/market",         icon: Store,         label: "Check Mandi",   bg: "bg-amber-900/40 border-amber-800/40", ic: "text-amber-400" },
];

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1a10] border border-[#2a3d2c] rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] text-[#5a7460] mb-1 font-medium">{label}</p>
      {payload.map((p: import('recharts').Payload<number, string>) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}{String(p.name).includes("Moisture") ? "%" : "mm"}
        </p>
      ))}
    </div>
  );
}

const ACT_ICONS: Record<string, React.FC<{ className?: string; strokeWidth?: number }>> = {
  pest_diagnosis: ScanSearch, chat_message: MessageSquare,
  crop_recommendation: BrainCircuit, market_query: TrendingUp,
  weather_check: CloudRain, scheme_search: ClipboardList, default: Activity,
};
const ACT_COLORS: Record<string, string> = {
  pest_diagnosis: "text-rose-400 bg-rose-400/10", chat_message: "text-[#4dc24d] bg-[#2ea82e]/10",
  crop_recommendation: "text-amber-400 bg-amber-400/10", market_query: "text-blue-400 bg-blue-400/10",
  weather_check: "text-sky-400 bg-sky-400/10",
};

function timeAgo(entry: ActivityLogEntry): string {
  const ts = entry.createdAt as { toDate?: () => Date; seconds?: number } | undefined;
  const date = ts?.toDate?.() ?? (ts?.seconds ? new Date(ts.seconds * 1000) : new Date());
  const diff = Date.now() - date.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return `${Math.floor(diff / 86400000)} days ago`;
}

const CHART_DATA = [
  { day:"Day 1",  "Rainfall (mm)":18, "Moisture Content (%)":42 },
  { day:"Day 5",  "Rainfall (mm)":12, "Moisture Content (%)":55 },
  { day:"Day 10", "Rainfall (mm)":22, "Moisture Content (%)":48 },
  { day:"Day 15", "Rainfall (mm)":30, "Moisture Content (%)":68 },
  { day:"Day 20", "Rainfall (mm)":8,  "Moisture Content (%)":60 },
  { day:"Day 25", "Rainfall (mm)":25, "Moisture Content (%)":72 },
  { day:"Day 30", "Rainfall (mm)":15, "Moisture Content (%)":65 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [weather,    setWeather]    = useState<ExtendedWeatherData | null>(null);
  const [prices,     setPrices]     = useState<MarketPrice[]>([]);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [chartView,  setChartView]  = useState<"Month"|"Week">("Month");
  const [loadingW,   setLoadingW]   = useState(true);
  const [loadingP,   setLoadingP]   = useState(true);
  const { location, loading: locationLoading } = useLocation(user?.uid);

  // Load activity logs
  useEffect(() => {
    if (!user) return;
    getUserActivityLogs(user.uid, 5).then((logs: import('@/lib/firebase/activity-log').ActivityLogEntry[]) => setActivities(logs));
  }, [user]);

  // Fetch weather when location is ready
  useEffect(() => {
    if (!location) return;
    setLoadingW(true);
    fetch(`/api/weather?lat=${location.lat}&lng=${location.lng}&label=${encodeURIComponent(location.label)}`)
      .then(r => r.json()).then(d => { if (d.success) setWeather(d.data); })
      .catch(console.error).finally(() => setLoadingW(false));
  }, [location]);

  useEffect(() => {
    setLoadingP(true);
    fetch("/api/market?type=current")
      .then(r => r.json()).then(d => { if (d.success) setPrices(d.data.slice(0, 4)); })
      .catch(console.error).finally(() => setLoadingP(false));
  }, []);

  const wheatPrice = prices.find((p: import('@/types').MarketPrice) => p.cropName === "Wheat");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = user?.displayName?.split(" ")[0] ?? "Farmer";

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-[#e8f5e9]">{greeting}, {displayName}</h1>
          <p className="text-xs text-[#5a7460] mt-0.5">{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
        </div>

        {/* Weather + AI Card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] px-6 py-5">
            {(loadingW || locationLoading) ? (
              <div className="flex items-center gap-3 h-28"><Loader2 className="w-5 h-5 text-[#4dc24d] animate-spin" /><p className="text-sm text-[#5a7460]">{locationLoading ? "Detecting your location..." : "Fetching live weather..."}</p></div>
            ) : weather ? (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-3"><MapPin className="w-3.5 h-3.5 text-[#4dc24d]" strokeWidth={2}/><span className="text-xs font-medium text-[#94a896]">{location?.label ?? weather.location} • Today</span></div>
                  <p className="text-5xl font-bold text-[#e8f5e9] leading-none mb-1.5">{weather.temperature}°C</p>
                  <p className="text-sm text-[#94a896] mb-5">{weather.condition}</p>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5 text-sm"><Droplets className="w-4 h-4 text-blue-400" /><span className="text-[#94a896]">{weather.humidity}% Humidity</span></div>
                    <div className="flex items-center gap-1.5 text-sm"><Wind className="w-4 h-4 text-[#5a7460]" /><span className="text-[#94a896]">{weather.windSpeed} km/h NW</span></div>
                  </div>
                </div>
                <div className="w-20 h-20 rounded-xl bg-[#182419] border border-[#2a3d2c] flex items-center justify-center">
                  <CloudRain className="w-10 h-10 text-[#4dc24d]" strokeWidth={1}/>
                </div>
              </div>
            ) : <p className="text-sm text-[#5a7460]">Weather unavailable</p>}
          </div>

          <div className="rounded-xl p-5 relative overflow-hidden" style={{background:"linear-gradient(135deg,#1a4d1a 0%,#0c330c 100%)",border:"1px solid rgba(46,168,46,0.2)"}}>
            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-[#2ea82e]/20 text-[#82d882] border border-[#2ea82e]/30 mb-3">AI Recommendation</span>
            <p className="text-sm font-semibold text-white leading-relaxed mb-4">
              {weather?.precipitation && weather.precipitation > 5
                ? `Rain expected (${weather.precipitation}mm). Delay spray operations and check drainage.`
                : "Conditions are suitable for field operations. Optimal time for fertiliser application."}
            </p>
            <Link href="/weather" className="flex items-center justify-center gap-2 py-2 rounded-lg border border-white/20 text-white text-xs font-medium hover:bg-white/10 transition-colors">View Detailed Analysis</Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-4">
            <span className="text-[9px] font-bold uppercase text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded">Wheat MSP</span>
            <p className="text-[10px] text-[#5a7460] uppercase tracking-wider mt-2 mb-1">Current Market Price</p>
            {loadingP ? <div className="shimmer h-7 w-24 rounded" /> : (
              <>
                <p className="text-2xl font-bold text-[#e8f5e9]">₹{wheatPrice?.currentPrice?.toLocaleString("en-IN") ?? "—"}/q</p>
                <p className={cn("text-xs mt-1 flex items-center gap-1",(wheatPrice?.priceChangePercent ?? 0)>=0?"text-[#4dc24d]":"text-rose-400")}>
                  <TrendingUp className="w-3 h-3" />{(wheatPrice?.priceChangePercent ?? 0).toFixed(1)}% vs MSP
                </p>
              </>
            )}
          </div>
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-4">
            <p className="text-[10px] text-[#5a7460] uppercase tracking-wider mb-1">Last 24h Rainfall</p>
            <p className="text-2xl font-bold text-[#e8f5e9]">{weather ? `${weather.precipitation}mm` : "—"}</p>
            {weather && <div className="flex gap-1 mt-2">{(weather?.forecast ?? []).slice(0,5).map((d: import('@/types').WeatherForecastDay, i: number)=>(<div key={i} className="flex-1 h-8 bg-[#1e2d20] rounded-sm overflow-hidden flex items-end"><div className="w-full bg-[#2ea82e]/60 rounded-sm" style={{height:`${d.precipitationChance}%`}}/></div>))}</div>}
          </div>
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-4">
            <p className="text-[10px] text-[#5a7460] uppercase tracking-wider mb-1">Pest Risk Alert</p>
            <p className="text-2xl font-bold text-[#4dc24d]">Low Risk</p>
            <p className="text-xs text-[#5a7460] mt-1 flex items-center gap-1"><RefreshCw className="w-3 h-3"/>Scanned {activities.filter((a: import('@/lib/firebase/activity-log').ActivityLogEntry)=>a.type==="pest_diagnosis").length > 0 ? "recently" : "never"}</p>
          </div>
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-4">
            <p className="text-[10px] text-[#5a7460] uppercase tracking-wider mb-1">Soil Moisture</p>
            <p className="text-2xl font-bold text-[#e8f5e9]">{weather ? `${weather.soilMoisture}%` : "—"}</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#1e2d20] overflow-hidden"><div className="h-full rounded-full bg-[#2ea82e]" style={{width: `${weather?.soilMoisture ?? 0}%`}}/></div>
          </div>
        </div>

        {/* Quick actions + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a7460] mb-4">Quick Actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map(({href,icon:Icon,label,bg,ic})=>(
                <Link key={href} href={href} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5",bg)}>
                  <div className="w-10 h-10 rounded-xl bg-[#0b1410]/40 flex items-center justify-center"><Icon className={cn("w-5 h-5",ic)} strokeWidth={2}/></div>
                  <span className="text-xs font-medium text-[#94a896]">{label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a7460] mb-4">Recent Activity</p>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Activity className="w-8 h-8 text-[#2a3d2c] mb-2" strokeWidth={1}/>
                <p className="text-xs text-[#3d4d3e]">No activity yet</p>
                <p className="text-[10px] text-[#2a3d2c] mt-1">Start using the AI tools</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((a: import('@/lib/firebase/activity-log').ActivityLogEntry) => {
                  const Icon = ACT_ICONS[a.type] ?? ACT_ICONS.default;
                  const col  = ACT_COLORS[a.type] ?? "text-[#4dc24d] bg-[#2ea82e]/10";
                  return (
                    <div key={a.id} className="flex items-start gap-2.5">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",col)}><Icon className="w-3 h-3" strokeWidth={2}/></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#e8f5e9] truncate">{a.title}</p>
                        <p className="text-[10px] text-[#5a7460]">{timeAgo(a)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link href="/activity-log" className="block mt-3 text-xs font-medium text-[#4dc24d] hover:text-[#82d882] text-center">View All Activity</Link>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-5">
          <div className="flex items-start justify-between mb-5">
            <div><h2 className="text-sm font-semibold text-[#e8f5e9]">Moisture &amp; Rainfall Analysis</h2><p className="text-xs text-[#5a7460] mt-0.5">Historical data for the last 30 days</p></div>
            <div className="flex rounded-lg overflow-hidden border border-[#2a3d2c]">
              {(["Month","Week"] as const).map(v=>(
                <button key={v} onClick={()=>setChartView(v)} className={cn("px-3 py-1.5 text-xs font-medium transition-colors",chartView===v?"bg-[#2ea82e] text-[#0b1410]":"text-[#5a7460] hover:text-[#94a896]")}>{v}</button>
              ))}
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA} margin={{top:5,right:5,left:-25,bottom:0}} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d20" vertical={false}/>
                <XAxis dataKey="day" tick={{fontSize:10,fill:"#5a7460"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#5a7460"}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTooltip/>} cursor={{fill:"rgba(46,168,46,0.05)"}}/>
                <Bar dataKey="Rainfall (mm)" fill="#94a3b8" radius={[3,3,0,0]}/>
                <Bar dataKey="Moisture Content (%)" fill="#2ea82e" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#94a3b8]"/><span className="text-xs text-[#5a7460]">Rainfall (mm)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#2ea82e]"/><span className="text-xs text-[#5a7460]">Moisture Content (%)</span></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}