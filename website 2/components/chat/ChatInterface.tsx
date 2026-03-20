/**
 * components/chat/ChatInterface.tsx
 * Full interactive chat UI with real-time context injection.
 *
 * Real data injected into every AI request:
 *  - User profile (name, farm, crops, location)
 *  - Live weather (temperature, humidity, soil moisture, rain forecast)
 *  - Live market prices (wheat, key crops vs MSP)
 *  - Chat history persisted to Firebase Firestore
 */

"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Leaf, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatSidebar from "./ChatSidebar";
import MessageBubble from "./MessageBubble";
import ChatInputBar from "./ChatInputBar";
import type { ChatMessage, ChatSession, LanguageCode } from "@/app/chat/types";
import type { PestDiagnosisResult, GeminiRequestBody, GeminiResponseBody } from "@/types";
import {
  createChatSession, saveChatMessage,
  getUserChatSessions, getSessionMessages, updateSessionTitle,
} from "@/lib/firebase/chat-history";
import { logActivity } from "@/lib/firebase/activity-log";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserProfile } from "@/lib/firebase/user-profile";
import { useLocation } from "@/lib/hooks/useLocation";
import { LANGUAGE_OPTIONS } from "@/app/chat/types";
import type { FirestoreUser } from "@/lib/firestore-schema";

// ─── Build real-time context string for Gemini system prompt ─────────────────

async function buildRealtimeContext(
  user: { uid: string; displayName?: string | null; email?: string | null },
  locationLabel: string,
  lat: number,
  lng: number
): Promise<string> {
  const parts: string[] = [];

  // ── 1. User profile from Firestore ────────────────────────────
  try {
    const profile: FirestoreUser | null = await getUserProfile(user.uid);
    if (profile) {
      parts.push(`FARMER PROFILE:
- Name: ${profile.displayName || user.displayName || "Farmer"}
- Farm: ${profile.farmName || "Not set"}
- Location: ${profile.location?.district ? `${profile.location.district}, ` : ""}${profile.location?.state || locationLabel}
- Land: ${profile.landHolding || "Not set"} acres
- Primary Crops: ${profile.primaryCrops?.join(", ") || "Not set"}
- Season: Current Rabi/Kharif season
- Language preference: ${profile.preferredLanguage || "en"}`);
    }
  } catch { /* non-critical */ }

  // ── 2. Live weather from Open-Meteo ───────────────────────────
  try {
    const weatherRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/weather?lat=${lat}&lng=${lng}&label=${encodeURIComponent(locationLabel)}`
    );
    const weatherData = await weatherRes.json();
    if (weatherData.success && weatherData.data) {
      const w = weatherData.data;
      const rainTomorrow = w.forecast?.[1]?.precipitationChance ?? 0;
      parts.push(`LIVE WEATHER (${locationLabel}):
- Temperature: ${w.temperature}°C (feels like ${w.feelsLike}°C)
- Condition: ${w.condition}
- Humidity: ${w.humidity}%
- Wind: ${w.windSpeed} km/h
- Soil Moisture: ${w.soilMoisture}% (${w.soilMoisture > 60 ? "Healthy" : w.soilMoisture > 30 ? "Moderate" : "Dry"})
- Today's Rainfall: ${w.precipitation}mm
- Rain tomorrow: ${rainTomorrow}% probability
- Evapotranspiration: ${w.evapotranspiration} mm/day
- UV Index: ${w.uvIndex}
- 7-day forecast: ${(w.forecast || []).slice(0,3).map((d: {dayName:string;high:number;low:number;precipitationChance:number}) => `${d.dayName} ${d.high}°/${d.low}° ${d.precipitationChance}% rain`).join(", ")}`);
    }
  } catch { /* non-critical */ }

  // ── 3. Live market prices ─────────────────────────────────────
  try {
    const marketRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/market?type=current`
    );
    const marketData = await marketRes.json();
    if (marketData.success && marketData.data?.length) {
      const priceLines = marketData.data
        .slice(0, 6)
        .map((p: { cropName: string; currentPrice: number; msp: number; priceChangePercent: number }) =>
          `${p.cropName}: ₹${p.currentPrice}/q (MSP: ₹${p.msp}, ${p.currentPrice >= p.msp ? "above" : "BELOW"} MSP, ${p.priceChangePercent > 0 ? "+" : ""}${p.priceChangePercent.toFixed(1)}%)`
        )
        .join("\n  ");
      parts.push(`LIVE MANDI PRICES:\n  ${priceLines}`);
    }
  } catch { /* non-critical */ }

  return parts.join("\n\n");
}

// ─── Empty state ──────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "मेरी गेहूं की फसल में पीले धब्बे हैं, क्या करूं?",
  "Best irrigation schedule for cotton in this weather",
  "Is it a good time to sell wheat today?",
  "Which crop should I plant this Kharif season?",
  "मेरी मिट्टी के लिए कौन सी खाद सही है?",
  "PM-KISAN ka paisa kab aayega?",
];

function EmptyState({ onSuggest }: { onSuggest: (text: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-[#182419] border border-[#2ea82e]/30 flex items-center justify-center mb-5">
        <Leaf className="w-8 h-8 text-[#4dc24d]" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold text-[#e8f5e9] mb-2">Ask CropWise AI</h2>
      <p className="text-sm text-[#5a7460] max-w-sm leading-relaxed mb-6">
        Get personalised advice based on your farm, live weather, and today's mandi prices.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => onSuggest(s)}
            className="text-left text-xs text-[#94a896] px-3 py-2.5 rounded-lg bg-[#111d16] border border-[#2a3d2c] hover:border-[#3d5c40] hover:text-[#e8f5e9] transition-all">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatInterface() {
  const { user }   = useAuth();
  const { location } = useLocation(user?.uid);

  const [sessions,       setSessions]       = useState<ChatSession[]>([]);
  const [activeSessionId,setActiveSessionId]= useState<string | null>(null);
  const [messages,       setMessages]       = useState<ChatMessage[]>([]);
  const [isLoading,      setIsLoading]      = useState(false);
  const [language,       setLanguage]       = useState<LanguageCode>("en");
  const [contextReady,   setContextReady]   = useState(false);
  const [contextStr,     setContextStr]     = useState("");

  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const scrollContainerRef= useRef<HTMLDivElement>(null);
  const pendingTextRef    = useRef<string | null>(null);

  // ── Auto-scroll ───────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Build real-time context on mount ─────────────────────────
  useEffect(() => {
    if (!user || !location) return;
    setContextReady(false);
    buildRealtimeContext(user, location.label, location.lat, location.lng)
      .then((ctx) => { setContextStr(ctx); setContextReady(true); })
      .catch(() => setContextReady(true));
  }, [user, location]);

  // ── Load sessions ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    getUserChatSessions(user.uid, 20).then(setSessions);
  }, [user]);

  // ── New session ───────────────────────────────────────────────
  const handleNewSession = useCallback(async () => {
    if (!user?.uid) return;
    const sessionId = await createChatSession(user.uid, "general", "New Advice Session", language);
    const newSession: ChatSession = {
      id: sessionId, title: "New Advice Session",
      mode: "general", lastMessage: "", updatedAt: new Date(),
    };
    setSessions((prev: ChatSession[]) => [newSession, ...prev]);
    setActiveSessionId(sessionId);
    setMessages([]);
  }, [user, language]);

  // ── Select session ────────────────────────────────────────────
  const handleSelectSession = useCallback(async (id: string) => {
    setActiveSessionId(id);
    const msgs = await getSessionMessages(id);
    setMessages(msgs);
  }, []);

  // ── Send suggestion from empty state ─────────────────────────
  const handleSuggest = useCallback(async (text: string) => {
    if (!activeSessionId) {
      // Create session first, then send
      pendingTextRef.current = text;
      await handleNewSession();
    } else {
      handleSend(text);
    }
  }, [activeSessionId, handleNewSession]); // eslint-disable-line react-hooks/exhaustive-deps

  // After new session created, send the pending text
  useEffect(() => {
    if (activeSessionId && pendingTextRef.current) {
      const text = pendingTextRef.current;
      pendingTextRef.current = null;
      handleSend(text);
    }
  }, [activeSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send message ──────────────────────────────────────────────
  const handleSend = useCallback(async (
    text: string,
    image?: { base64: string; mimeType: string; previewUrl: string }
  ) => {
    if (isLoading || !text.trim()) return;

    const mode = image ? "pest_diagnosis" : "chat";

    const userMessage: ChatMessage = {
      id: uuidv4(), role: "user", content: text,
      imagePreviewUrl: image?.previewUrl, createdAt: new Date(),
    };
    const placeholder: ChatMessage = {
      id: uuidv4(), role: "model", content: "",
      isStreaming: true, createdAt: new Date(),
    };

    setMessages((prev: ChatMessage[]) => [...prev, userMessage, placeholder]);
    setIsLoading(true);

    // Update session title on first message
    if (messages.length === 0 && activeSessionId) {
      const title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
      setSessions((prev: ChatSession[]) =>
        prev.map((s: ChatSession) => s.id === activeSessionId ? { ...s, title, updatedAt: new Date() } : s)
      );
      await updateSessionTitle(activeSessionId, title).catch(() => {});
    }

    try {
      const body: GeminiRequestBody = {
        prompt: text,
        mode,
        language,
        // Inject real-time context into every chat request
        context: mode === "chat" ? contextStr : undefined,
        ...(image && { imageBase64: image.base64, imageMimeType: image.mimeType }),
      };

      const res  = await fetch("/api/gemini", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: GeminiResponseBody = await res.json();
      if (!data.success) throw new Error(data.error ?? "AI request failed");

      const aiMessage: ChatMessage = {
        id:       placeholder.id,
        role:     "model",
        content:  mode === "pest_diagnosis"
          ? "Based on your photo, I've identified the issue below. See the diagnosis card for detailed analysis."
          : (data.text ?? ""),
        diagnosisResult: mode === "pest_diagnosis" && data.structured
          ? (data.structured as unknown as PestDiagnosisResult)
          : undefined,
        isStreaming: false,
        createdAt: new Date(),
      };

      setMessages((prev: ChatMessage[]) =>
        prev.map((m: ChatMessage) => m.id === placeholder.id ? aiMessage : m)
      );

      // Persist to Firebase
      if (user?.uid && activeSessionId) {
        await saveChatMessage(activeSessionId, {
          role: "user", content: text, createdAt: userMessage.createdAt,
        }).catch(() => {});
        await saveChatMessage(activeSessionId, {
          role: "model", content: aiMessage.content,
          diagnosisResult: aiMessage.diagnosisResult, createdAt: aiMessage.createdAt,
        }).catch(() => {});
        await logActivity({
          userId: user.uid, type: "chat_message",
          title: text.slice(0, 50),
          description: mode === "pest_diagnosis" ? "Pest diagnosis" : "AI chat query",
          metadata: { mode, sessionId: activeSessionId },
        }).catch(() => {});
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessages((prev: ChatMessage[]) =>
        prev.map((m: ChatMessage) => m.id === placeholder.id
          ? { ...m, content: `Sorry, I encountered an error: ${msg}`, isStreaming: false }
          : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages.length, activeSessionId, language, contextStr, user]);

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden -m-4 md:-m-6 lg:-m-8">

      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-60 flex-shrink-0">
        <ChatSidebar sessions={sessions} activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession} onNewSession={handleNewSession} />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 border-l border-[#2a3d2c]">

        {/* Language selector + context status */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e2d20] overflow-x-auto">
          <span className="text-[10px] text-[#5a7460] uppercase tracking-wider flex-shrink-0">
            Language:
          </span>
          {LANGUAGE_OPTIONS.map((lang) => (
            <button key={lang.code} onClick={() => setLanguage(lang.code)}
              className={cn(
                "flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                language === lang.code
                  ? "bg-[#2ea82e]/20 text-[#4dc24d] border border-[#2ea82e]/30"
                  : "text-[#5a7460] hover:text-[#94a896] border border-transparent hover:border-[#2a3d2c]"
              )}>
              {lang.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
            {!contextReady ? (
              <span className="flex items-center gap-1 text-[10px] text-amber-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading live data...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-[#4dc24d]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4dc24d] animate-pulse" />
                Live data ready
              </span>
            )}
            <Shield className="w-3 h-3 text-[#5a7460] ml-2" />
            <span className="text-[10px] text-[#5a7460] hidden sm:inline">AI backed by real-time agricultural data</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-6 space-y-5">
          {messages.length === 0 ? (
            <EmptyState onSuggest={handleSuggest} />
          ) : (
            messages.map((message: ChatMessage) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-[#1e2d20]">
          <ChatInputBar
            onSend={handleSend}
            isLoading={isLoading}
            disabled={!activeSessionId && !contextReady}
            placeholder={
              !activeSessionId
                ? "Click 'New Advice Session' or type to start..."
                : !contextReady
                ? "Loading your farm context..."
                : "Ask about soil health, pest control, or yields..."
            }
          />
        </div>
      </div>
    </div>
  );
}