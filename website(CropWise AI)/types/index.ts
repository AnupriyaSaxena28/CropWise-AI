/**
 * types/index.ts
 * Centralised TypeScript types for CropWise AI.
 * Import from here rather than defining types inline in components.
 */

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  iconName: string; // Lucide icon name — resolved in the Sidebar component
  badge?: string;   // Optional badge text e.g. "New"
}

// ─── WEATHER ─────────────────────────────────────────────────────────────────

export interface WeatherData {
  location: string;
  temperature: number;      // Celsius
  feelsLike: number;
  humidity: number;         // Percentage
  windSpeed: number;        // km/h
  condition: string;        // e.g. "Partly Cloudy"
  conditionCode: string;    // Internal code for icon mapping
  precipitation: number;    // mm expected today
  uvIndex: number;
  visibility: number;       // km
  forecast: WeatherForecastDay[];
  updatedAt: string;        // ISO string
}

export interface WeatherForecastDay {
  date: string;             // ISO date string
  dayName: string;          // e.g. "Mon"
  high: number;
  low: number;
  condition: string;
  conditionCode: string;
  precipitationChance: number; // Percentage
}

// ─── MARKET PRICES ───────────────────────────────────────────────────────────

export interface MarketPrice {
  cropName: string;
  cropNameHi?: string;      // Hindi name
  msp: number;              // Minimum Support Price (INR/quintal)
  currentPrice: number;     // Today's mandi price (INR/quintal)
  priceChange: number;      // Absolute change from yesterday
  priceChangePercent: number;
  unit: "quintal" | "kg" | "tonne";
  market: string;           // e.g. "Ludhiana Mandi"
  lastUpdated: string;      // ISO string
}

export interface MarketHistoricalPoint {
  date: string;             // "YYYY-MM-DD"
  price: number;
  msp: number;
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export interface StatCard {
  id: string;
  title: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: string;             // Lucide icon name
  color: "green" | "amber" | "blue" | "rose";
}

// ─── ACTIVITY LOG (CLIENT-SIDE) ───────────────────────────────────────────────

export interface ActivityLogEntry {
  id: string;
  type: string;
  title: string;
  description: string;
  timeAgo: string;          // Pre-formatted, e.g. "2 hours ago"
  icon: string;             // Lucide icon name
}

// ─── AI / GEMINI ─────────────────────────────────────────────────────────────

export type GeminiMode = "chat" | "pest_diagnosis" | "crop_advisor";

export interface GeminiRequestBody {
  prompt: string;
  mode: GeminiMode;
  language?: string;        // ISO 639-1, defaults to "en"
  imageBase64?: string;     // Base64-encoded image (without data: prefix)
  imageMimeType?: string;   // e.g. "image/jpeg"
  context?: string;         // Optional extra context (soil type, region, etc.)
}

export interface GeminiResponseBody {
  success: boolean;
  text?: string;            // Plain text response (chat mode)
  structured?: Record<string, unknown>; // Parsed JSON (diagnosis / advisor mode)
  error?: string;
  tokensUsed?: number;
}

// ─── PEST DIAGNOSIS ──────────────────────────────────────────────────────────

export type SeverityLevel = "Low" | "Moderate" | "High" | "Critical";

export interface PestDiagnosisResult {
  diseaseName: string;
  scientificName?: string;
  confidencePercent: number;
  severity: SeverityLevel;
  affectedArea: string;
  symptoms: string[];
  treatment: {
    immediate: string[];
    preventive: string[];
    recommendedPesticides?: string[];
  };
  disclaimer: string;
}

// ─── CROP ADVISOR ────────────────────────────────────────────────────────────

export type WaterRequirement = "Low" | "Medium" | "High";

export interface CropRecommendation {
  cropName: string;
  localName?: string;
  suitabilityScore: number;
  expectedYield: string;
  estimatedROI: {
    investmentPerAcre: number;
    expectedRevenuePerAcre: number;
    profitPerAcre: number;
    paybackMonths: number;
  };
  growingPeriodDays: number;
  waterRequirement: WaterRequirement;
  soilCompatibility: string;
  reasonsForRecommendation: string[];
  risks: string[];
}

export interface CropAdvisorFormData {
  soilType: string;
  region: string;
  state: string;
  district?: string;        // Optional district within state
  season: "Kharif" | "Rabi" | "Zaid";
  landArea: number;         // Acres
  waterSource: string;
  previousCrop?: string;
  budget?: number;          // INR
}

// ─── GOVERNMENT SCHEMES ──────────────────────────────────────────────────────

export interface GovernmentScheme {
  id: string;
  name: string;
  ministry: string;
  description: string;
  benefits: string[];
  eligibility: string[];
  applicationUrl: string;
  deadline?: string;
  isActive: boolean;
}

// ─── API RESPONSES ───────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;