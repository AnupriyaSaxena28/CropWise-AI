/**
 * components/chat/MessageBubble.tsx
 * Renders a single chat message — user or AI model.
 * AI messages can embed a DiagnosisCard.
 */

import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import DiagnosisCard from "./DiagnosisCard";
import type { ChatMessage } from "@/app/chat/types";

// ─── Typing indicator (three animated dots) ───────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#5a7460] animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "800ms" }}
        />
      ))}
    </div>
  );
}

// ─── Timestamp formatter ──────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // ── User message ─────────────────────────────────────────────
  if (isUser) {
    return (
      <div className="flex justify-end px-4 md:px-6 group">
        <div className="max-w-[72%] flex flex-col items-end gap-1">
          {/* Image attachment preview */}
          {message.imagePreviewUrl && (
            <img
              src={message.imagePreviewUrl}
              alt="Attached crop photo"
              className="rounded-xl max-w-[240px] border border-[#2a3d2c] mb-1"
            />
          )}
          {/* Bubble */}
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-[#2ea82e] text-[#0b1410]">
            <p className="text-sm leading-relaxed font-medium">{message.content}</p>
          </div>
          {/* Time */}
          <span className="text-[10px] text-[#5a7460] opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    );
  }

  // ── AI model message ─────────────────────────────────────────
  return (
    <div className="flex items-start gap-3 px-4 md:px-6 group">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#182419] border border-[#2ea82e]/30 flex items-center justify-center mt-0.5">
        <Leaf className="w-4 h-4 text-[#4dc24d]" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Streaming / typing indicator */}
        {message.isStreaming && !message.content ? (
          <div className="bg-[#111d16] border border-[#2a3d2c] rounded-2xl rounded-tl-sm px-4 py-3 inline-block">
            <TypingIndicator />
          </div>
        ) : (
          <>
            {/* Text bubble */}
            {message.content && (
              <div className="bg-[#111d16] border border-[#2a3d2c] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-[#e8f5e9] leading-relaxed">{message.content}</p>
              </div>
            )}

            {/* Diagnosis card (embedded in AI message) */}
            {message.diagnosisResult && (
              <DiagnosisCard result={message.diagnosisResult} />
            )}
          </>
        )}

        {/* Time */}
        <span className="text-[10px] text-[#5a7460] opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}