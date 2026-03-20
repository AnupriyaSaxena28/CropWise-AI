/**
 * components/chat/ChatSidebar.tsx
 * Left panel showing chat history sessions and a "New Advice Session" button.
 * Matches the design: "CHAT HISTORY" header, session list with title + date.
 */

"use client";

import { cn } from "@/lib/utils";
import { Plus, MessageSquare, ScanSearch, Lightbulb } from "lucide-react";
import type { ChatSession } from "@/app/chat/types";

// ─── Date label helper ────────────────────────────────────────────────────────

function sessionDateLabel(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  }
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Mode icon ────────────────────────────────────────────────────────────────

function ModeIcon({ mode }: { mode: ChatSession["mode"] }) {
  const props = { className: "w-3 h-3", strokeWidth: 2 as const };
  if (mode === "pest_diagnosis") return <ScanSearch {...props} />;
  if (mode === "crop_advisor")   return <Lightbulb  {...props} />;
  return <MessageSquare {...props} />;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
}: ChatSidebarProps) {
  return (
    <aside className="flex flex-col h-full bg-[#0d1a10] border-r border-[#2a3d2c]">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a7460] mb-3">
          Chat History
        </p>

        {/* New Advice Session button */}
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #2ea82e 0%, #228c22 100%)",
            boxShadow: "0 2px 8px rgba(46,168,46,0.25)",
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          New Advice Session
        </button>
      </div>

      {/* ── Session list ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "w-full text-left px-3 py-3 rounded-lg transition-all duration-150 group",
                isActive
                  ? "bg-[#1f2f21] border border-[#3d5c40]"
                  : "hover:bg-[#141f16] border border-transparent"
              )}
            >
              {/* Title row */}
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={cn(
                    "flex-shrink-0",
                    isActive ? "text-[#4dc24d]" : "text-[#5a7460] group-hover:text-[#94a896]"
                  )}
                >
                  <ModeIcon mode={session.mode} />
                </span>
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    isActive ? "text-[#e8f5e9]" : "text-[#94a896] group-hover:text-[#e8f5e9]"
                  )}
                >
                  {session.title}
                </span>
              </div>

              {/* Date */}
              <p
                className={cn(
                  "text-[11px] pl-5",
                  isActive ? "text-[#5a7460]" : "text-[#3d4d3e]"
                )}
              >
                {sessionDateLabel(session.updatedAt)}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}