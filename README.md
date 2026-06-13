# CalmCoach — Mental Wellness Tracker

GenAI-powered mental wellness companion for **Indian exam aspirants** (NEET, JEE, CUET, CAT, GATE, UPSC). Log mood, journal with AI reflection, and chat with a streaming empathetic companion — with crisis safety guardrails and read-aloud support.

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Mood check-in, 7-day stress trend chart, recurring trigger insights |
| **Chat** | Token-streamed Gemini companion with mood/journal context |
| **Journal** | AI analysis: stress triggers, emotions, mood score, suggestion |
| **Voice (TTS)** | ElevenLabs read-aloud on assistant messages |
| **Crisis safety** | Keyword detection → India helplines (Tele-MANAS 14416, AASRA) |
| **Auth** | Supabase magic-link email login + Row Level Security |

## Tech stack

- **Next.js 15** (App Router, TypeScript, Tailwind CSS v4, shadcn/ui)
- **Supabase** — Postgres + Auth + RLS
- **Google Gemini** `gemini-2.0-flash` — streaming chat + journal analysis
- **ElevenLabs** — text-to-speech
- **Vitest** + Testing Library

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
GOOGLE_GENERATIVE_AI_API_KEY=       # https://aistudio.google.com/apikey
ELEVENLABS_API_KEY=                 # optional — for voice
ELEVENLABS_VOICE_ID=                # optional — ElevenLabs voice ID
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only, never expose to client
```

Chat and journal analysis require `GOOGLE_GENERATIVE_AI_API_KEY`. TTS is optional.

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in **SQL Editor**
3. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (or your Vercel URL)
   - Redirect URLs: `http://localhost:3000/auth/confirm`
4. **Email Templates → Magic Link** — set link to:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → sign in → dashboard.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm test` | Run Vitest (23+ tests) |
| `npm run lint` | ESLint |

## Demo flow

1. **Sign in** at `/login` with magic link
2. **Dashboard** — tap a mood (Great → Anxious), see stress chart update
3. **Journal** — write about exam stress → get AI triggers/emotions/suggestion
4. **Chat** — ask *"I'm anxious about NEET mocks"* → streamed reply + optional voice button
5. **Crisis test** — chat detects distress keywords and shows helpline banner

## Deploy on Vercel

1. Push to GitHub (`dev` or `main` branch)
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all env vars from `.env.example`
4. Deploy

### Vercel settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | *(repo root)* |
| Build Command | `npm run build` |
| Output Directory | *(leave empty)* |

Update Supabase **Site URL** and **Redirect URLs** to your `*.vercel.app` domain.

CLI deploy:

```bash
npx vercel --prod
```

## Security

- **RLS** on all tables — users only access their own rows
- API keys are **server-side only** (never `NEXT_PUBLIC_*` except Supabase anon)
- **Zod** validation on all API inputs
- **Rate limiting** on `/api/chat` (20/min) and `/api/tts` (10/min) per user
- Security headers via `next.config.ts`

## Project structure

```
src/
  app/
    page.tsx              # Dashboard
    chat/                 # Streaming chat
    journal/              # Journaling + analysis
    (auth)/login/         # Magic-link login
    api/                  # chat, tts, journal, mood, insights
  components/
    chat/                 # ChatWindow, MessageBubble, VoiceButton
    journal/              # JournalEditor, EntryCard, AnalysisPanel
    mood/                 # MoodSelector, MoodChart
  lib/
    gemini.ts             # Gemini client + streaming
    prompts.ts            # CalmCoach persona
    safety.ts             # Crisis detection + helplines
    validation.ts         # Zod schemas
  __tests__/              # Vitest unit tests
supabase/
  schema.sql              # Tables + RLS policies
```

## Tests

```bash
npm test
```

Coverage includes crisis detection, validation schemas, prompt builder, MoodSelector accessibility, and rate limiting.

## Disclaimer

CalmCoach is a wellness support tool, **not** a substitute for professional mental health care. In crisis, call **Tele-MANAS 14416**, **AASRA 9820466726**, or **112**.
