/**
 * lib/utils.ts
 * Shared utility functions for CropWise AI.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupees.
 * e.g. 125000 → "₹1,25,000"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with Indian locale (lakhs/crores grouping).
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/**
 * Convert a File object to a base64 string (without the data: URI prefix).
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:<mime>;base64," prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Determine MIME type from a File object with a fallback.
 */
export function getImageMimeType(
  file: File
): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  return validTypes.includes(file.type)
    ? (file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif")
    : "image/jpeg";
}

/**
 * Format a date relative to now (e.g. "2 hours ago", "3 days ago").
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return d.toLocaleDateString("en-IN");
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Generate a session title from the first user message.
 * Truncates and capitalises.
 */
export function generateSessionTitle(firstMessage: string): string {
  return truncate(
    firstMessage.charAt(0).toUpperCase() + firstMessage.slice(1),
    40
  );
}

/**
 * Map a severity level to a Tailwind color class.
 */
export function severityToColor(
  severity: "Low" | "Moderate" | "High" | "Critical"
): string {
  const map: Record<string, string> = {
    Low: "text-green-400 bg-green-400/10 border-green-400/20",
    Moderate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    High: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    Critical: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };
  return map[severity] ?? map["Low"];
}

/**
 * Safely parse JSON, returning null on failure.
 * T defaults to Record<string, unknown> so bare calls (no type arg) are
 * assignable to GeminiResponseBody.structured without an explicit cast.
 */
export function safeJsonParse<T = Record<string, unknown>>(text: string): T | null {
  try {
    // Strip markdown code fences if present (Gemini sometimes wraps JSON)
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}