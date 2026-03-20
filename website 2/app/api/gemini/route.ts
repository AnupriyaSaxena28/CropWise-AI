/// <reference types="node" />
/**
 * app/api/gemini/route.ts
 * ============================================================
 * Central AI API Route — OpenAI GPT
 * Model: gpt-4.1-mini-2025-04-14
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { GeminiRequestBody, GeminiResponseBody } from "@/types";
import { safeJsonParse } from "@/lib/utils";

// ─── Model ────────────────────────────────────────────────────────────────────

const MODEL_TEXT   = "gpt-4.1-mini-2025-04-14";  // Text: chat + crop advisor
const MODEL_VISION = "gpt-4.1-mini-2025-04-14";  // Vision: pest diagnosis (supports images)

// ─── System Prompts ───────────────────────────────────────────────────────────

function buildChatSystemPrompt(language = "en", contextData?: string): string {
  const langMap: Record<string, string> = {
    en: "Respond in clear, simple English.",
    hi: "हिंदी में जवाब दें। सरल और स्पष्ट भाषा का उपयोग करें।",
    pa: "ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਸਾਦੀ ਭਾਸ਼ਾ ਵਰਤੋ।",
    mr: "मराठीत उत्तर द्या. साधी भाषा वापरा.",
    te: "తెలుగులో సమాధానం ఇవ్వండి.",
    ta: "தமிழில் பதில் அளிக்கவும்.",
  };

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

Use this context to make responses specific and relevant:
- High humidity → mention fungal disease risk
- Low soil moisture → recommend irrigation
- Price below MSP → mention procurement options
- Rain forecast → advise on spray timing` : ""}

LANGUAGE: ${langMap[language] ?? langMap["en"]}

RESPONSE GUIDELINES:
- Be concise, practical, and actionable
- Use Indian units: acres, quintals, bags (50kg). Currency in INR (₹)
- Use bullet points for steps, keep paragraphs short
- Always suggest consulting a local agronomist for critical decisions`;
}

const PEST_SYSTEM = `You are an expert plant pathologist for Indian crops.
Analyse the crop image and return VALID JSON ONLY — no text outside JSON.

{
  "diseaseName": "string",
  "scientificName": "string",
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

const CROP_ADVISOR_SYSTEM = `You are an expert agronomist for Indian farm economics.
Return VALID JSON ONLY — no text outside JSON.

{
  "recommendations": [{
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
  }],
  "generalAdvice": "string",
  "bestCrop": "string"
}`;

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<GeminiResponseBody>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiKey = (globalThis as any).process?.env?.OPENAI_API_KEY as string | undefined;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY not set in .env.local" },
        { status: 503 }
      );
    }

    let body: GeminiRequestBody;
    try { body = await req.json(); }
    catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }); }

    const { prompt, mode, language = "en", imageBase64, imageMimeType, context } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "Prompt required." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });

    if (mode === "chat") {
      return await handleChat(client, prompt, language, context);
    }
    if (mode === "pest_diagnosis") {
      if (!imageBase64 || !imageMimeType) {
        return NextResponse.json(
          { success: false, error: "Image required for pest diagnosis." },
          { status: 400 }
        );
      }
      return await handlePestDiagnosis(client, prompt, imageBase64, imageMimeType);
    }
    if (mode === "crop_advisor") {
      return await handleCropAdvisor(client, prompt, context);
    }

    return NextResponse.json({ success: false, error: `Invalid mode: ${mode}` }, { status: 400 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("[OpenAI API] Unhandled error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ─── Handler: Chat ────────────────────────────────────────────────────────────

async function handleChat(
  client: OpenAI,
  prompt: string,
  language: string,
  context?: string
): Promise<NextResponse<GeminiResponseBody>> {
  const completion = await client.chat.completions.create({
    model:       MODEL_TEXT,
    temperature: 0.7,
    max_tokens:  1024,
    messages: [
      { role: "system", content: buildChatSystemPrompt(language, context) },
      { role: "user",   content: prompt },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  return NextResponse.json({ success: true, text });
}

// ─── Handler: Pest Diagnosis (Vision) ────────────────────────────────────────

async function handlePestDiagnosis(
  client: OpenAI,
  prompt: string,
  imageBase64: string,
  imageMimeType: string
): Promise<NextResponse<GeminiResponseBody>> {
  const completion = await client.chat.completions.create({
    model:       MODEL_VISION,
    temperature: 0.2,
    max_tokens:  1024,
    messages: [
      { role: "system", content: PEST_SYSTEM },
      {
        role: "user",
        content: [
          {
            type:      "image_url",
            image_url: {
              url: `data:${imageMimeType};base64,${imageBase64}`,
            },
          },
          {
            type: "text",
            text: prompt || "Diagnose any disease or pest visible in this crop image.",
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const rawText    = completion.choices[0]?.message?.content ?? "";
  const structured = safeJsonParse<Record<string, unknown>>(rawText);

  if (!structured) {
    console.error("[Pest Diagnosis] Failed to parse JSON:", rawText);
    return NextResponse.json(
      { success: false, error: "AI returned unparseable response. Try again.", text: rawText },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, structured });
}

// ─── Handler: Crop Advisor ────────────────────────────────────────────────────

async function handleCropAdvisor(
  client: OpenAI,
  prompt: string,
  context?: string
): Promise<NextResponse<GeminiResponseBody>> {
  const fullPrompt = context
    ? `Farmer Profile:\n${context}\n\nRequest:\n${prompt}`
    : prompt;

  const completion = await client.chat.completions.create({
    model:       MODEL_TEXT,
    temperature: 0.4,
    max_tokens:  2048,
    messages: [
      { role: "system", content: CROP_ADVISOR_SYSTEM },
      { role: "user",   content: fullPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const rawText    = completion.choices[0]?.message?.content ?? "";
  const structured = safeJsonParse<Record<string, unknown>>(rawText);

  if (!structured) {
    return NextResponse.json(
      { success: false, error: "AI returned unparseable response.", text: rawText },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, structured });
}

// ─── CORS preflight ───────────────────────────────────────────────────────────

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}