# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DE Prep** — a React learning platform for Meta Data Engineer technical screen preparation (March 31, 2026). Covers SQL (PostgreSQL) and Python with 260+ questions, flashcards, timed mocks, adaptive practice, and a 24-day structured study plan.

**Live:** https://data-engineering-nine.vercel.app

## Commands

- `npm run dev` — Start dev server (localhost:5173)
- `npm run build` — TypeScript compile + Vite build (`tsc -b && vite build`)
- `npm run lint` — ESLint
- `npm run preview` — Preview production build locally

**Always run `npm run build` before considering work done.** Vercel auto-deploys on push to main.

## Architecture

### Stack
React 18 + TypeScript, Vite, Tailwind CSS, PWA (vite-plugin-pwa). Deployed on Vercel with serverless API routes.

### Routing
`src/App.tsx` — BrowserRouter (Vercel/local) or HashRouter (GitHub Pages, legacy). 15 tab routes, all defined here.

### State & Persistence
- **AppContext** (`src/context/AppContext.tsx`) — Central state: question progress per category, timer sessions, preferences. Persists to localStorage (`msInterviewProgress`, `msInterviewPreferences`).
- **Supabase cloud sync** (`src/services/progressSync.ts`) — Pulls on app load, debounced push on changes. Uses `user_progress` table with JSONB blob keyed by `device_id` (or user-chosen sync code). No auth required.
- **Supabase client** (`src/lib/supabase/client.ts`) — Returns no-op stub when env vars missing, so the app works without Supabase.
- **Quick Drill** has its own localStorage key: `quick_drill_progress`
- **Daily Plan** has: `daily_plan_completion`, `daily_plan_streak`

### UI Components
Factory components in `src/components/ui/` — **always use these** instead of creating custom buttons, cards, etc.:
- `Button` (variants: primary/secondary/ghost/danger, sizes: sm/md/lg, loading state)
- `Card`, `Badge`, `ProgressBar`, `Spinner`, `Section`

All exported from `src/components/ui/index.ts`.

### AI Service Layer
`src/services/aiService.ts` — Provider-agnostic interface. Four providers in `src/services/providers/`:
- **groq** (default), **claude**, **gemini**, **claude-cli** (dev only)
- Provider selected via localStorage `ai_provider` or `VITE_AI_PROVIDER` env var
- Falls back to `mockFeedback.ts` when API unavailable (offline support)

### Serverless Functions
`api/claudeProxy.ts` and `api/geminiProxy.ts` — Vercel serverless functions that proxy AI API calls (keeps keys server-side).

### Data Layer
- **Static JSON** in `public/data/` — question banks loaded at runtime via fetch
- **Embedded JSON** in `src/data/` — imported directly (daily plan, glossary, etc.)
- `public/data/mock-db.sql` — Schema loaded into sql.js for in-browser SQL execution
- sql.js WASM loaded from cdnjs.cloudflare.com CDN

### Key Features
| Feature | File(s) | Storage |
|---------|---------|---------|
| 24-day study plan | `src/data/dailyPlan.ts`, `src/hooks/useDailyPlan.ts` | `daily_plan_completion` |
| Quick Drill (113 flashcards) | `src/components/tabs/QuickDrill.tsx` | `quick_drill_progress` |
| Timed Assessment (50-min mock) | `src/components/tabs/TimedAssessment.tsx` | Session only |
| Adaptive Practice (AI-generated) | `src/components/tabs/AdaptivePractice.tsx` | localStorage per subject |
| Cross-device sync | `src/services/progressSync.ts`, `src/components/SyncModal.tsx` | Supabase `user_progress` |
| PWA / offline | `vite.config.ts` (VitePWA plugin) | Service worker + CacheFirst for JSON |

### Navigation
`src/components/TabNavigation.tsx` — Desktop: scrollable tab bar. Mobile: bottom nav (Home, Drill, Practice, Timed) + More drawer for remaining tabs.

## Deployment

**Vercel only** (GitHub Pages workflow removed). Auto-deploys on push to `main`.

`vercel.json` uses `installCommand: "rm -rf node_modules package-lock.json && npm install"` to avoid cross-platform rollup native module issues (macOS lockfile vs Linux build).

## Environment Variables

Set in `.env` (local) and Vercel dashboard (production):

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_AI_PROVIDER` | AI provider: groq/claude/gemini |
| `GEMINI_API_KEY` | Server-side Gemini key (serverless fn) |
| `CLAUDE_API_KEY` | Server-side Claude key (serverless fn) |

## Key Config

- **Interview date:** `src/config.ts` — `INTERVIEW_DATE = new Date('2026-03-31')`
- **Category totals:** `src/context/AppContext.tsx` — `categoryTotals` object (used for progress %)
- **Supabase project:** `agwjyldyfmytsueskvql` (Prep, ap-southeast-2)
