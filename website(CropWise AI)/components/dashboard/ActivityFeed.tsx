/**
 * components/dashboard/ActivityFeed.tsx
 * Recent activity log for the Dashboard sidebar.
 */

import {
  ScanSearch,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  FileText,
  Activity,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityLogEntry } from "@/types";

// ─── Icon Registry ────────────────────────────────────────────────────────────

type IconComponent = React.FC<LucideProps>;

const ICON_MAP: Record<string, IconComponent> = {
  ScanSearch,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  FileText,
};

// ─── Activity color mapping ───────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  pest_diagnosis:      "text-rose-400   bg-rose-400/10   border-rose-400/20",
  chat_message:        "text-[#4dc24d]  bg-[#2ea82e]/10  border-[#2ea82e]/20",
  crop_recommendation: "text-amber-400  bg-amber-400/10  border-amber-400/20",
  market_query:        "text-blue-400   bg-blue-400/10   border-blue-400/20",
  scheme_search:       "text-purple-400 bg-purple-400/10 border-purple-400/20",
  weather_check:       "text-sky-400    bg-sky-400/10    border-sky-400/20",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ActivityFeedProps {
  entries: ActivityLogEntry[];
  maxItems?: number;
}

export default function ActivityFeed({
  entries,
  maxItems = 6,
}: ActivityFeedProps) {
  const displayed = entries.slice(0, maxItems);

  return (
    <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a3d2c]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#5a7460]" strokeWidth={2} />
          <h2 className="text-sm font-semibold text-[#e8f5e9]">
            Recent Activity
          </h2>
        </div>
        <span className="text-xs text-[#5a7460]">{entries.length} events</span>
      </div>

      {/* Feed */}
      {displayed.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Activity className="w-8 h-8 text-[#2a3d2c] mx-auto mb-2" />
          <p className="text-sm text-[#5a7460]">No activity yet</p>
          <p className="text-xs text-[#2a3d2c] mt-1">
            Start by asking the AI advisor a question
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#1e2d20]">
          {displayed.map((entry, index) => {
            const Icon = ICON_MAP[entry.icon] ?? Activity;
            const colorClass =
              TYPE_COLORS[entry.type] ?? TYPE_COLORS["chat_message"];

            return (
              <li
                key={entry.id}
                className={cn(
                  "flex items-start gap-3.5 px-5 py-3.5",
                  "hover:bg-[#141f16] transition-colors",
                  "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon badge */}
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border mt-0.5",
                    colorClass
                  )}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#e8f5e9] leading-tight truncate">
                    {entry.title}
                  </p>
                  <p className="text-xs text-[#94a896] mt-0.5 line-clamp-2">
                    {entry.description}
                  </p>
                </div>

                {/* Time */}
                <span className="flex-shrink-0 text-[10px] text-[#5a7460] mt-0.5 whitespace-nowrap">
                  {entry.timeAgo}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer */}
      {entries.length > maxItems && (
        <div className="px-5 py-3 border-t border-[#2a3d2c]">
          <button className="text-xs font-medium text-[#4dc24d] hover:text-[#82d882] transition-colors">
            View all {entries.length} activities
          </button>
        </div>
      )}
    </div>
  );
}