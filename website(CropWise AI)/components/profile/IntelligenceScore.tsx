/**
 * components/profile/IntelligenceScore.tsx
 * Animated SVG circular progress ring for the Farm Intelligence Score.
 * Shows score number in center, three sub-metrics below.
 */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface IntelligenceScoreProps {
  score: number; // 0–100
}

export default function IntelligenceScore({ score }: IntelligenceScoreProps) {
  const [animated, setAnimated] = useState(0);

  // Animate count-up on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  // SVG ring math
  const size     = 180;
  const stroke   = 12;
  const r        = (size - stroke) / 2;
  const circ     = 2 * Math.PI * r;
  const offset   = circ - (animated / 100) * circ;

  const scoreColor =
    score >= 80 ? "#2ea82e" :
    score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      {/* Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="#1e2d20"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={scoreColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color: scoreColor }}>
            {score}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#5a7460] mt-0.5">
            Optimization
          </span>
        </div>
      </div>

      {/* Sub-metrics */}
      <div className="flex items-center gap-6 mt-4">
        {[
          { label: "Yield",       value: "+12%",      color: "text-[#4dc24d]" },
          { label: "Soil Health", value: "Excellent",  color: "text-[#e8f5e9]" },
          { label: "Irrigation",  value: "92% Eff.",   color: "text-blue-400"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#5a7460] mb-0.5">{label}</p>
            <p className={cn("text-sm font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}