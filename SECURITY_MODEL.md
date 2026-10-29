# Threat model — taaqib-masood repositories

Scope: all 11 repositories, whole (user choice, 2026-10-29). Infrastructure-as-code lives inside the code repos (no separate infra repo): `GarageIQ/render.yaml`, `*/vercel.json`, `codemode-gateway/wrangler.jsonc`, `GarageIQ/apps/api/cloudflare/wrangler.jsonc`, `salon-booking-saas/{terraform/main.tf,k8s/helm,render.yaml,docker-compose.yml}`, `stock-market-forecasting-risk-analytics/netlify.toml`, GitHub Actions workflows.

## User-confirmed facts (these drive reranking)
- **Live with real users/data:** `codemode-gateway` (exposed via ngrok / Cloudflare Workers), `Recruitment-tech` and `test-management` (real candidates).
- The other repos were *not* named as live with real data. Not treated as ruled out — see next point.
- **Attackers:** all of them matter — anonymous internet users, logged-in users reaching other users'/tenants' data, garage owners gaming scores/claims, candidates cheating proctoring, leaked/stolen tokens & CI secrets.
- **Out of scope / accepted risk:** nothing. No finding is down-ranked for being "demo only" or "intended".

## Components (stable names)
| Component | Code |
|---|---|
| `garageiq-web` | `GarageIQ/apps/web` (Next.js PWA, Vercel) + `GarageIQ/apps/mobile` |
| `garageiq-api` | `GarageIQ/apps/api` (NestJS + Prisma, Render; Better Auth, admin module, claims, uploads, leads) + `GarageIQ/migrations` |
| `garageiq-worker` | `GarageIQ/apps/worker`, `GarageIQ/tools/whatsapp`, `GarageIQ/.github/workflows` (Python batch jobs on Actions cron) |
| `garageiq-landing` | `garageIQ-landing-page` (static site, Supabase anon key + RLS waitlist) |
| `codemode-gateway` | `codemode-gateway` (MCP gateway Worker / Node server) |
| `recruitment-portal` | `Recruitment-tech` (Comfotec Talent Portal: Express + Mongo + Angular, LiveKit, proctoring) |
| `test-platform` | `test-management` (Express + Mongo + Angular assessment/proctoring) |
| `clinic-agent` | `smart-hospital-agent` (Next.js + Supabase, WhatsApp webhook) |
| `salon-saas` | `salon-booking-saas` (multi-tenant Express + Supabase/RLS, Redis/BullMQ, terraform/helm) |
| `portfolio` | `Taaqib-Portfolio` (Next.js, Groq-backed chat/playground; see its SECURITY.md) |
| `atlas-ai` | `atlas-ai` (Node SSR directory, SQLite/JSON storage, sessions, CSRF, admin) |
| `trading-pipeline` | `stock-market-forecasting-risk-analytics` (Python pipeline, Netlify dispatch function, Actions) |
| `revit-mcp` | `revit-ai-automation` (TS revit-core safety/tool policy, MCP skills) |

## System overview and trust boundaries
- **codemode-gateway** — single bearer token (`GATEWAY_TOKEN`, string compare in `src/index.ts` / `src/node-server.ts`) in front of upstream MCP servers whose static tokens (Vercel, Fathom, Strix, Context7, `EXTRA_UPSTREAMS`) live in Worker/Node env. `execute` runs model-written JS; production uses `EXECUTOR=soft` (`src/executor.ts`, same isolate, shadowed globals — self-documented as *not* a hard boundary). Auth is skipped entirely if `GATEWAY_TOKEN` is unset. Crossing: internet → gateway → upstream accounts (Vercel deploys/env, meeting transcripts, pentest data). Highest-value secret holder in the set.
- **Recruitment-tech** — Angular client (Vercel) → Express API (Render) → MongoDB, Cloudinary, LiveKit, Deepgram, Groq. JWT bearer auth (`server/middleware/authMiddleware.js`, `attemptAccess.js`), roles admin/recruiter/candidate, file uploads (`middleware/upload.js`), Socket.io. Crossings: candidate ↔ staff, candidate ↔ other candidates, public ↔ API.
- **test-management** — same shape: Express `protect`/`admin` JWT middleware (`server/middleware/authMiddleware.js`), access-code entry for tests, proctoring snapshots, bulk CSV invites, Groq question generation.
- **GarageIQ** — Next.js web → NestJS API (`BetterAuthGuard` global; user session = httpOnly cookie; admin = separate `admin_users` bcrypt login issuing short-lived JWT in `x-admin-token`, `admin.guard.ts`) → Supabase Postgres (service-role key server-side). Garage-claim flow (docs/29) gates Google Business Profile OAuth and must never alter scores. Python batch jobs on GitHub Actions with repo secrets (Groq/Gemini/GLM/Apify/Cloudinary/DB).
- **garageIQ-landing-page** — static site posting to Supabase PostgREST with the public anon key (`public/main.js`); protection relies on RLS on the same Supabase project as GarageIQ (`zbqtaiozkhfscwynddjd`).
- **smart-hospital-agent** — Next.js middleware auth via Supabase `getUser()` on a `PROTECTED` prefix list; `NEXT_PUBLIC_DEMO_MODE=true` skips auth; middleware fails open on exception; WhatsApp webhook (`app/api/whatsapp/webhook`) is public.
- **salon-booking-saas** — JWT staff auth (`middleware/auth.js`) + role `authorize`; tenant isolation by `tenant_id` and Postgres RLS (`supabase/`); service-role Supabase client server-side; cron jobs, WhatsApp reminders, GDPR routes; terraform/helm/docker infra.
- **Taaqib-Portfolio** — public, no auth; LLM endpoints rate-limited in memory; nonce CSP (documented controls in `SECURITY.md`).
- **atlas-ai** — scrypt passwords, sessions, CSRF tokens, IDOR→404 ownership checks (`lib/core.js`, `lib/auth.js`); seeded default admin `admin@example.com` unless env overrides.
- **stock-market** — Netlify function `netlify/functions/dispatch.js` holds a classic `repo`-scope GitHub PAT and fires `workflow_dispatch`; it is public (`Access-Control-Allow-Origin: *`, no caller auth seen); inputs whitelisted/regex-validated.
- **revit-ai-automation** — local MCP bridge to Revit; write operations gated by `src/revit-core/safety.ts` / `tool-policy.ts`.

## Assets and sensitivity
- Critical: upstream tokens behind codemode-gateway; candidate PII, CVs, interview video/transcripts, proctoring snapshots and scores (Recruitment-tech, test-management); Supabase service-role keys and DB URLs; GitHub PATs / Actions secrets.
- High: GarageIQ user accounts, sessions, admin JWT secret, garage claim ownership, trust scores' integrity; clinic patient records and invoices (health data); salon tenant data, payments, loyalty ledger.
- Medium: LLM API quota (cost abuse), review corpus, waitlist emails.
- Low: public portfolio content, public tool catalog.

## Attacker profiles (all in scope per user)
1. Anonymous internet attacker against any public endpoint.
2. Authenticated low-privilege user (candidate, driver, staff of tenant A) seeking other users'/tenants' data or admin actions.
3. Garage owner gaming claims, reviews or scores.
4. Candidate cheating proctoring or tampering with attempts/scores.
5. Holder of a leaked token or CI secret; malicious prompt/LLM output steering tool calls (gateway `execute`, AI copilots).

## Existing controls
- Gateway bearer token; soft executor shadows network globals.
- Better Auth httpOnly cookie sessions, CORS/Origin guard on `FRONTEND_URL`, separate admin auth (GarageIQ).
- JWT verify + role middleware (Recruitment-tech, test-management, salon); Supabase RLS (salon, landing page).
- Portfolio: nonce CSP, HSTS, rate limits, Zod validation (SECURITY.md).
- atlas-ai: scrypt, CSRF, ownership checks, login rate limits.
- stock-market dispatch: job allowlist + ticker regex.

## Out of scope / accepted risk
None (user: "rule nothing out").

## Open questions
- Is GarageIQ live with real users (not selected as live by the user)? Is smart-hospital-agent / salon-booking-saas deployed anywhere with real data?
- Does the gateway ever run with `GATEWAY_TOKEN` unset when tunnelled?
- Which compliance regimes formally apply (UAE PDPL vs GDPR) per system?
