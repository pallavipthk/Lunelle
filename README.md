<<<<<<< HEAD
# 🌸 Lunelle — Your health, your story.
> *A little more in tune with you.*

Lunelle is a complete, polished, responsive, privacy-first women's health platform that empowers users to track their health, interpret laboratory reports, discover explainable patterns, manage private health records, and access understandable health information through text and voice in English, Hindi, Marathi, and Hinglish.

---

## 🌿 Core Product Principles

1. **Authentic Data Foundation**: Insights and summaries are calculated strictly from authorized, saved user records—never simulated or fabricated.
2. **Explainable Patterns**: The Explainable Health Pattern Finder transparently separates correlation from causation, cites supporting database entries, and explicitly documents missing context.
3. **Clinical Safety Layer**: Deterministic red-flag emergency detection operates independently of generative models, providing immediate access to verified emergency helplines in India (112, 108, 1091, 14416).
4. **Hinglish & Multi-Language Voice**: Natural language parsing that understands everyday colloquial Indian-language health descriptions (e.g. *"kal se sir dukh raha h"*, *"period 10 din late hai"*, *"Mala sakalpasun thakva vattoy"*).
5. **Human-in-the-Loop Extraction**: Lab report extraction requires interactive user verification and confirmation before values are saved to permanent records.
6. **Data Autonomy**: Full JSON export and one-tap complete record/account deletion.

---

## 🎨 Visual Design System

Inspired by premium editorial wellness journals and Pinterest aesthetics:
- **Main Background**: `#FFFCF6`
- **Deep Sage**: `#345344`
- **Botanical Green**: `#A9BFA6`
- **Pale Sage**: `#DFE8DA`
- **Dusty Rose**: `#F2E0DB`
- **Muted Rose**: `#B77D78`
- **Butter Cream**: `#F6EACB`
- **Primary Text**: `#303B33`
- **Secondary Text**: `#778078`
- **Borders**: `#E9E6DD`

**Typography**:
- *Playfair Display*: Editorial headlines and section titles.
- *DM Sans*: UI controls, forms, navigation, and body labels.
- *Cormorant Garamond*: Restrained editorial italics.

---

## 🏗️ Architecture & Modules

### 1. Frontend (Vite + React 18 + TypeScript + Tailwind CSS)
- **Landing Page**: Editorial presentation with interactive live component preview, feature matrix, and verified privacy disclosures.
- **Authentication & Onboarding**: Email/password authentication with optional multi-step preference setup (language, tone, module toggling, data consent).
- **Navigation (10 Core Modules)**:
  1. **Overview**: Personalized greetings, daily quick check-ins, recent entries, upcoming reminders, and pattern cards.
  2. **My Health**: Personal health summary (allergies, medications, conditions) and Whole-Health Chronological Timeline.
  3. **Symptom Tracker**: Structured logging and Hinglish voice dictation with draft verification.
  4. **Women's Health**: Menstrual cycle tracking with mathematical estimations (non-guarantee), PCOS support, perimenopause, and reproductive health.
  5. **Health Insights**: Explainable pattern finder with supporting record links and non-causation disclaimers.
  6. **Lab Reports**: PDF/Image upload, reference range extraction review, accessible explanations, and historical tracking.
  7. **AI Health Assistant**: Conversational companion with Personal Health Memory retrieval and Web Speech API read-aloud.
  8. **Reminders**: Medication schedules, doctor appointments, preventive screenings, and Web Notification API integration.
  9. **Medical Vault**: Private, authenticated document repository.
  10. **Settings & Privacy**: Autonomous data export (JSON), complete health data wipe, and account deletion.
- **Guided Symptom Assessment**: Interactive triage questionnaire with safety-first red flag detection.
- **Health Education Library**: Evidence-grounded articles with audio read-aloud.

### 2. Backend (Node.js + Express + TypeScript + Relational SQLite Engine)
- `/server/db.ts`: Persistent storage engine with automatic migrations and relational integrity in `data/lunelle_store.json`.
- `/server/safety-rules.ts`: Deterministic emergency triage rules covering chest pain, FAST stroke signs, acute hemorrhage, and mental health crises.
- `/server/hinglish-parser.ts`: Natural language engine parsing Hinglish/Hindi/Marathi health vocabulary, durations, and severity progressions.
- `/server/health-memory.ts`: Database-grounded memory engine answering factual historical inquiries.
- `/server/pattern-finder.ts`: Statistical co-occurrence and trend calculation engine.
- `/server/lab-parser.ts`: Diagnostic reference range parser for CBC, Thyroid TSH, Lipid Profile, Blood Glucose, and vitamins.
- `/server/routes/api.ts`: Modular REST endpoints with JWT authentication and per-user data isolation.

---

## 🚀 Quick Setup & Running Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default parameters are pre-configured:
```env
PORT=3001
JWT_SECRET=lunelle_secure_jwt_secret_change_in_production_key_38472948
```

### 3. Run Development Server
To launch both the Express backend and the Vite frontend concurrently:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

Alternatively, run each service in separate terminals:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

---

## 🧪 Automated Testing

Execute the automated test suite verifying emergency rules, Hinglish parsing, authentication security, personal health memory, and pattern finder calculations:
```bash
npm run test
```

All test cases verify:
- Immediate emergency detection (chest pain radiating to arm, FAST stroke, acute bleeding) vs non-urgent entries.
- Hinglish phrase extraction (*"kal se sir dukh raha h"*, *"period 10 din late hai"*, *"pet m cramps bhot jyada h"*, *"Mala sakalpasun thakva vattoy"*).
- Password encryption with bcryptjs and JWT integrity.
- Personal Health Memory factual responses and missing record honesty.
- Pattern finder non-causation disclaimers and supporting evidence links.

---

## 📦 Production Build & Deployment

To compile the production build:
```bash
npm run build
```
Static assets will be compiled to the `dist/` folder. The Node.js Express server can serve the built client files directly in production.

---

## ⚖️ Clinical & Legal Boundaries

- Lunelle is a personal health organizer and educational platform; it does **not** provide medical diagnoses, treatment prescriptions, or clinical triage.
- Always consult a qualified medical professional for health concerns.
- In medical emergencies, contact national emergency services immediately (112 / 108 in India, or your local emergency number).
=======
# Lunelle
>>>>>>> 22cc2c559495e495645bf307a5b9ad82607671d2
