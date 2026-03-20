/// <reference types="node" />
/**
 * app/api/gemini/route.ts
 * ============================================================
 * Central Gemini AI API Route Handler
 *
 * Modes:
 *   1. "chat"           — Conversational AI with real-time context injection
 *   2. "pest_diagnosis" — Gemini Vision: image → structured disease JSON
 *   3. "crop_advisor"   — Form inputs → structured crop recommendation JSON
 *
 * Model: gemini-2.0-flash (current stable, replaces deprecated gemini-1.5-flash)
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type Part,
} from "@google/generative-ai";
import type { GeminiRequestBody, GeminiResponseBody } from "@/types";
import { safeJsonParse } from "@/lib/utils";

// ─── Model names ──────────────────────────────────────────────────────────────
// gemini-2.0-flash — current recommended model (replaces deprecated gemini-1.5-flash)
const MODEL_TEXT   = "gemini-2.0-flash";
const MODEL_VISION = "gemini-2.0-flash"; // Same model — multimodal

/** Safety settings balanced for agricultural content */
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// ─── System Prompts ───────────────────────────────────────────────────────────

function buildChatSystemPrompt(language = "en", contextData?: string): string {
  const langInstructions: Record<string, string> = {
    en: "Respond in clear, simple English.",
    hi: "हिंदी में जवाब दें। सरल और स्पष्ट भाषा का उपयोग करें।",
    pa: "ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਸਾਦੀ ਭਾਸ਼ਾ ਵਰਤੋ।",
    mr: "मराठीत उत्तर द्या. साधी भाषा वापरा.",
    te: "తెలుగులో సమాధానం ఇవ్వండి.",
    ta: "தமிழில் பதில் அளிக்கவும்.",
  };
  const langInstruction = langInstructions[language] ?? langInstructions["en"];

  return `You are CropWise AI, an expert agricultural advisor for Indian farmers.

Your expertise covers:
- Crop cultivation: wheat, rice, maize, cotton, pulses, oilseeds, vegetables
- Soil health, fertilisation, and irrigation best practices
- Integrated Pest Management (IPM) and organic farming
- Indian agricultural seasons: Kharif, Rabi, and Zaid
- Government schemes: PM-KISAN, PMFBY, KCC, Soil Health Card
- Market prices and Minimum Support Prices (MSP) for major crops
- Climate-smart agriculture for Indian agro-climatic zones

${contextData ? `REAL-TIME FARM CONTEXT (use this to give personalised advice):
${contextData}

Use this context to make your responses specific and relevant to the farmer's actual situation.
For example, if weather shows high humidity, mention fungal disease risk.
If soil moisture is low, recommend irrigation.
If a market price is below MSP, mention procurement options.` : ""}

LANGUAGE: ${langInstruction}

RESPONSE GUIDELINES:
- Be concise, practical, and actionable.
- Use Indian units: acres, quintals, bags (50kg).
- Currency in INR.
- Format: use bullet points for steps, keep paragraphs short.
- Always suggest consulting a local agronomist for critical decisions.

Do NOT provide medical advice or financial guarantees.`;
}

const PEST_DIAGNOSIS_SYSTEM_PROMPT = `You are an expert plant pathologist for Indian crops.

Analyse the crop image and return VALID JSON ONLY — no text outside the JSON object.

Return exactly this structure:
{
  "diseaseName": "string",
  "scientificName": "string (optional)",
  "confidencePercent": number,
  "severity": "Low" | "Moderate" | "High" | "Critical",
  "affectedArea": "string",
  "symptoms": ["string"],
  "treatment": {
    "immediate": ["string"],
    "preventive": ["string"],
    "recommendedPesticides": ["string"]
  },
  "disclaimer": "Consult a local agronomist before applying treatments."
}`;

const CROP_ADVISOR_SYSTEM_PROMPT = `You are an expert agronomist specialising in Indian farm economics.

Return VALID JSON ONLY — no text outside the JSON object.

{
  "recommendations": [
    {
      "cropName": "string",
      "localName": "string",
      "suitabilityScore": number,
      "expectedYield": "string",
      "estimatedROI": {
        "investmentPerAcre": number,
        "expectedRevenuePerAcre": number,
        "profitPerAcre": number,
        "paybackMonths": number
      },
      "growingPeriodDays": number,
      "waterRequirement": "Low" | "Medium" | "High",
      "soilCompatibility": "string",
      "reasonsForRecommendation": ["string"],
      "risks": ["string"]
    }
  ],
  "generalAdvice": "string",
  "bestCrop": "string"
}`;

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse<GeminiResponseBody>> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API key not configured." },
        { status: 503 }
      );
    }

    let body: GeminiRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
    }

    const {
      prompt, mode, language = "en",
      imageBase64, imageMimeType, context,
    } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "Prompt is required." }, { status: 400 });
    }

    if (!["chat", "pest_diagnosis", "crop_advisor"].includes(mode)) {
      return NextResponse.json({ success: false, error: `Invalid mode: ${mode}` }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    switch (mode) {
      case "chat":
        return await handleChat({ genAI, prompt, language, context });
      case "pest_diagnosis":
        if (!imageBase64 || !imageMimeType) {
          return NextResponse.json(
            { success: false, error: "Image required for pest diagnosis." },
            { status: 400 }
          );
        }
        return await handlePestDiagnosis({ genAI, prompt, imageBase64, imageMimeType });
      case "crop_advisor":
        return await handleCropAdvisor({ genAI, prompt, context });
      default:
        return NextResponse.json({ success: false, error: "Unknown mode." }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    console.error("[Gemini API] Unhandled error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ─── Mode Handlers ────────────────────────────────────────────────────────────

interface ChatParams {
  genAI: GoogleGenerativeAI;
  prompt: string;
  language: string;
  context?: string;
}

async function handleChat({ genAI, prompt, language, context }: ChatParams): Promise<NextResponse<GeminiResponseBody>> {
  const model = genAI.getGenerativeModel({
    model: MODEL_TEXT,
    systemInstruction: buildChatSystemPrompt(language, context),
    safetySettings: SAFETY_SETTINGS,
    generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 1024 },
  });

  const result = await model.generateContent(prompt);
  return NextResponse.json({ success: true, text: result.response.text() });
}

interface PestDiagnosisParams {
  genAI: GoogleGenerativeAI;
  prompt: string;
  imageBase64: string;
  imageMimeType: string;
}

async function handlePestDiagnosis({ genAI, prompt, imageBase64, imageMimeType }: PestDiagnosisParams): Promise<NextResponse<GeminiResponseBody>> {
  const model = genAI.getGenerativeModel({
    model: MODEL_VISION,
    systemInstruction: PEST_DIAGNOSIS_SYSTEM_PROMPT,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  });

  const imagePart: Part = { inlineData: { data: imageBase64, mimeType: imageMimeType } };
  const textPart:  Part = { text: prompt || "Diagnose any disease or pest issues visible in this crop image." };

  const result     = await model.generateContent([imagePart, textPart]);
  const rawText    = result.response.text();
  const structured = safeJsonParse<Record<string, unknown>>(rawText);

  if (!structured) {
    console.error("[Pest Diagnosis] Failed to parse JSON:", rawText);
    const errBody: GeminiResponseBody = {
      success: false,
      error:   "AI returned unparseable response. Please try again.",
      text:    rawText,
    };
    return NextResponse.json(errBody, { status: 500 });
  }

  const pestBody: GeminiResponseBody = { success: true, structured };
  return NextResponse.json(pestBody);
}

interface CropAdvisorParams {
  genAI: GoogleGenerativeAI;
  prompt: string;
  context?: string;
}

async function handleCropAdvisor({ genAI, prompt, context }: CropAdvisorParams): Promise<NextResponse<GeminiResponseBody>> {
  const model = genAI.getGenerativeModel({
    model: MODEL_TEXT,
    systemInstruction: CROP_ADVISOR_SYSTEM_PROMPT,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.4,
      topP: 0.85,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });

  const fullPrompt = context
    ? `Farmer Profile:\n${context}\n\nRequest:\n${prompt}`
    : prompt;

  const result     = await model.generateContent(fullPrompt);
  const rawText    = result.response.text();
  const structured = safeJsonParse<Record<string, unknown>>(rawText);

  if (!structured) {
    const errBody: GeminiResponseBody = {
      success: false,
      error:   "AI returned unparseable response.",
      text:    rawText,
    };
    return NextResponse.json(errBody, { status: 500 });
  }

  const advisorBody: GeminiResponseBody = { success: true, structured };
  return NextResponse.json(advisorBody);
}

// ─── OPTIONS (CORS) ───────────────────────────────────────────────────────────

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}