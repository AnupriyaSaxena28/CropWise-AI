/**
 * app/chat/types.ts
 * Client-side types for the Chat UI.
 * Separate from Firestore schema types to keep UI state decoupled.
 */

import type { PestDiagnosisResult } from "@/types";

export type MessageRole = "user" | "model";
export type ChatMode = "general" | "pest_diagnosis" | "crop_advisor";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  imagePreviewUrl?: string;    // Local object URL for image preview (not stored)
  diagnosisResult?: PestDiagnosisResult;
  isStreaming?: boolean;       // True while the AI is still typing
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  mode: ChatMode;
  lastMessage: string;
  updatedAt: Date;
}

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "mr", label: "मराठी" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
] as const;

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]["code"];