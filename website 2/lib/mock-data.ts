/**
 * lib/mock-data.ts
 * Mock data for the hackathon demo.
 * Replace with real API integrations in production.
 */

import type {
  WeatherData,
  MarketPrice,
  MarketHistoricalPoint,
  StatCard,
  ActivityLogEntry,
  GovernmentScheme,
} from "@/types";

// ─── MOCK WEATHER ─────────────────────────────────────────────────────────────

export const MOCK_WEATHER: WeatherData = {
  location: "Ludhiana, Punjab",
  temperature: 28,
  feelsLike: 31,
  humidity: 65,
  windSpeed: 14,
  condition: "Partly Cloudy",
  conditionCode: "partly-cloudy",
  precipitation: 2,
  uvIndex: 6,
  visibility: 8,
  forecast: [
    { date: "2024-10-22", dayName: "Today", high: 28, low: 18, condition: "Partly Cloudy", conditionCode: "partly-cloudy", precipitationChance: 20 },
    { date: "2024-10-23", dayName: "Wed",   high: 30, low: 19, condition: "Sunny",         conditionCode: "sunny",          precipitationChance: 5  },
    { date: "2024-10-24", dayName: "Thu",   high: 25, low: 17, condition: "Rain Showers",  conditionCode: "rain",           precipitationChance: 75 },
    { date: "2024-10-25", dayName: "Fri",   high: 22, low: 15, condition: "Overcast",      conditionCode: "overcast",       precipitationChance: 40 },
    { date: "2024-10-26", dayName: "Sat",   high: 26, low: 16, condition: "Sunny",         conditionCode: "sunny",          precipitationChance: 10 },
  ],
  updatedAt: new Date().toISOString(),
};

// ─── MOCK MARKET PRICES ───────────────────────────────────────────────────────

export const MOCK_MARKET_PRICES: MarketPrice[] = [
  {
    cropName: "Wheat",
    cropNameHi: "गेहूं",
    msp: 2275,
    currentPrice: 2340,
    priceChange: +45,
    priceChangePercent: +1.96,
    unit: "quintal",
    market: "Ludhiana Mandi",
    lastUpdated: new Date().toISOString(),
  },
  {
    cropName: "Rice (Paddy)",
    cropNameHi: "धान",
    msp: 2183,
    currentPrice: 2100,
    priceChange: -30,
    priceChangePercent: -1.41,
    unit: "quintal",
    market: "Amritsar Mandi",
    lastUpdated: new Date().toISOString(),
  },
  {
    cropName: "Maize",
    cropNameHi: "मक्का",
    msp: 1870,
    currentPrice: 1920,
    priceChange: +20,
    priceChangePercent: +1.05,
    unit: "quintal",
    market: "Patiala Mandi",
    lastUpdated: new Date().toISOString(),
  },
  {
    cropName: "Soybean",
    cropNameHi: "सोयाबीन",
    msp: 4600,
    currentPrice: 4750,
    priceChange: +150,
    priceChangePercent: +3.26,
    unit: "quintal",
    market: "Jalandhar Mandi",
    lastUpdated: new Date().toISOString(),
  },
  {
    cropName: "Cotton",
    cropNameHi: "कपास",
    msp: 7020,
    currentPrice: 6850,
    priceChange: -170,
    priceChangePercent: -2.42,
    unit: "quintal",
    market: "Bathinda Mandi",
    lastUpdated: new Date().toISOString(),
  },
  {
    cropName: "Mustard",
    cropNameHi: "सरसों",
    msp: 5650,
    currentPrice: 5800,
    priceChange: +85,
    priceChangePercent: +1.49,
    unit: "quintal",
    market: "Ludhiana Mandi",
    lastUpdated: new Date().toISOString(),
  },
];

/** 90-day historical price data for Wheat (for the Recharts graph) */
export const MOCK_WHEAT_HISTORICAL: MarketHistoricalPoint[] = [
  { date: "2024-07-01", price: 2180, msp: 2275 },
  { date: "2024-07-08", price: 2200, msp: 2275 },
  { date: "2024-07-15", price: 2215, msp: 2275 },
  { date: "2024-07-22", price: 2190, msp: 2275 },
  { date: "2024-07-29", price: 2230, msp: 2275 },
  { date: "2024-08-05", price: 2250, msp: 2275 },
  { date: "2024-08-12", price: 2240, msp: 2275 },
  { date: "2024-08-19", price: 2260, msp: 2275 },
  { date: "2024-08-26", price: 2280, msp: 2275 },
  { date: "2024-09-02", price: 2270, msp: 2275 },
  { date: "2024-09-09", price: 2295, msp: 2275 },
  { date: "2024-09-16", price: 2310, msp: 2275 },
  { date: "2024-09-23", price: 2300, msp: 2275 },
  { date: "2024-09-30", price: 2320, msp: 2275 },
  { date: "2024-10-07", price: 2295, msp: 2275 },
  { date: "2024-10-14", price: 2315, msp: 2275 },
  { date: "2024-10-21", price: 2340, msp: 2275 },
];

// ─── MOCK DASHBOARD STATS ─────────────────────────────────────────────────────

export const MOCK_STAT_CARDS: StatCard[] = [
  {
    id: "wheat-msp",
    title: "Wheat MSP",
    value: "₹2,275",
    subValue: "per quintal",
    trend: "neutral",
    trendValue: "Govt. fixed",
    icon: "Wheat",
    color: "amber",
  },
  {
    id: "rainfall",
    title: "Seasonal Rainfall",
    value: "342 mm",
    subValue: "Oct 2024",
    trend: "down",
    trendValue: "12% below normal",
    icon: "CloudRain",
    color: "blue",
  },
  {
    id: "active-crops",
    title: "Active Crops",
    value: "3",
    subValue: "Wheat, Mustard, Maize",
    trend: "neutral",
    icon: "Sprout",
    color: "green",
  },
  {
    id: "ai-queries",
    title: "AI Queries Today",
    value: "7",
    subValue: "2 diagnoses, 5 chats",
    trend: "up",
    trendValue: "+3 from yesterday",
    icon: "BrainCircuit",
    color: "rose",
  },
];

// ─── MOCK ACTIVITY LOG ────────────────────────────────────────────────────────

export const MOCK_ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: "1",
    type: "pest_diagnosis",
    title: "Diagnosed: Wheat Stem Rust",
    description: "Confidence: 91% · Severity: High",
    timeAgo: "2 hours ago",
    icon: "ScanSearch",
  },
  {
    id: "2",
    type: "chat_message",
    title: "Asked about irrigation schedule",
    description: "AI recommended drip irrigation for mustard",
    timeAgo: "5 hours ago",
    icon: "MessageSquare",
  },
  {
    id: "3",
    type: "crop_recommendation",
    title: "Crop Advisor: Rabi Season",
    description: "Recommended Wheat & Mustard for loamy soil",
    timeAgo: "Yesterday",
    icon: "Lightbulb",
  },
  {
    id: "4",
    type: "market_query",
    title: "Checked Soybean prices",
    description: "Price: ₹4,750/quintal · Up 3.26%",
    timeAgo: "Yesterday",
    icon: "TrendingUp",
  },
  {
    id: "5",
    type: "scheme_search",
    title: "Viewed PM-KISAN scheme",
    description: "Eligibility confirmed for next instalment",
    timeAgo: "2 days ago",
    icon: "FileText",
  },
];

// ─── MOCK GOVERNMENT SCHEMES ──────────────────────────────────────────────────

export const MOCK_SCHEMES: GovernmentScheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    description: "Direct income support of ₹6,000/year to landholding farmer families.",
    benefits: ["₹6,000 annual support in 3 instalments", "Direct bank transfer", "No income tax deduction"],
    eligibility: ["Small & marginal farmers", "Land ownership required", "Valid bank account & Aadhaar"],
    applicationUrl: "https://pmkisan.gov.in",
    isActive: true,
  },
  {
    id: "fasal-bima",
    name: "Pradhan Mantri Fasal Bima Yojana",
    ministry: "Ministry of Agriculture",
    description: "Crop insurance scheme protecting farmers from financial losses due to natural calamities.",
    benefits: ["Crop loss compensation", "Low premium rates (2% Kharif, 1.5% Rabi)", "Technology-driven claim settlement"],
    eligibility: ["All farmers growing notified crops", "Loanee farmers automatically covered"],
    applicationUrl: "https://pmfby.gov.in",
    isActive: true,
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    ministry: "Ministry of Finance / NABARD",
    description: "Short-term credit for crop cultivation, post-harvest expenses, and allied activities.",
    benefits: ["Credit limit up to ₹3 lakh at 4% interest", "Flexible repayment", "Personal accident insurance"],
    eligibility: ["All farmers, SHGs, tenant farmers"],
    applicationUrl: "https://nabard.org/kcc",
    isActive: true,
  },
  {
    id: "soil-health-card",
    name: "Soil Health Card Scheme",
    ministry: "Ministry of Agriculture",
    description: "Free soil testing and nutrient recommendations every 2 years.",
    benefits: ["Free soil analysis", "Crop-wise fertiliser recommendations", "Reduces input costs"],
    eligibility: ["All farmers", "Apply at nearest Krishi Vigyan Kendra"],
    applicationUrl: "https://soilhealth.dac.gov.in",
    isActive: true,
  },
];