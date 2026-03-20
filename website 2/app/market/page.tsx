/**
 * app/market/page.tsx
 * ============================================================
 * Market Prices Page — pixel-matched to design screenshot.
 *
 * Layout:
 *  - AI Advisory banner (MARKET STATUS: HOLD)
 *  - [Left: Mandi Live Feed table] | [Right: Price Trend Recharts chart]
 *  - Bottom: 3 insight cards (Regional Alert, Global Market, Logistics)
 * ============================================================
 */

"use client";
import React, { useState, useEffect } from "react";

import AppShell from "@/components/layout/AppShell";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BrainCircuit,
  Download,
  SlidersHorizontal,
  Wifi,
  AlertTriangle,
  Globe,
  Warehouse,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Crop icon mapping (Lucide only, no emojis) ───────────────────────────────

function CropIcon({ name }: { name: string }) {
  // All use TrendingUp-family icons as stylised avatars
  const colors: Record<string, string> = {
    "Wheat":       "bg-amber-900/40  text-amber-400  border-amber-800/40",
    "Rice (Paddy)":"bg-blue-900/40   text-blue-400   border-blue-800/40",
    "Cotton":      "bg-purple-900/40 text-purple-400 border-purple-800/40",
    "Soybean":     "bg-green-900/40  text-[#4dc24d]  border-green-800/40",
    "Maize":       "bg-orange-900/40 text-orange-400 border-orange-800/40",
    "Mustard":     "bg-yellow-900/40 text-yellow-400 border-yellow-800/40",
  };
  const cls = colors[name] ?? "bg-[#182419] text-[#5a7460] border-[#2a3d2c]";
  return (
    <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0", cls)}>
      <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
    </div>
  );
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111d16] border border-[#2a3d2c] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-[#5a7460] mb-1">{label}</p>
      {payload.map((entry: import('recharts').Payload<number,string>) => (
        <p key={entry.name} className="text-xs font-semibold" style={{ color: entry.color }}>
          ₹{(entry.value as number).toLocaleString("en-IN")}
          <span className="text-[10px] font-normal text-[#5a7460] ml-1">/q</span>
        </p>
      ))}
    </div>
  );
}

// ─── Insight cards (bottom row) ───────────────────────────────────────────────

const INSIGHT_CARDS = [
  {
    tag: "Regional Alert",
    tagColor: "text-amber-400 bg-amber-900/30 border-amber-800/40",
    icon: AlertTriangle,
    iconColor: "text-amber-400 bg-amber-900/40 border-amber-800/40",
    title: "Subsidy Deadline",
    body: "Ensure registration for the Price Support Scheme (PSS) by March 30th to lock in MSP benefits.",
    accent: "border-l-amber-500",
  },
  {
    tag: "Global Market",
    tagColor: "text-blue-400 bg-blue-900/30 border-blue-800/40",
    icon: Globe,
    iconColor: "text-blue-400 bg-blue-900/40 border-blue-800/40",
    title: "Export Update",
    body: "Increased demand from Southeast Asian markets likely to support current wheat price floors through Q2.",
    accent: "border-l-blue-500",
  },
  {
    tag: "Logistics",
    tagColor: "text-[#4dc24d] bg-[#2ea82e]/10 border-[#2ea82e]/30",
    icon: Warehouse,
    iconColor: "text-[#4dc24d] bg-[#2ea82e]/10 border-[#2ea82e]/20",
    title: "Storage Guidance",
    body: "Silo capacity in North Cluster is at 85%. Advised to book storage slots for peak harvest arrivals.",
    accent: "border-l-[#2ea82e]",
  },
];

// ─── Mandi table ──────────────────────────────────────────────────────────────

function MandiTable({ activeCrop, onSelect, prices }: { activeCrop: string; onSelect: (n: string) => void; prices: import('@/types').MarketPrice[] }) {
  return (
    <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a3d2c]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#e8f5e9]">Mandi Live Feed</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#5a7460]">Live Update</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-4 px-5 py-2.5 border-b border-[#1e2d20]">
        {["Crop Name", "Current Price", "MSP", "24H Change"].map((h) => (
          <p key={h} className="text-[10px] font-semibold uppercase tracking-wider text-[#5a7460]">{h}</p>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#1e2d20]">
        {prices.map((item: import('@/types').MarketPrice) => {
          const isUp   = item.priceChange > 0;
          const isDown = item.priceChange < 0;
          const isSelected = item.cropName === activeCrop;
          const aboveMSP = item.currentPrice >= item.msp;

          return (
            <button
              key={item.cropName}
              onClick={() => onSelect(item.cropName)}
              className={cn(
                "w-full grid grid-cols-4 items-center px-5 py-3.5 text-left transition-colors",
                isSelected ? "bg-[#182419]" : "hover:bg-[#141f16]"
              )}
            >
              {/* Name */}
              <div className="flex items-center gap-3">
                <CropIcon name={item.cropName} />
                <div>
                  <p className="text-sm font-medium text-[#e8f5e9]">{item.cropName}</p>
                  {item.cropNameHi && (
                    <p className="text-[10px] text-[#5a7460]">{item.cropNameHi}</p>
                  )}
                </div>
              </div>

              {/* Current price */}
              <p className={cn("text-sm font-semibold", aboveMSP ? "text-[#4dc24d]" : "text-rose-400")}>
                ₹{item.currentPrice.toLocaleString("en-IN")}/q
              </p>

              {/* MSP */}
              <p className="text-sm text-[#5a7460]">
                ₹{item.msp.toLocaleString("en-IN")}/q
              </p>

              {/* 24h change */}
              <div className={cn(
                "flex items-center gap-1 text-sm font-semibold",
                isUp ? "text-[#4dc24d]" : isDown ? "text-rose-400" : "text-[#5a7460]"
              )}>
                {isUp   ? <TrendingUp   className="w-3.5 h-3.5" /> :
                 isDown ? <TrendingDown className="w-3.5 h-3.5" /> :
                          <Minus        className="w-3.5 h-3.5" />}
                {isUp ? "+" : ""}{item.priceChangePercent.toFixed(1)}%
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Price trend chart ────────────────────────────────────────────────────────

function PriceTrendChart({ cropName, historical }: { cropName: string; historical: import('@/types').MarketHistoricalPoint[] }) {
  // Format month labels from ISO date
  const chartData = historical.map((d: import('@/types').MarketHistoricalPoint) => ({
    ...d,
    month: new Date(d.date).toLocaleString("en-IN", { month: "short" }).toUpperCase(),
  }));

  const prices = chartData.map((d) => d.price);
  const marketHigh = Math.max(...prices);
  const firstPrice = prices[0];
  const lastPrice  = prices[prices.length - 1];
  const avgGrowth  = (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1);


  return (
    <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#e8f5e9]">Price Trend</h2>
          <p className="text-xs text-[#5a7460] mt-0.5">{cropName} (6-Month Historical)</p>
        </div>
        <span className="px-2 py-1 rounded-lg bg-[#182419] border border-[#2a3d2c] text-[10px] text-[#5a7460] font-medium">
          Past 6 Months
        </span>
      </div>

      {/* Recharts line chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d20" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#5a7460" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 10, fill: "#5a7460" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#2a3d2c", strokeWidth: 1 }} />
            {/* MSP reference line */}
            <ReferenceLine
              y={2275}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{ value: "MSP", position: "right", fontSize: 9, fill: "#f59e0b" }}
            />
            {/* Current price dot label */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2ea82e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#4dc24d", stroke: "#0b1410", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#1e2d20]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a7460]">Market High</p>
          <p className="text-xl font-bold text-[#e8f5e9] mt-0.5">
            ₹{marketHigh.toLocaleString("en-IN")}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a7460]">Average Growth</p>
          <p className="text-xl font-bold text-[#4dc24d] mt-0.5">
            +{avgGrowth}%
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketPage() {
  const [activeCrop, setActiveCrop] = useState("Wheat");
  const [prices, setPrices]         = useState<import('@/types').MarketPrice[]>([]);
  const [historical, setHistorical] = useState<import('@/types').MarketHistoricalPoint[]>([]);
  const [loadingPrices, setLoadingPrices]   = useState(true);
  const [loadingChart,  setLoadingChart]    = useState(false);

  useEffect(() => {
    fetch("/api/market?type=current")
      .then(r => r.json()).then(d => { if (d.success) setPrices(d.data); })
      .catch(console.error).finally(() => setLoadingPrices(false));
  }, []);

  useEffect(() => {
    setLoadingChart(true);
    fetch(`/api/market?type=historical&crop=${encodeURIComponent(activeCrop)}`)
      .then(r => r.json()).then(d => { if (d.success) setHistorical(d.data); })
      .catch(console.error).finally(() => setLoadingChart(false));
  }, [activeCrop]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#e8f5e9]">Market Prices</h1>
            <p className="text-sm text-[#5a7460] mt-1">
              Real-time commodity valuation and predictive market analysis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary gap-2 text-xs py-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
            <button className="btn-secondary gap-2 text-xs py-2">
              <Download className="w-3.5 h-3.5" />
              Export Report
            </button>
          </div>
        </div>

        {/* ── AI Advisory Banner ────────────────────────────────────── */}
        <div
          className="relative rounded-xl overflow-hidden border border-[#2ea82e]/20"
          style={{ background: "linear-gradient(120deg, #1a4d1a 0%, #0c330c 50%, #0b1a0c 100%)" }}
        >
          {/* Subtle grid texture */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "linear-gradient(rgba(77,194,77,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(77,194,77,0.3) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

          <div className="relative flex items-center gap-5 px-6 py-5">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#2ea82e]/15 border border-[#2ea82e]/30 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-[#4dc24d]" strokeWidth={1.5} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#82d882]/60 mb-1">
                AI Advisory
              </p>
              <p className="text-base font-bold text-white">
                MARKET STATUS:{" "}
                <span className="text-[#4dc24d]">HOLD</span>
              </p>
              <p className="text-xs text-[#82d882]/70 mt-0.5 leading-relaxed">
                Market trends indicate a potential price surge of 8–12% in the next 15 days due to regional supply constraints.
              </p>
            </div>

            {/* CTA */}
            <button className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#0b1410] text-sm font-semibold hover:bg-[#e8f5e9] transition-colors active:scale-95">
              View Full Analysis
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main grid: Table + Chart ──────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
          <MandiTable activeCrop={activeCrop} onSelect={setActiveCrop} prices={prices} />
          <PriceTrendChart cropName={activeCrop} historical={historical} />
        </div>

        {/* ── Insight cards (bottom row) ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {INSIGHT_CARDS.map((card: typeof INSIGHT_CARDS[0]) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={cn(
                  "rounded-xl bg-[#111d16] border border-[#2a3d2c] border-l-4 p-5 space-y-3",
                  card.accent
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0", card.iconColor)}>
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border", card.tagColor)}>
                    {card.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#e8f5e9] mb-1">{card.title}</h3>
                  <p className="text-xs text-[#5a7460] leading-relaxed">{card.body}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </AppShell>
  );
}