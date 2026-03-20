# 🌾 CropWise AI — Smart Farming Advisor

<div align="center">

![CropWise AI](https://img.shields.io/badge/CropWise-AI-2ea82e?style=for-the-badge&logo=leaf&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=for-the-badge&logo=firebase)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google)

**An AI-powered digital agronomist for Indian farmers — built for hackathons, production-ready.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Setup](#-setup) • [API Integrations](#-api-integrations) • [Project Structure](#-project-structure) • [Screenshots](#-screenshots)

</div>

---

## 🚀 Overview

CropWise AI is a full-stack web application that brings enterprise-grade agricultural intelligence to Indian farmers. It combines real-time weather data, live mandi prices, Gemini Vision AI for pest diagnosis, and multilingual chat support — all in a clean, mobile-responsive dark-themed interface.

Built as a hackathon project, it demonstrates end-to-end integration of:
- **Conversational AI** with real-time farm context injection
- **Computer Vision** for plant disease detection
- **Live data APIs** — weather, soil moisture, evapotranspiration, mandi prices
- **Firebase** for authentication, real-time database, and user profiles

---

## ✨ Features

### 🤖 AI Chat Advisor
- Multilingual conversational AI (English, Hindi, Punjabi, Marathi, Telugu, Tamil)
- **Real-time context injection** — every AI response uses live weather, soil moisture, mandi prices, and user's farm profile
- Firebase Firestore chat history persistence across sessions
- Suggestion chips for common farming queries

### 🔬 Pest & Disease Diagnosis
- Upload crop photo → Gemini Vision AI identifies disease/pest
- Returns disease name, scientific name, severity level (Low/Moderate/High/Critical)
- Detailed treatment protocol with immediate actions + preventive measures
- Recommended pesticide names with dosage guidance
- Activity logged to Firebase for history tracking

### 🌱 AI Crop Advisor
- Form-based crop recommendation engine
- Analyses soil type, season, water source, land area, previous crop
- Returns top crop recommendations with ROI breakdown:
  - Investment per acre (INR)
  - Expected revenue per acre
  - Profit per acre + payback months
- Growth stage timeline + risk assessment

### 🌤️ Weather Intelligence
- **Real GPS location** — browser geolocation + Nominatim reverse geocoding
- Live temperature, humidity, wind speed, UV index, visibility
- **Real soil moisture** from Open-Meteo `soil_moisture_0_to_1cm` parameter
- **Evapotranspiration** (ET₀) — FAO Penman-Monteith method
- **Solar radiation** (kWh/m²)
- 7-day local forecast with precipitation probability
- 24-hour hourly trend chart (temperature + rain probability)
- **AI Agronomist Alerts** — dynamic spray window, irrigation tip, hazard alert based on actual data

### 📈 Market Prices (Mandi Intelligence)
- Live commodity prices from **data.gov.in Agmarknet API**
- MSP 2024-25 comparison for all major crops
- Historical price trend chart (6 months)
- Crops: Wheat, Rice, Maize, Soybean, Cotton, Mustard, Groundnut, Tur (Arhar)
- Realistic fallback prices when API key not configured

### 📋 Activity Log (Farm Ledger)
- Log farm operations: Irrigation, Fertilizer, Pesticide, Weeding, Sowing, Harvesting
- Real Firebase Firestore CRUD with modal input form
- Paginated table with status tracking (Completed/Scheduled/Pending)
- Monthly spending calculator from actual logged entries
- AI insight based on logged activity patterns

### 👤 Farm Profile
- Auto-filled from Firebase Auth (Google OAuth)
- GPS auto-detection → reverse geocoded to city, state, district, pincode
- Primary crops management (add/remove chips)
- Farm Intelligence Score — calculated from profile completeness (0–100)
- Preferred language persistence

### 🏛️ Government Schemes
- Curated directory of major agricultural schemes:
  - PM-KISAN (₹6,000/year income support)
  - Pradhan Mantri Fasal Bima Yojana (crop insurance)
  - Kisan Credit Card (low interest loans)
  - Soil Health Card scheme
- Deadline tracking, eligibility tags, direct application links
- Search and category filter

### ⚙️ Settings
- Language preference → saved to Firebase user profile
- WhatsApp/Telegram/SMS alert toggles
- App notification preferences
- Data encryption information

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.5 |
| **Styling** | Tailwind CSS 3.4 |
| **Charts** | Recharts 2.12 |
| **Icons** | Lucide React |
| **AI / LLM** | Google Gemini API (`gemini-1.5-flash-latest`) |
| **Auth** | Firebase Authentication (Email + Google OAuth) |
| **Database** | Firebase Firestore (NoSQL) |
| **Weather** | Open-Meteo API (free, no key required) |
| **Geocoding** | Nominatim / OpenStreetMap (free, no key required) |
| **Market Prices** | data.gov.in Agmarknet API (free registration) |
| **State Management** | React Hooks (useState, useEffect, useCallback) |
| **Font** | DM Sans + DM Mono (Google Fonts) |

---

## 📡 API Integrations

### Free APIs (No Key Required)

| API | Used For | Endpoint |
|---|---|---|
| **Open-Meteo** | Live weather, soil moisture, ET₀, solar radiation, hourly forecast | `https://api.open-meteo.com/v1/forecast` |
| **Nominatim (OSM)** | GPS coordinates → city/state/district name | `https://nominatim.openstreetmap.org/reverse` |
| **Browser Geolocation** | Real GPS coordinates from device | Native browser API |

### APIs Requiring Key

| API | Used For | Get Key |
|---|---|---|
| **Google Gemini** | AI chat, pest diagnosis, crop advisor | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **Firebase** | Auth, Firestore, user data | [console.firebase.google.com](https://console.firebase.google.com) |
| **data.gov.in** | Live mandi/Agmarknet prices | [data.gov.in/user/register](https://data.gov.in/user/register) |

### Open-Meteo Parameters Used
```
Current: temperature_2m, relative_humidity_2m, apparent_temperature,
         precipitation, weather_code, wind_speed_10m, visibility,
         uv_index, soil_temperature_0cm, soil_moisture_0_to_1cm

Daily:   weather_code, temperature_2m_max/min, precipitation_probability_max,
         precipitation_sum, et0_fao_evapotranspiration, shortwave_radiation_sum

Hourly:  temperature_2m, precipitation_probability, soil_moisture_0_to_1cm
```

---

## 🗂️ Project Structure

```
CropWise-AI/
│
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with AuthProvider
│   ├── page.tsx                  # Redirect → /dashboard
│   ├── globals.css               # Global styles + Tailwind
│   │
│   ├── login/page.tsx            # Firebase Auth (Email + Google)
│   ├── dashboard/page.tsx        # Live weather + stats + activity
│   ├── chat/page.tsx             # AI Chat with multilingual support
│   ├── pest-diagnosis/page.tsx   # Gemini Vision disease detector
│   ├── crop-advisor/page.tsx     # AI crop recommendation engine
│   ├── market/page.tsx           # Live mandi prices + chart
│   ├── weather/page.tsx          # Full weather intelligence page
│   ├── schemes/page.tsx          # Government schemes directory
│   ├── activity-log/page.tsx     # Farm operations ledger
│   ├── profile/page.tsx          # User profile + GPS auto-fill
│   └── settings/page.tsx        # App preferences
│
├── app/api/                      # Server-side API routes
│   ├── gemini/route.ts           # Gemini AI handler (chat/diagnosis/advisor)
│   ├── weather/route.ts          # Open-Meteo weather proxy
│   └── market/route.ts           # Agmarknet market prices proxy
│
├── components/
│   ├── auth/AuthGuard.tsx        # Route protection component
│   ├── layout/
│   │   ├── AppShell.tsx          # Authenticated page wrapper
│   │   └── Sidebar.tsx           # Collapsible navigation sidebar
│   ├── chat/
│   │   ├── ChatInterface.tsx     # Full chat UI with context injection
│   │   ├── ChatSidebar.tsx       # Session history panel
│   │   ├── ChatInputBar.tsx      # Message input + image upload
│   │   ├── MessageBubble.tsx     # Chat message renderer
│   │   └── DiagnosisCard.tsx     # Pest diagnosis result card
│   ├── dashboard/
│   │   ├── StatCard.tsx          # Metric stat card
│   │   ├── WeatherWidget.tsx     # Weather mini widget
│   │   ├── ActivityFeed.tsx      # Recent activity list
│   │   └── MarketPriceTable.tsx  # Mandi price table
│   └── profile/
│       └── IntelligenceScore.tsx # Animated SVG score ring
│
├── lib/
│   ├── firebase/
│   │   ├── client.ts             # Firebase client SDK init
│   │   ├── admin.ts              # Firebase Admin SDK (server)
│   │   ├── auth-context.tsx      # Global Auth context + hooks
│   │   ├── user-profile.ts       # Firestore user CRUD
│   │   ├── activity-log.ts       # Activity log read/write
│   │   └── chat-history.ts       # Chat sessions + messages
│   ├── hooks/
│   │   └── useLocation.ts        # GPS + reverse geocoding hook
│   ├── weather.ts                # Open-Meteo API integration
│   ├── market-prices.ts          # Agmarknet API + fallback
│   ├── firestore-schema.ts       # TypeScript interfaces for Firestore
│   └── utils.ts                  # Utility functions
│
├── types/index.ts                # Shared TypeScript types
├── middleware.ts                 # Next.js route middleware
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Composite indexes config
├── tailwind.config.ts            # Tailwind theme config
└── .env.local                    # Environment variables (not committed)
```

---

## 🔥 Firestore Collections

```
firestore-root/
├── users/{uid}                    # User profiles
│   ├── farmName, landHolding
│   ├── location: { state, district, pincode, coordinates }
│   ├── primaryCrops: string[]
│   └── preferredLanguage
│
├── activityLogs/{logId}           # AI interaction history (dashboard feed)
│   ├── userId, type, title
│   └── createdAt
│
├── farmActivities/{activityId}    # Manual farm operation ledger
│   ├── userId, type, action
│   ├── quantity, costINR, status
│   └── createdAt
│
└── chatHistory/{sessionId}        # Chat sessions
    ├── userId, mode, title, language
    └── messages/{messageId}       # Sub-collection
        ├── role: "user" | "model"
        ├── content
        └── diagnosisResult?       # For pest diagnosis messages
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (free Spark plan)
- Google Gemini API key (free)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/cropwise-ai.git
cd cropwise-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# ── Google Gemini AI ─────────────────────────────────────────────
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ── Firebase Client SDK (public — safe for browser) ──────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ── Firebase Admin SDK (server-only — never expose) ───────────────
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ── Market Prices (optional — fallback used if not set) ───────────
# Get from: https://data.gov.in/user/register
MARKET_API_KEY=your_data_gov_in_api_key

# ── App ──────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Firebase Setup

#### a) Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create new project → name it `cropwise-ai`
3. Disable Google Analytics (not needed)

#### b) Enable Authentication
- Authentication → Sign-in method → Enable:
  - **Email/Password**
  - **Google**

#### c) Create Firestore Database
- Firestore Database → Create database
- Start in **test mode**
- Region: `asia-south1` (Mumbai)

#### d) Deploy Security Rules & Indexes
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # Select existing project
firebase deploy --only firestore:rules,firestore:indexes
```

#### e) Get Admin SDK Key
- Project Settings → Service Accounts → Generate new private key
- Copy values into `.env.local`

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the login page.

### 6. Build for production
```bash
npm run build
npm start
```

---

## 🌐 Supported Regions

GPS auto-detection works anywhere in India. Fallback coordinates are configured for:

| State | Default City |
|---|---|
| Punjab | Ludhiana |
| Madhya Pradesh | Bhopal |
| Maharashtra | Aurangabad |
| Uttar Pradesh | Lucknow |
| Gujarat | Rajkot |
| Rajasthan | Ajmer |
| Haryana | Hisar |
| Andhra Pradesh | Guntur |
| Telangana | Hyderabad |
| Karnataka | Dharwad |
| Tamil Nadu | Coimbatore |
| Bihar | Patna |
| West Bengal | Barddhaman |
| Odisha | Cuttack |
| Chhattisgarh | Raipur |

---

## 🌍 Languages Supported

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `hi` | Hindi | Devanagari |
| `pa` | Punjabi | Gurmukhi |
| `mr` | Marathi | Devanagari |
| `te` | Telugu | Telugu |
| `ta` | Tamil | Tamil |

---

## 🤖 Gemini AI Models

The app supports multiple Gemini models — switch in `app/api/gemini/route.ts`:

| Model | Tier | Rate Limit | Best For |
|---|---|---|---|
| `gemini-1.5-flash-latest` | Free | 15 req/min | Default — hackathon use |
| `gemini-1.5-pro-latest` | Free | 2 req/min | Better reasoning |
| `gemini-2.0-flash` | Paid | 1000 req/min | Production |

```typescript
// app/api/gemini/route.ts — line 28
const MODEL_TEXT   = "gemini-1.5-flash-latest"; // change here
const MODEL_VISION = "gemini-1.5-flash-latest"; // and here
```

---

## 📊 Real-Time Data Sources

| Feature | Data Source | Refresh |
|---|---|---|
| Temperature, Humidity, Wind | Open-Meteo API | Live |
| Soil Moisture | Open-Meteo `soil_moisture_0_to_1cm` | Live |
| Evapotranspiration (ET₀) | Open-Meteo FAO-56 PM method | Daily |
| Solar Radiation | Open-Meteo `shortwave_radiation_sum` | Daily |
| 7-Day Forecast | Open-Meteo | Every 30 min |
| GPS Location | Browser Geolocation API | On load |
| City/State Name | Nominatim reverse geocoding | On GPS fetch |
| Mandi Prices | data.gov.in Agmarknet | Daily |
| MSP Values | GOI 2024-25 (hardcoded) | Annual |
| Chat History | Firebase Firestore | Real-time |
| User Profile | Firebase Firestore | On save |
| Activity Logs | Firebase Firestore | On action |

---

## 🔐 Security

- All routes protected by `AuthGuard` component
- Firebase Auth JWT validation on every request
- Firestore Security Rules enforce user-level data isolation
- Admin SDK private key only used server-side (never exposed to browser)
- `NEXT_PUBLIC_` prefix only on safe, public Firebase config values

---

## 🧪 Troubleshooting

### Gemini API 429 Error
```
[429 Too Many Requests] You exceeded your current quota
```
→ Free tier rate limit hit. Wait 1 minute, or get a new API key from a different Google account at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### Gemini API 404 Error
```
models/gemini-1.5-flash is not found
```
→ Deprecated model name. Make sure `route.ts` uses `gemini-1.5-flash-latest`

### Location showing Bhopal (default)
→ Browser GPS permission denied. Fix:
1. Click the 🔒 lock icon in Chrome address bar
2. Set Location → Allow
3. Run in browser console: `sessionStorage.removeItem("cropwise_user_location")`
4. Refresh the page

### Firebase Authentication Error
→ Ensure Email/Password and Google sign-in methods are enabled in Firebase Console → Authentication → Sign-in method

### Market Prices showing fallback data
→ `MARKET_API_KEY` not set in `.env.local`. Register free at [data.gov.in](https://data.gov.in/user/register) to get real mandi prices.

---

## 📦 Key Dependencies

```json
{
  "next": "14.2.5",
  "@google/generative-ai": "^0.15.0",
  "firebase": "^10.12.4",
  "firebase-admin": "^12.3.1",
  "recharts": "^2.12.7",
  "lucide-react": "^0.414.0",
  "tailwindcss": "^3.4.7",
  "typescript": "^5.5.3",
  "uuid": "^10.0.0",
  "date-fns": "^3.6.0"
}
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│  Next.js App Router  ·  React 18  ·  Tailwind CSS  ·  Recharts │
│                                                                  │
│  useLocation Hook → Browser GPS → Nominatim Geocoding           │
│  useAuth Hook     → Firebase Auth JWT                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / Server Components
┌──────────────────────────▼──────────────────────────────────────┐
│                    Next.js API Routes (Server)                  │
│                                                                  │
│  /api/gemini  →  Google Gemini 1.5 Flash (AI responses)        │
│  /api/weather →  Open-Meteo API (weather + soil data)          │
│  /api/market  →  data.gov.in Agmarknet (mandi prices)          │
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
┌──────────────▼──────────┐  ┌────────────▼────────────────────────┐
│   Google Gemini API     │  │         Firebase                     │
│                         │  │                                      │
│  • Chat (multilingual)  │  │  Auth  →  Email + Google OAuth       │
│  • Pest diagnosis       │  │  Firestore →  users/                 │
│  • Crop recommendation  │  │              activityLogs/           │
│                         │  │              farmActivities/         │
└─────────────────────────┘  │              chatHistory/messages/   │
                             └──────────────────────────────────────┘



