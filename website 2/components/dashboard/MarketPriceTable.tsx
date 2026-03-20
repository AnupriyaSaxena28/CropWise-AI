/**
 * components/dashboard/MarketPriceTable.tsx
 * Compact market prices table for the Dashboard.
 * Shows top N crops with price vs MSP comparison.
 */

import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn, formatINR } from "@/lib/utils";
import type { MarketPrice } from "@/types";

// ─── Component ────────────────────────────────────────────────────────────────

interface MarketPriceTableProps {
  prices: MarketPrice[];
  maxItems?: number;
}

export default function MarketPriceTable({
  prices,
  maxItems = 5,
}: MarketPriceTableProps) {
  const displayed = prices.slice(0, maxItems);

  return (
    <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a3d2c]">
        <div>
          <h2 className="text-sm font-semibold text-[#e8f5e9]">
            Market Prices
          </h2>
          <p className="text-xs text-[#5a7460] mt-0.5">INR per quintal</p>
        </div>
        <Link
          href="/market"
          className="flex items-center gap-1 text-xs font-medium text-[#4dc24d] hover:text-[#82d882] transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2d20]">
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#5a7460] uppercase tracking-wider">
                Crop
              </th>
              <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-[#5a7460] uppercase tracking-wider">
                Price
              </th>
              <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-[#5a7460] uppercase tracking-wider hidden sm:table-cell">
                MSP
              </th>
              <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-[#5a7460] uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2d20]">
            {displayed.map((item) => {
              const isAboveMSP = item.currentPrice >= item.msp;
              const isUp = item.priceChange > 0;
              const isDown = item.priceChange < 0;

              return (
                <tr
                  key={item.cropName}
                  className="hover:bg-[#141f16] transition-colors"
                >
                  {/* Crop name */}
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-[#e8f5e9]">
                        {item.cropName}
                      </p>
                      {item.cropNameHi && (
                        <p className="text-[11px] text-[#5a7460]">
                          {item.cropNameHi}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Current price */}
                  <td className="px-3 py-3 text-right">
                    <span
                      className={cn(
                        "font-semibold",
                        isAboveMSP ? "text-[#4dc24d]" : "text-rose-400"
                      )}
                    >
                      ₹{item.currentPrice.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* MSP */}
                  <td className="px-3 py-3 text-right hidden sm:table-cell">
                    <span className="text-[#5a7460] text-xs">
                      ₹{item.msp.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* Change */}
                  <td className="px-5 py-3 text-right">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        isUp   ? "text-[#4dc24d]" :
                        isDown ? "text-rose-400"   : "text-[#5a7460]"
                      )}
                    >
                      {isUp   ? <TrendingUp  className="w-3 h-3" /> :
                       isDown ? <TrendingDown className="w-3 h-3" /> :
                                <Minus        className="w-3 h-3" />}
                      <span>
                        {isUp ? "+" : ""}
                        {item.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-[#1e2d20]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4dc24d]" />
          <span className="text-[10px] text-[#5a7460]">Above MSP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="text-[10px] text-[#5a7460]">Below MSP</span>
        </div>
        <span className="text-[10px] text-[#5a7460] ml-auto">
          Source: Mock Mandi Data
        </span>
      </div>
    </div>
  );
}