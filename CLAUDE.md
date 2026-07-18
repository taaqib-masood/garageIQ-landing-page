# GarageIQ — Master Project Index

## What This Project Is
GarageIQ is an AI-powered garage discovery PWA for UAE car owners. 
It helps users find the right garage for their exact car issue — 
not just a nearby garage.

## Tech Stack (Non-Negotiable)
- **Frontend**: Next.js PWA (mobile-first, 375px width)
- **Backend**: NestJS monolith on Render
- **Database**: PostgreSQL on Supabase (PostGIS + pgvector extensions)
- **Workers**: Python + Celery on Render (async AI pipeline)
- **Queue**: BullMQ (Node side) → Celery (Python workers)
- **LLMs**: Groq free tier (batch extraction), Gemini 2.0 Flash (live queries)
- **Auth**: Google OAuth + Email OTP (no phone auth at MVP)
- **Maps**: No geocoding API — text match on area names + PostGIS for "near me"
- **Hosting**: Render (backend/workers) + Vercel (frontend)

## Monorepo Structure
garageiq/
├── apps/
│ ├── web/ # Next.js PWA (frontend)
│ ├── api/ # NestJS backend
│ ├── worker/ # Python + Celery AI pipeline
│ └── admin/ # Internal admin console (Next.js, internal only)
├── packages/
│ └── shared/ # Shared types, constants, schemas
├── docs/ # ALL SPEC DOCS — read these before coding
│ ├── 01-prd.md
│ ├── 02-architecture.md
│ ├── 03-database.md
│ ├── 04-api.md
│ ├── 05-ai-intelligence.md
│ ├── 06-ranking.md
│ ├── 07-uiux.md
│ └── 08-engineering.md
└── CLAUDE.md # This file

## Critical Rules (Read Before Writing Any Code)

1. **Read the relevant spec first.** Before writing any code, read the 
   matching doc in /docs/. For DB work, read 03-database.md. For search, 
   read 04-api.md AND 06-ranking.md. For AI, read 05-ai-intelligence.md.

2. **No garage-side portal.** This is customer-only at MVP. Admin is 
   internal-team only. No garage self-serve dashboard.

3. **No geocoding API.** Named locations = text match on garage_locations 
   columns. PostGIS = only for device-coordinate "near me" queries.

4. **Honesty is NOT a standalone metric.** It's folded into trust_score. 
   The word "honesty" must never appear in any tag, UI label, or prompt.

5. **Cold-start matters.** Garages with 0-4 reviews must show limited data 
   states. Use the tiered system from 05-ai-intelligence.md Section 8.

6. **PWA first, no React Native at MVP.** Mobile-first web, installable 
   to home screen. Native apps are post-MVP.

7. **LLM routing is fixed.** Groq = async batch only. Gemini 2.0 Flash = 
   live query resolution only. Never call Groq on the live path.

8. **No sponsored/featured placements at MVP.** Monetization is 
   post-MVP. Don't build placement infrastructure.

9. **Area names must be normalized at ingestion.** Al Quoz = Al Quoz = 
   Al-Quoz. Don't rely on source data consistency.

10. **Every LLM call must log:** provider, model, latency, tokens, 
    confidence_score, fallback_triggered (boolean).

## Task-to-Doc Routing
| Task | Read These Docs First |
|------|----------------------|
| Database migration | 03-database.md, 08-engineering.md |
| Search endpoint | 04-api.md, 06-ranking.md |
| AI pipeline / extraction | 05-ai-intelligence.md, 02-architecture.md |
| Frontend screen | 07-uiux.md, 01-prd.md |
| Auth / middleware | 04-api.md, 08-engineering.md |
| Location / geo logic | 06-ranking.md, 03-database.md |
| Admin console | 04-api.md (admin section) |

## Current Status
All 8 specs finalized. Frontend designs exist (Google Stitch output 
downloaded). Ready to build.
