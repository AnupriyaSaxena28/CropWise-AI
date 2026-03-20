/**
 * app/schemes/page.tsx
 * ============================================================
 * Government Support Ecosystem Page — pixel-matched to design.
 *
 * Layout:
 *  - Header + search bar + Filter / Application Status buttons
 *  - Profile Match banner (eligibility count + benefit value)
 *  - Applied count + Deadlines stat boxes
 *  - 2-column scheme cards grid with eligibility tags, deadline, CTA
 *  - Footer: Legal & Compliance Hub
 * ============================================================
 */

"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Search,
  SlidersHorizontal,
  ClipboardList,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Shield,
  CreditCard,
  Leaf,
  FileText,
  ChevronRight,
  Scale,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_SCHEMES } from "@/lib/mock-data";

// ─── Scheme icon mapping ──────────────────────────────────────────────────────

const SCHEME_ICONS: Record<string, React.FC<LucideProps>> = {
  "pm-kisan":        Banknote,
  "fasal-bima":      Shield,
  "kcc":             CreditCard,
  "soil-health-card": Leaf,
};

const SCHEME_CATEGORIES: Record<string, { label: string; color: string }> = {
  "pm-kisan":         { label: "Income Support",    color: "text-amber-400 bg-amber-900/30 border-amber-800/40"  },
  "fasal-bima":       { label: "Crop Insurance",    color: "text-blue-400  bg-blue-900/30  border-blue-800/40"   },
  "kcc":              { label: "Low Interest Loans", color: "text-[#4dc24d] bg-[#2ea82e]/10 border-[#2ea82e]/30"  },
  "soil-health-card": { label: "Organic Farming",   color: "text-green-400 bg-green-900/30 border-green-800/40"  },
};

const SCHEME_DEADLINES: Record<string, { label: string; urgent: boolean }> = {
  "pm-kisan":         { label: "Closes Mar 30",  urgent: false },
  "fasal-bima":       { label: "14 Days Left",   urgent: true  },
  "kcc":              { label: "Always Open",    urgent: false },
  "soil-health-card": { label: "Closes Apr 15",  urgent: false },
};

// ─── Scheme card ──────────────────────────────────────────────────────────────

function SchemeCard({ scheme }: { scheme: (typeof MOCK_SCHEMES)[0] }) {
  const Icon = SCHEME_ICONS[scheme.id] ?? FileText;
  const category = SCHEME_CATEGORIES[scheme.id];
  const deadline = SCHEME_DEADLINES[scheme.id];
  const isAlwaysOpen = deadline?.label === "Always Open";

  return (
    <div className="rounded-xl bg-[#0d1a10] border border-[#2a3d2c] p-6 flex flex-col gap-4 hover:border-[#3d5c40] transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-[#182419] border border-[#2a3d2c] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#4dc24d]" strokeWidth={1.5} />
        </div>
        {category && (
          <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wide", category.color)}>
            {category.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-base font-bold text-[#e8f5e9] mb-2 leading-snug">
          {scheme.name}
        </h3>
        <p className="text-sm text-[#5a7460] leading-relaxed line-clamp-3">
          {scheme.description}
        </p>
      </div>

      {/* Eligibility tags */}
      <div className="flex flex-wrap gap-2">
        {scheme.eligibility.slice(0, 2).map((e: string) => (
          <span
            key={e}
            className="px-2.5 py-1 rounded-lg border border-[#2a3d2c] bg-[#182419] text-xs text-[#94a896]"
          >
            {e.length > 20 ? e.slice(0, 18) + "…" : e}
          </span>
        ))}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1e2d20]">
        {/* Deadline */}
        <div className={cn("flex items-center gap-1.5 text-xs font-medium",
          isAlwaysOpen ? "text-[#4dc24d]" : deadline?.urgent ? "text-amber-400" : "text-[#5a7460]"
        )}>
          {isAlwaysOpen
            ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            : deadline?.urgent
              ? <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
              : <CalendarDays  className="w-3.5 h-3.5" strokeWidth={2} />
          }
          <span>{deadline?.label}</span>
        </div>

        {/* CTA */}
        <a
          href={scheme.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95",
            deadline?.urgent
              ? "bg-[#2ea82e] text-[#0b1410] hover:bg-[#35c435]"
              : "border border-[#2a3d2c] text-[#94a896] hover:border-[#4dc24d] hover:text-[#4dc24d] hover:bg-[#1f2f21]"
          )}
        >
          {deadline?.urgent ? "Apply Now" : "Check Eligibility"}
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = ["All", "Income Support", "Crop Insurance", "Low Interest Loans", "Organic Farming"];

export default function SchemesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = MOCK_SCHEMES.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      activeCategory === "All" ||
      SCHEME_CATEGORIES[s.id]?.label === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#e8f5e9]">
              Government Support Ecosystem
            </h1>
            <p className="text-sm text-[#5a7460] mt-1 max-w-xl leading-relaxed">
              Access a curated directory of agricultural financial aid and development programs.
              We analyse your farm profile to match you with the most relevant schemes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs py-2 gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
            </button>
            <button className="btn-primary text-xs py-2 gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" /> Application Status
            </button>
          </div>
        </div>

        {/* ── Search bar ──────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7460]" />
          <input
            type="text"
            placeholder="Search schemes, benefits, or eligibility..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </div>

        {/* ── Profile Match + Stats banner ─────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
          {/* Profile match */}
          <div
            className="rounded-xl p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(120deg, #1a4d1a 0%, #0c330c 100%)", border: "1px solid rgba(46,168,46,0.2)" }}
          >
            <div className="relative z-10">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#82d882]/60">
                Profile Match
              </span>
              <h2 className="text-lg font-bold text-white mt-1 leading-snug">
                You are eligible for <span className="text-[#4dc24d]">12 schemes</span> worth approx.{" "}
                <span className="text-[#4dc24d]">₹45,000</span> in benefits.
              </h2>
              {/* Progress */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-bold text-[#4dc24d]">85%</span>
                <div className="flex-1">
                  <div className="h-1.5 w-full rounded-full bg-[#2a3d2c] overflow-hidden">
                    <div className="h-full w-[85%] rounded-full bg-[#2ea82e]" />
                  </div>
                  <p className="text-[10px] text-[#82d882]/60 mt-1">Completion of profile data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Applied stat */}
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] px-6 py-5 flex flex-col justify-between min-w-[140px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a7460]">Applied</p>
            <p className="text-4xl font-bold text-[#e8f5e9] my-2">03</p>
            <div className="flex items-center gap-1.5 text-xs text-[#4dc24d]">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
              <span>2 Under Review</span>
            </div>
          </div>

          {/* Deadlines stat */}
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] px-6 py-5 flex flex-col justify-between min-w-[140px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a7460]">Deadlines</p>
            <p className="text-4xl font-bold text-[#e8f5e9] my-2">02</p>
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Ending this week</span>
            </div>
          </div>
        </div>

        {/* ── Category filter pills ─────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                activeCategory === cat
                  ? "bg-[#2ea82e]/20 text-[#4dc24d] border-[#2ea82e]/40"
                  : "text-[#5a7460] border-[#2a3d2c] hover:border-[#3d5c40] hover:text-[#94a896]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Scheme cards grid ─────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-10 h-10 text-[#2a3d2c] mb-3" strokeWidth={1} />
            <p className="text-sm text-[#3d4d3e]">No schemes match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {filtered.map((scheme) => (
              <React.Fragment key={scheme.id}>
                <SchemeCard scheme={scheme} />
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="border-t border-[#1e2d20] pt-5 mt-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#182419] border border-[#2a3d2c] flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-[#5a7460]" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold text-[#94a896]">Legal & Compliance Hub</span>
            </div>
            <div className="flex items-center gap-5">
              {["Scheme Guidelines", "Data Privacy", "Help Center"].map((link) => (
                <button key={link} className="text-xs text-[#5a7460] hover:text-[#94a896] transition-colors">
                  {link}
                </button>
              ))}
              <span className="text-xs text-[#3d4d3e]">
                © 2026 CropWise AI. Official Agritech Partner.
              </span>
            </div>
          </div>
        </footer>

      </div>
    </AppShell>
  );
}