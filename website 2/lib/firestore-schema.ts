/**
 * ============================================================
 * CropWise AI — Firestore NoSQL Schema
 * ============================================================
 *
 * COLLECTION STRUCTURE OVERVIEW:
 *
 * firestore-root/
 * ├── users/                        # Collection
 * │   └── {userId}/                 # Document (keyed by Firebase Auth UID)
 * │       ├── profile fields...
 * │       └── (no sub-collections here; keep flat for cost efficiency)
 * │
 * ├── activityLogs/                 # Collection
 * │   └── {logId}/                  # Document (auto-ID)
 * │       └── activity fields...
 * │
 * └── chatHistory/                  # Collection
 *     └── {sessionId}/              # Document (auto-ID or userId+timestamp)
 *         ├── session fields...
 *         └── messages/             # Sub-collection
 *             └── {messageId}/      # Document (auto-ID)
 *                 └── message fields...
 *
 * ============================================================
 */


/**
 * Timestamp type alias — resolves to firebase-admin Firestore Timestamp.
 * After `npm install`, this is available via `firebase-admin/firestore`.
 * Using a local alias keeps this schema file import-free and portable.
 */
type Timestamp = {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
};

// ─── USER PROFILE ────────────────────────────────────────────────────────────
// Path: users/{userId}
// Created on: first sign-in via Firebase Auth trigger or explicit registration call

export interface FirestoreUser {
  uid: string;                    // Same as Firebase Auth UID (document ID)
  email: string;
  displayName: string;
  photoURL: string | null;

  // Farmer-specific profile
  farmName: string;               // e.g. "Sharma Farms"
  location: {
    state: string;                // e.g. "Punjab"
    district: string;             // e.g. "Ludhiana"
    pincode: string;
    coordinates?: {               // Optional: for weather API look-up
      lat: number;
      lng: number;
    };
  };
  landHolding: number;            // Acres
  primaryCrops: string[];         // e.g. ["wheat", "rice"]
  preferredLanguage: "en" | "hi" | "pa" | "mr" | "te" | "ta";

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  isOnboarded: boolean;           // Whether onboarding form is completed
}

// ─── ACTIVITY LOG ────────────────────────────────────────────────────────────
// Path: activityLogs/{logId}
// Written by: server-side API routes after significant AI interactions
//
// Firestore indexes needed:
//   - (userId ASC, createdAt DESC) — for per-user activity feed
//   - (type ASC, createdAt DESC)   — for analytics by feature

export type ActivityType =
  | "chat_message"        // User sent a chat message
  | "pest_diagnosis"      // Image uploaded for pest diagnosis
  | "crop_recommendation" // Crop advisor form submitted
  | "market_query"        // Market prices viewed
  | "weather_check"       // Weather page visited
  | "scheme_search"       // Government scheme searched
  | "profile_update";     // Profile edited

export interface FirestoreActivityLog {
  id: string;                     // Auto-generated Firestore document ID
  userId: string;                 // Ref → users/{userId}
  type: ActivityType;
  title: string;                  // Human-readable, e.g. "Diagnosed: Wheat Rust"
  description: string;            // Short summary of the activity
  metadata: Record<string, unknown>; // Flexible: store crop name, confidence %, etc.
  createdAt: Timestamp;
}

// ─── CHAT SESSION ────────────────────────────────────────────────────────────
// Path: chatHistory/{sessionId}
// A session groups messages for a single conversation thread

export type ChatMode = "general" | "crop_advisor" | "pest_diagnosis";

export interface FirestoreChatSession {
  id: string;                     // Auto-generated document ID
  userId: string;                 // Ref → users/{userId}
  mode: ChatMode;
  title: string;                  // Auto-generated from first message, e.g. "Wheat disease help"
  language: string;               // ISO 639-1 code, e.g. "hi", "en"
  messageCount: number;           // Denormalized counter (avoids sub-collection count query)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── SHARED TYPES ────────────────────────────────────────────────────────────
// Used in message metadata and API responses

export type SeverityLevel = "Low" | "Moderate" | "High" | "Critical";

export interface PestDiagnosisResult {
  diseaseName: string;            // e.g. "Wheat Stem Rust"
  scientificName?: string;        // e.g. "Puccinia graminis"
  confidencePercent: number;      // 0–100
  severity: SeverityLevel;
  affectedArea: string;           // e.g. "~30% of visible leaf area"
  symptoms: string[];             // Bullet-point symptoms observed
  treatment: {
    immediate: string[];          // Actions to take now
    preventive: string[];         // Long-term prevention
    recommendedPesticides?: string[]; // Brand names or chemical names
  };
  disclaimer: string;             // "Consult a local agronomist for confirmation"
}

// ─── CHAT MESSAGE ────────────────────────────────────────────────────────────
// Path: chatHistory/{sessionId}/messages/{messageId}
// Ordered by: createdAt ASC

export type MessageRole = "user" | "model"; // "model" matches Gemini API convention

export interface FirestoreChatMessage {
  id: string;                     // Auto-generated document ID
  sessionId: string;              // Ref → chatHistory/{sessionId}
  role: MessageRole;
  content: string;                // Text content of the message
  imageUrl?: string;              // Firebase Storage URL if image was attached
  pestDiagnosisResult?: PestDiagnosisResult; // Populated for pest diagnosis messages
  createdAt: Timestamp;
}

export interface CropRecommendation {
  cropName: string;
  localName?: string;             // Name in local language
  suitabilityScore: number;       // 0–100
  expectedYield: string;          // e.g. "45–55 quintals/acre"
  estimatedROI: {
    investmentPerAcre: number;    // INR
    expectedRevenuePerAcre: number; // INR
    profitPerAcre: number;        // INR
    paybackMonths: number;
  };
  growingPeriodDays: number;
  waterRequirement: "Low" | "Medium" | "High";
  soilCompatibility: string;
  reasonsForRecommendation: string[];
  risks: string[];
}

/**
 * ============================================================
 * FIRESTORE SECURITY RULES (save as firestore.rules)
 * ============================================================
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *
 *     // Users can only read/write their own profile
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *
 *     // Activity logs: users can only read their own; writes are server-only
 *     match /activityLogs/{logId} {
 *       allow read: if request.auth != null
 *                   && resource.data.userId == request.auth.uid;
 *       allow write: if false; // Server-side only via Admin SDK
 *     }
 *
 *     // Chat history: users can read/write their own sessions
 *     match /chatHistory/{sessionId} {
 *       allow read, write: if request.auth != null
 *                          && resource.data.userId == request.auth.uid;
 *
 *       match /messages/{messageId} {
 *         allow read, write: if request.auth != null;
 *         // Note: Add deeper validation linking sessionId → userId in production
 *       }
 *     }
 *   }
 * }
 */