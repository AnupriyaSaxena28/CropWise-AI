/**
 * app/chat/mock-sessions.ts
 * Mock chat history sessions for the sidebar.
 * Replace with Firestore real-time listener in production.
 */

import type { ChatSession } from "./types";
import type { ChatMessage } from "./types";

export const MOCK_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    title: "Yellow Rust Diagnosis",
    mode: "pest_diagnosis",
    lastMessage: "Based on your photo, I've identified potential Yellow Rust.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 6), // 6 min ago = "Today"
  },
  {
    id: "session-2",
    title: "Wheat Rust Help",
    mode: "general",
    lastMessage: "Apply Propiconazole fungicide as an immediate step.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26), // Yesterday
  },
  {
    id: "session-3",
    title: "Fertilizer Query",
    mode: "general",
    lastMessage: "For wheat at tillering stage, apply urea at 65 kg/acre.",
    updatedAt: new Date(2023, 9, 24), // Oct 24, 2023
  },
  {
    id: "session-4",
    title: "Weather Impact",
    mode: "general",
    lastMessage: "The upcoming rain forecast suggests delaying herbicide spray.",
    updatedAt: new Date(2023, 9, 20), // Oct 20, 2023
  },
];

/**
 * The pre-loaded conversation shown in session-1 (matches the design screenshot).
 * In production this would be fetched from Firestore sub-collection.
 */
export const MOCK_INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content:
      "I've noticed some yellowish-orange streaks on my winter wheat crops in the north sector. Can you help identify what this is? I've attached a photo of the leaves.",
    createdAt: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: "msg-2",
    role: "model",
    content:
      "Based on your photo, I've identified potential Yellow Rust. See the diagnosis card below for detailed analysis and recommended actions.",
    diagnosisResult: {
      diseaseName: "Yellow Rust",
      scientificName: "Puccinia striiformis",
      confidencePercent: 92,
      severity: "Moderate",
      affectedArea: "~25% of visible leaf area",
      symptoms: [
        "Yellowish-orange stripe pustules parallel to leaf veins",
        "White to pale yellow striping between pustules",
        "Leaves feel powdery to the touch",
        "Lower leaves affected more severely than upper canopy",
      ],
      treatment: {
        immediate: [
          "Apply Propiconazole or Tebuconazole fungicide immediately to halt spread.",
          "Isolate affected patch by creating a 2-meter buffer zone of non-host vegetation if possible.",
        ],
        preventive: [
          "Plant rust-resistant wheat varieties (e.g., HD-2967, WH-1105) next season.",
          "Avoid excessive nitrogen fertilisation which promotes lush, susceptible growth.",
          "Monitor fields regularly during cool, moist weather conditions.",
        ],
        recommendedPesticides: ["Tilt 250 EC (Propiconazole)", "Folicur (Tebuconazole)", "Nativo (Tebuconazole + Trifloxystrobin)"],
      },
      disclaimer:
        "Consult a local agronomist or Krishi Vigyan Kendra for confirmation before applying treatments.",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
  },
];