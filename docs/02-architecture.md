<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><p><strong>GarageIQ UAE</strong></p>
<p>System Architecture Document</p>
<p><em>v1.2 — Internal Engineering Reference</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| *This document reflects the customer-facing product only. Admin console is an internal tool operated by the GarageIQ team — it has no public access. Monetisation infrastructure is post-MVP scope. Native mobile app is post-MVP; MVP ships as a Progressive Web App (PWA).* |
|----|

# 1. Purpose

This document defines the technical architecture for GarageIQ UAE. It
establishes system boundaries, service responsibilities, data flow,
backend and frontend architecture, AI enrichment architecture, search
and ranking architecture, infrastructure decisions, and deployment
boundaries.

This document is the source of truth for how the system is engineered.

# 2. Architecture Principles

| **Principle** | **Definition** |
|----|----|
| Modular by default | Each core function (ingestion, enrichment, search, app) is isolated and independently evolvable. |
| Structured over unstructured | Raw external data is never served directly. All user-facing data must pass through normalisation and enrichment. |
| Search is the product | Search and ranking are first-class backend systems, not UI filters. |
| AI is a pipeline, not an app feature | AI exists as an asynchronous enrichment system. It never sits in the synchronous request path. |
| Human override is mandatory | Internal admin controls must be able to override any AI-generated output at any time. |
| MVP favours speed + correctness over complexity | Ship as a modular monolith. Do not prematurely split into microservices. |
| <span class="mark">One infra decision per layer</span> | <span class="mark">No competing options at build time. Each layer has one chosen tool.</span> |

<img src="media/image1.png" style="width:6.5in;height:4.58403in" />

# 3. High-Level System Overview

GarageIQ consists of 5 major subsystems:

- Client Application (PWA)

- Core Application Backend

- Data Ingestion Pipeline

- AI Intelligence Pipeline

- Search & Ranking Engine

A private Admin Console sits outside the customer product and is
operated exclusively by the GarageIQ team.

# 4. High-Level Architecture

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>[ PWA — Next.js / Mobile Browser ]</p>
<p>|</p>
<p>v</p>
<p>[ API Gateway / NestJS Backend ]</p>
<p>|</p>
<p>+---------+-----------+</p>
<p>| |</p>
<p>v v</p>
<p>[ Core App Services ] [ Search Service ]</p>
<p>| |</p>
<p>v v</p>
<p>[ PostgreSQL + PostGIS ] [ pgvector Index ]</p>
<p>|</p>
<p>v</p>
<p>[ AI Intelligence Pipeline (Python workers) ]</p>
<p>|</p>
<p>v</p>
<p>[ Enriched Garage Tags + Scores ]</p>
<p>External Sources (Google Places API + Outscraper)</p>
<p>|</p>
<p>v</p>
<p>[ Data Ingestion Pipeline (Python + Celery) ]</p>
<p>|</p>
<p>v</p>
<p>[ Raw Object Store (S3) ] -&gt; [ Normalise ] -&gt; [ PostgreSQL
]</p>
<p>[ Admin Console (internal Next.js) ] --&gt; [ Backend Admin API
]</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 5. Core System Components

## 5.1 Client Application — Progressive Web App (PWA)

| *MVP ships as a PWA built on Next.js. Users can install it to their home screen on iOS and Android. React Native native app is post-MVP scope.* |
|----|

Responsibilities:

- User authentication and onboarding

- Vehicle profile management

- Natural language and structured garage search

- Garage discovery and detail display

- AI-generated tag and score display

- Saved garages and favourites

- Review and rating submission

- Lead actions — call and WhatsApp tap

| **Attribute**  | **Decision**                                         |
|----------------|------------------------------------------------------|
| Framework      | Next.js 14 (App Router)                              |
| Language       | TypeScript                                           |
| Styling        | Tailwind CSS                                         |
| State — server | React Query (TanStack Query)                         |
| State — client | Zustand (light UI state only)                        |
| Validation     | Zod                                                  |
| PWA            | next-pwa or custom service worker                    |
| Maps           | Mapbox GL JS (free tier sufficient for MVP)          |
| Hosting        | Vercel (look at other alternatives, recently hacked) |

**PWA vs React Native — rationale:**

PWA allows one codebase for web and mobile install. GarageIQ does not
require push notifications, native hardware sensors, or offline-first
behaviour at MVP. React Native adds significant maintenance overhead for
a solo builder with no material UX gain at this stage.

## 5.2 Core Application Backend

The central API layer. All client requests route through here.

| **Attribute** | **Decision**                                       |
|---------------|----------------------------------------------------|
| Framework     | NestJS                                             |
| Language      | TypeScript                                         |
| ORM           | Prisma                                             |
| Validation    | class-validator + class-transformer (NestJS pipes) |
| Auth          | Passport.js — JWT strategy                         |
| Hosting       | Render (Web Service)                               |

Backend module ownership:

- Auth module — signup, OTP, JWT issuance, token refresh

- Users module — profile management

- Vehicles module — user vehicle CRUD

- Garages module — garage retrieval, detail, enriched profile

- Search module — query parsing, retrieval orchestration, ranking

- Reviews module — submission, moderation queue hook

- Favourites module — save and list

- Leads module — call/WhatsApp tap tracking

- Admin module — internal-only, RBAC-gated, not exposed to users

## 5.3 Primary Database — PostgreSQL via Supabase

Source of truth for all structured application data.

| **Attribute** | **Decision**                                     |
|---------------|--------------------------------------------------|
| Provider      | Supabase (managed PostgreSQL)                    |
| Extensions    | PostGIS (geospatial), pgvector (semantic search) |
| ORM           | Prisma                                           |
| Migrations    | Prisma Migrate — immutable, version-controlled   |

Supabase is chosen because it provides managed Postgres with PostGIS and
pgvector on the free tier, includes a built-in storage bucket (replacing
the need for separate S3 at MVP), and offers a dashboard useful for
early operational visibility.

## 5.4 Search Service

Search is a first-class subsystem, not a UI filter. It handles query
parsing, candidate retrieval, and ranked result assembly.

| **Layer** | **Tool** | **Purpose** |
|----|----|----|
| Full-text search | PostgreSQL FTS (tsvector) | Keyword and service name matching |
| Semantic search | pgvector | Embedding-based similarity for natural language queries |
| Geo filtering | PostGIS ST_DWithin | Radius and area-based filtering |
| Future scale | OpenSearch (managed) | If search volume exceeds Postgres FTS capacity |

The search module in the backend orchestrates all three layers. It lives
in the NestJS monolith for MVP and is the first candidate for extraction
into a standalone service at scale.

## 5.5 Data Ingestion Pipeline

Responsible for acquiring, normalising, and persisting external garage
and review data.

| **Attribute** | **Decision**                                         |
|---------------|------------------------------------------------------|
| Language      | Python                                               |
| Job queue     | Celery + Redis (BullMQ used on Node side to trigger) |
| Scheduler     | Celery Beat (cron-style schedules)                   |
| Hosting       | Render (Background Worker)                           |
| Raw storage   | Supabase Storage (S3-compatible)                     |

**Data source strategy:**

| **Source** | **Purpose** | **When** |
|----|----|----|
| Outscraper | One-time bulk seed — all reviews per garage (50–200+ per garage) | Pre-launch, once |
| Google Places API | Ongoing garage metadata, ratings, and review freshness | Weekly refresh jobs |
| User reviews (in-app) | First-party review ingestion, feeds AI pipeline directly | Real-time on submission |
| Reddit / forums | Future supplementary signal source | Post-MVP |

Ingestion responsibilities:

- Fetch garages and metadata by UAE emirate and area

- Fetch and store raw review payloads

- Deduplicate on external source ID

- Normalise raw payloads into canonical schema

- Detect stale records and queue for refresh

- Queue enrichment jobs after ingestion completes

## 5.6 AI Intelligence Pipeline

Converts raw review text into structured garage intelligence. Runs
asynchronously — never in the synchronous request path.

| **Attribute** | **Decision** |
|----|----|
| Language | Python |
| LLM strategy | Hybrid: Groq (free tier) for batch + Claude API for live (see Section 5.6.1) |
| Batch extraction | Groq — llama-3.3-70b-versatile (bulk seed, async re-enrichment) |
| Live LLM (user-facing) | Anthropic Claude — claude-haiku-4-5 (query resolution, real-time) |
| Schema enforcement | Pydantic + JSON schema validation |
| Job runner | Celery workers on Render |
| Trigger | Queued by ingestion pipeline or review submission |

**5.6.1 LLM Provider Strategy — Hybrid (Groq + Claude)**

GarageIQ uses a hybrid LLM strategy: free-tier Groq for high-volume
batch jobs (one-time seed extraction and ongoing review re-enrichment),
and Claude API for low-volume but reliability-critical live tasks (user
query resolution). This minimises API spend while keeping the production
request path on a paid SLA.

| **Task** | **Provider** | **Model** | **Why** | **Fallback** |
|----|----|----|----|----|
| Bulk seed extraction (one-time) | Groq Free | llama-3.3-70b-versatile | \$0 cost; one-time job tolerates rate limits | Claude Haiku if Groq output fails schema validation |
| Review re-enrichment (background) | Groq Free | llama-3.3-70b-versatile | Async, retry-tolerant, low priority | Queue retry; fall back to Claude after 3 failures |
| Live query resolution (user-facing) | Claude API | claude-haiku-4-5 | Real users; needs SLA + reliability | Cached structured fallback parser if API down |

**Cost model detail:**

- Bulk seed (5,000 garages) on Groq: \$0 — completes in ~3 hours due to
  30 req/min rate limit

- Live query resolution on Claude Haiku: ~\$0.0003 per query

- 1,000 daily searches × 30 days = ~\$9/month at MVP scale

- Ongoing review re-enrichment on Groq: \$0 (retries handled async)

- Total monthly LLM spend at MVP: under \$10

- Total seed cost: \$0 — meaningful saving vs single-provider Claude
  approach (~\$15)

**Hybrid rationale:**

- Groq's free tier provides 14,400 requests/day at 30 req/min —
  sufficient for batch and re-enrichment workloads, with no production
  SLA risk because these jobs are async and retry-tolerant.

- Claude Haiku handles live query resolution where users wait for a
  response. Reliability matters more than cost, and the volume is small
  enough that monthly spend stays under \$10.

| *Custom model fine-tuning is not viable until you have 2,000+ labelled examples and combined LLM costs exceed ~\$200/month. With the hybrid Groq + Claude approach, MVP spend stays under \$10/month — this threshold will not be reached in the first 12–18 months. Revisit only if Groq's free tier degrades or live query volume spikes.* |
|----|

**5.6.2 Cold-Start Handling in the AI Pipeline**

The enrichment pipeline checks evidence thresholds before writing any
tags or scores. This prevents weak data from generating misleading
intelligence.

| **Review Count** | **Pipeline Behaviour** | **Output to Product** |
|----|----|----|
| 0–4 | Pipeline skips enrichment entirely | No tags generated; “New listing” badge in UI |
| 4–9 | Extraction runs but aggregation applies high-confidence signals only | “Limited data” badge; partial tags shown |
| 10–15 | Full extraction and aggregation run with reduced weight | Tags shown with confidence indicator |
| 16+ | Full pipeline runs with standard weights | Complete intelligence profile, no badge |

For garages with 0 reviews, name and business category inference
provides fallback basic tags (e.g. a garage named ‘Al Quoz BMW
Specialist’ gets a BMW tag and a location tag from metadata alone, with
a clearly marked ‘inferred’ source flag). (what about names with no
inference basis?)

## 5.7 Admin Console — Internal Only

| *The admin console is an internal tool operated exclusively by the GarageIQ team. It has no public URL, no user-facing access, and is protected by separate admin authentication. It is not part of the customer product.* |
|----|

Stack:

| **Attribute** | **Decision** |
|----|----|
| Framework | Next.js (separate internal app or /admin route behind auth wall) |
| Auth | Separate admin JWT — not shared with user auth tokens |
| Access control | Role-based: super_admin, moderator |
| Hosting | Vercel (separate deployment) or password-protected Vercel preview |

Admin console responsibilities:

- Review moderation — approve, reject, flag suspicious reviews

- Tag override — manually correct or suppress AI-generated tags

- Score override — adjust trust, speed, or price scores with reason
  logging

- Garage metadata edit — correct names, addresses, phone numbers

- Featured listing management — promote garages to featured slots
  (post-MVP monetisation)

- Verified badge assignment — mark garages as verified by GarageIQ team

- Search quality audit — inspect recent queries and result sets

- Ingestion job monitoring — check pipeline health and failure alerts

**Admin auth flow:**

Admin users are created manually (no self-signup). Admin JWT is issued
via a separate POST /admin/auth/login endpoint using a credentials check
against a hardcoded admin user table. Admin tokens have a short expiry
(2 hours) and are not refresh-able without re-auth.

# 6. Data Flows

## 6.1 Garage Ingestion Flow

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>External Source (Outscraper bulk / Google Places API)</p>
<p>-&gt; Fetch garage list by UAE area</p>
<p>-&gt; Store raw payload in Supabase Storage (S3)</p>
<p>-&gt; Normalise: map to canonical garage schema</p>
<p>-&gt; Deduplicate on external_source_id</p>
<p>-&gt; Upsert garage record in PostgreSQL</p>
<p>-&gt; Upsert review records</p>
<p>-&gt; Enqueue AI enrichment job (Celery)</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 6.2 AI Enrichment Flow

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>Celery worker picks up enrichment job</p>
<p>-&gt; Load all reviews for garage from PostgreSQL</p>
<p>-&gt; Check evidence threshold (see Section 5.6.2)</p>
<p>-&gt; If threshold met:</p>
<p>-&gt; Batch reviews -&gt; claude-haiku-4-5 -&gt; extract structured
signals</p>
<p>-&gt; Validate output against <mark>Pydantic schema</mark></p>
<p>-&gt; Reject hallucinated or out-of-ontology values</p>
<p>-&gt; Aggregate signals -&gt; claude-sonnet-4-6 -&gt; generate garage
profile</p>
<p>-&gt; Compute confidence scores</p>
<p>-&gt; Write tags + scores to PostgreSQL</p>
<p>-&gt; Trigger search reindex</p>
<p>-&gt; If threshold not met:</p>
<p>-&gt; Write partial / empty profile with appropriate badge flag</p>
<p>-&gt; Schedule retry when review count increases</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 6.3 User Search Flow

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>User submits query (natural language or structured)</p>
<p>-&gt; NestJS Search module receives request</p>
<p>-&gt; Query parser: claude-sonnet-4-6 extracts structured intent</p>
<p>{ service_type, brand, location, price_band, urgency }</p>
<p>-&gt; Candidate retrieval:</p>
<p>-&gt; PostgreSQL FTS (keyword match)</p>
<p>-&gt; pgvector (semantic similarity)</p>
<p>-&gt; PostGIS (geo radius filter)</p>
<p>-&gt; Ranking engine scores each candidate</p>
<p>-&gt; Top N ranked results assembled with enriched profiles</p>
<p>-&gt; Response returned to client</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 6.4 User Review Submission Flow

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>User submits review</p>
<p>-&gt; Save to user_reviews (moderation_status: pending)</p>
<p>-&gt; Enqueue moderation check (admin queue)(automate using claude?
Or remove entirely)</p>
<p>-&gt; On approval: status -&gt; approved (see above point)</p>
<p>-&gt; Enqueue AI re-enrichment for affected garage</p>
<p>-&gt; Recompute garage scores</p>
<p>-&gt; Trigger search reindex</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 7. Service Boundaries

| **Service** | **Owns** |
|----|----|
| Backend App (NestJS) | Auth, users, vehicles, garages retrieval, search orchestration, reviews, favourites, leads, admin API |
| Search Service (within backend) | Query parsing, FTS + pgvector retrieval, geo filtering, ranking, result assembly |
| AI Pipeline (Python workers) | Review extraction, tagging, scoring, aggregation, profile generation, confidence scoring |
| Ingestion Pipeline (Python workers) | Source sync, raw storage, normalisation, deduplication, freshness detection |
| Admin Console (internal) | Review moderation, tag/score override, garage edits, featured control, job monitoring |

# 8. Storage Architecture

| **Store** | **Technology** | **Purpose** |
|----|----|----|
| Primary DB | Supabase PostgreSQL | All structured application data |
| Geospatial index | PostGIS extension | Garage location queries, radius search |
| Semantic index | pgvector extension | Embedding-based similarity search |
| Raw data store | Supabase Storage (S3) | Raw ingestion payloads, audit snapshots |
| Job queue | Redis (Render Redis) | Celery broker + BullMQ for Node-side job triggers |

# 9. Infrastructure

All MVP infrastructure runs on free tiers or low-cost managed services.
One chosen tool per layer.

| **Layer**      | **Tool**                      | **Tier**                     |
|----------------|-------------------------------|------------------------------|
| Frontend (PWA) | Vercel                        | Free                         |
| Backend API    | Render — Web Service          | Free / Starter (\$7/mo)      |
| Python workers | Render — Background Worker    | Free / Starter (\$7/mo)      |
| Database       | Supabase — managed PostgreSQL | Free (500MB) / Pro (\$25/mo) |
| Job queue      | Render Redis                  | Free tier                    |
| Object storage | Supabase Storage              | Free (1GB)                   |
| Admin console  | Vercel (separate deployment)  | Free                         |
| Error tracking | Sentry                        | Free tier                    |
| Analytics      | PostHog                       | Free tier                    |

| *Render free tier services spin down after 15 minutes of inactivity. For the backend API, upgrade to the Starter plan (\$7/mo) before launch to prevent cold-start latency issues for real users.* |
|----|

## Later Scale Path

| **When** | **Action** |
|----|----|
| Search outgrows Postgres FTS | Extract search to managed OpenSearch |
| Worker jobs exceed Render capacity | Move to dedicated worker cluster (Railway or Fly.io) |
| DB exceeds Supabase free tier | Upgrade to Supabase Pro or migrate to dedicated RDS |
| Infra complexity grows | Containerise with Docker, orchestrate with Kubernetes |

# 10. Authentication

## 10.1 User Auth (Customer-Facing)

| **Method** | **Detail** |
|----|----|
| Email OTP | 6-digit OTP sent via email, verified server-side |
| Google OAuth | via Passport.js Google strategy |
| Tokens | Short-lived JWT access token (15 min) + refresh token (7 days) |
| Storage | Access token in memory; refresh token in httpOnly cookie (why?) |

## 10.2 Admin Auth (Internal Only)

| **Method** | **Detail** |
|----|----|
| Credentials | Email + password against admin_users table (pwd stored hashed+salted) (no self-signup) |
| Tokens | Short-lived JWT (2 hours), no refresh — re-auth required |
| Endpoint | POST /admin/auth/login — separate from user auth |
| RBAC roles | super_admin (full access), moderator (reviews + tags only) |
| Admin creation | Manual DB insert by super_admin only |

User tokens and admin tokens are issued by different secrets and
validated by different guards. A user token cannot access admin
endpoints under any circumstances.

# 11. Queue and Job Strategy

Two job systems run in parallel, coordinated via Redis:

| **System** | **Language** | **Role** |
|----|----|----|
| BullMQ | Node.js (NestJS) | Triggered by user actions (review submission, search events). Enqueues jobs for Python workers. |
| Celery | Python | Processes all heavy jobs — ingestion, AI extraction, enrichment, reindexing. |

Job types:

| **Job** | **Trigger** | **Worker** |
|----|----|----|
| garage_enrichment | Post-ingestion, post-review-approval | Celery AI worker |
| garage_ingest_refresh | Celery Beat weekly cron | Celery ingestion worker |
| review_moderation_notify | On review submission | BullMQ → admin notification |
| search_reindex | Post-enrichment | Celery search worker |

# 12. Observability

Must track:

- Ingestion pipeline failures and retry counts

- AI enrichment failures, invalid JSON rate, low-confidence rate

- Search latency (p50, p95)

- API error rate by endpoint

- Review moderation queue depth

- Admin override frequency (signal for AI quality issues)

| **Tool** | **Purpose** |
|----|----|
| Sentry | Runtime error tracking — backend + frontend |
| PostHog | User analytics — search behaviour, lead conversion funnels |
| Structured logs | JSON logs on all workers — ingestion, enrichment, search |
| Render metrics | Infrastructure health — CPU, memory, worker status |

# 13. Security

- JWT validation on all protected endpoints

- Admin endpoints behind separate guard and RBAC — inaccessible to user
  tokens

- Rate limiting on auth, search, chat/query, and review endpoints

- All input validated via NestJS pipes + Zod + class-validator

- All external review text sanitised before storage and before LLM
  submission

- Secrets managed via environment variables — never hardcoded

- Audit log on all admin override actions

- Supabase RLS (Row Level Security) enforced at DB layer for user data
  isolation

# 14. Scalability Notes

MVP runs as a modular monolith. Splitting order if/when needed:

- Split search service first — highest read load, most benefit from
  independent scaling

- Split AI workers second — CPU/memory intensive, should not share
  resources with API

- Split ingestion third — least user-facing, lowest priority

Do not prematurely microservice. Each split adds operational overhead
that is not justified until the bottleneck is proven by real load data.

# 15. Architecture Decision Summary

| **Layer** | **Decision** | **Rationale** |
|----|----|----|
| Frontend | Next.js PWA on Vercel | One codebase for web + mobile install; no React Native overhead at MVP |
| Backend | NestJS on Render | Typed, modular, validated; free tier viable for MVP |
| Database | Supabase PostgreSQL | Managed, free tier, includes PostGIS + pgvector + storage |
| Search | Postgres FTS + pgvector | Sufficient for MVP; no separate search infra needed |
| Workers | Python + Celery on Render | Best ecosystem for scraping, ETL, LLM pipeline |
| LLM | Hybrid: Groq (batch) + Claude Haiku (live) | \$0 seed cost; \<\$10/mo live; production SLA where it matters |
| Queue | Redis + BullMQ + Celery | BullMQ triggers from Node; Celery executes in Python |
| Admin | Internal Next.js, separate auth | No public access; RBAC-gated; not part of customer product |

*GarageIQ UAE — System Architecture Document v1.2 — Internal Engineering
Reference*
