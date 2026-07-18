<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><p><strong>GarageIQ UAE</strong></p>
<p>Engineering Standards &amp; Development Rules</p>
<p><em>v1.1 — Internal Engineering Reference</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| *v1.1 changes: Hybrid LLM stack documented (Groq + Anthropic/gemini). PWA added to frontend stack. admin/ app added to monorepo. pgvector and PostGIS extension rules added to DB standards. LLM-call logging requirements added. Groq schema validation rules added. FastAPI removed — Python workers use Celery only (no HTTP service).* |
|----|

**1. Purpose**

This document defines the engineering standards, implementation rules,
and development constraints for GarageIQ UAE. It is the source of truth
for implementation quality and development consistency — for both human
developers and AI coding agents.

**2. Engineering Principles**

| **Principle** | **Definition** |
|----|----|
| Clarity over cleverness | Code must be easy to read, debug, and extend. Clever abstractions that save 3 lines are not worth the comprehension cost. |
| Typed by default | All interfaces, DTOs, services, and responses must be strongly typed. No \`any\`. |
| Single responsibility always | Every module, service, and function has one clear responsibility. |
| Explicit contracts only | No implicit behaviour across module boundaries. If it crosses a boundary, it has a typed contract. |
| Predictable \> magical | Avoid hidden abstractions and implicit side effects. The next developer must be able to trace execution. |
| AI-generated code is untrusted | All AI-generated code must pass human review and comply with this document before merge. |
| One infra decision per layer | No competing tool options at build time. Each layer has one chosen tool. See Section 3. |

**3. Core Stack Standards**

**3.1 Frontend (PWA)**

| **Tool** | **Version / Notes** |
|----|----|
| Next.js | 14 (App Router). PWA via next-pwa. |
| TypeScript | Strict mode. No implicit any. |
| Tailwind CSS | Utility-first styling. No CSS modules. |
| React Query (TanStack) | All server state. No fetch() in components. |
| Zod | Schema validation for all API responses consumed by frontend. |
| Zustand | Light client UI state only. Not for server data. |
| Mapbox GL JS | Maps and location display. Free tier. |
| next-pwa | Service worker + offline caching + install manifest. |
| Hosting | Vercel |

**3.2 Backend**

| **Tool** | **Version / Notes** |
|----|----|
| NestJS | TypeScript. Modular architecture. Search lives inside the monolith for MVP. |
| TypeScript | Strict mode. Shared types via packages/types. |
| Prisma | ORM. Schema is canonical source of truth. Migrations are immutable. |
| PostgreSQL | Via Supabase managed. Extensions: PostGIS, pgvector, uuid-ossp. |
| Redis | Job queue broker (BullMQ) + cache. |
| Passport.js | Auth — JWT strategy for users, separate strategy for admin. |
| BullMQ | Node-side job queue. Enqueues jobs for Python Celery workers. |
| Hosting | Render (Web Service) / vercel? |

**3.3 Python Workers**

| **Tool** | **Version / Notes** |
|----|----|
| Python | 3.11+ |
| Celery | Task queue. Consumes Redis broker. No FastAPI — workers are not HTTP services. |
| Pydantic v2 | Schema validation for all LLM outputs and pipeline data contracts. |
| Groq SDK | Batch extraction and re-enrichment. llama-3.3-70b-versatile model. |
| Anthropic SDK/ gemini SDK? | Live query resolution. claude-haiku-4-5 model. |
| Hosting | Render (Background Worker) |

| *FastAPI is removed from the stack. Python workers are Celery-only. They receive jobs from the Redis queue triggered by BullMQ (Node side) and do not expose HTTP endpoints. All API contracts are owned by the NestJS backend.* |
|----|

**3.4 Admin Console**

| **Tool** | **Notes** |
|----|----|
| Next.js | Separate app at apps/admin/. Internal only — not public. |
| TypeScript | Same standards as main web app. |
| Auth | Separate admin JWT (different secret). No shared session with user auth. |
| Hosting | Vercel (separate deployment). Password-protected or IP-restricted. |

**4. Monorepo Structure**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>apps/</p>
<p>web/ # Customer PWA (Next.js)</p>
<p>api/ # Backend (NestJS)</p>
<p>worker/ # Python Celery workers</p>
<p>admin/ # Internal admin console (Next.js) — not public</p>
<p>packages/</p>
<p>ui/ # Shared React components</p>
<p>config/ # Shared ESLint, tsconfig, Tailwind config</p>
<p>types/ # Shared TypeScript types across apps/api/web</p>
<p>utils/ # Shared utility functions</p>
<p>infra/</p>
<p>docker/ # Docker compose for local dev</p>
<p>scripts/ # DB seed, migration, data scripts</p>
<p>migrations/ # Prisma migration files</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**5. Folder Rules**

**5.1 Frontend (apps/web/src/)**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>app/ # Next.js App Router pages and layouts</p>
<p>components/ # Reusable UI components (presentational only)</p>
<p>features/ # Feature-scoped modules (search/, garage/, review/)</p>
<p>hooks/ # React hooks for UI logic</p>
<p>lib/ # Utility functions and helpers</p>
<p>services/ # API call functions (no fetch in components)</p>
<p>stores/ # Zustand stores (UI state only)</p>
<p>types/ # App-specific TypeScript types</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**5.2 Backend (apps/api/src/)**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>modules/ # NestJS feature modules (auth, users, vehicles,
garages, search, ...)</p>
<p>common/ # Shared guards, pipes, interceptors, decorators</p>
<p>config/ # Environment config with Zod validation on boot</p>
<p>db/ # Prisma client singleton and DB utilities</p>
<p>jobs/ # BullMQ job producers (enqueue jobs for Python
workers)</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**5.3 Worker (apps/worker/src/)**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>pipelines/ # Orchestration logic (ingestion pipeline, enrichment
pipeline)</p>
<p>extractors/ # Per-review LLM extraction logic</p>
<p>aggregators/ # Garage-level aggregation from extracted signals</p>
<p>prompts/ # Versioned prompt templates (.txt or .py) — never
inline</p>
<p>schemas/ # Pydantic models for LLM input/output validation</p>
<p>providers/ # LLM provider clients (groq_client.py,
anthropic_client.py)</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**6. Naming Conventions**

| **Context** | **Convention** | **Examples** |
|----|----|----|
| Files | kebab-case | garage-card.tsx, search.service.ts |
| React components | PascalCase | GarageCard.tsx, SearchBar.tsx |
| NestJS services | \*.service.ts | search.service.ts |
| NestJS controllers | \*.controller.ts | garages.controller.ts |
| NestJS DTOs | \*.dto.ts | create-review.dto.ts |
| Variables / functions | camelCase | resolveQuery(), garageScore |
| Classes / types / interfaces | PascalCase | GarageProfile, SearchIntent |
| Constants | UPPER_SNAKE_CASE | MAX_RADIUS_KM, DEFAULT_PAGE_LIMIT |
| Python files | snake_case | groq_client.py, extraction_pipeline.py |
| Pydantic models | PascalCase | ExtractionOutput, GarageProfile |
| Celery tasks | snake_case verb + noun | extract_reviews(), aggregate_garage_profile() |

**7. Type Safety Rules**

> • No \`any\` — ever. Use \`unknown\` and narrow explicitly if needed.
>
> • No implicit returns in TypeScript functions
>
> • All API request and response payloads must have typed DTOs (NestJS)
> or Zod schemas (frontend)
>
> • All Prisma query results must be typed through the Prisma-generated
> types
>
> • All LLM outputs must pass Pydantic validation (Python) before
> storage
>
> • All LLM outputs consumed by Node must be validated with Zod before
> use
>
> • Shared types live in packages/types/ — not duplicated per app

**8. API Standards**

> • All endpoints versioned under /api/v1
>
> • All request payloads validated at NestJS pipe layer (ValidationPipe
> — whitelist: true, forbidNonWhitelisted: true)
>
> • All responses use the standard envelope: { success, data, meta,
> error }
>
> • No raw Prisma objects returned — map to response DTOs
>
> • No unbounded list endpoints — all list endpoints paginated
>
> • No mixed response shapes on the same endpoint
>
> • Admin endpoints separated under /admin/\* with dedicated guard

**9. Database Standards**

**9.1 General Rules**

> • Prisma schema (schema.prisma) is the canonical source of truth for
> DB structure
>
> • UUID primary keys on all tables — uuid_generate_v4() default
>
> • timestamptz on all timestamp columns — never timestamp without
> timezone
>
> • Soft delete only where explicitly required — most tables use hard
> delete
>
> • Explicit indexes defined for all hot query paths
>
> • Migrations are immutable — never edit an applied migration

**9.2 PostgreSQL Extensions**

| *Three extensions are required. All must be enabled during initial migration via: CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS vector; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";* |
|----|

| **Extension** | **Tables that use it** | **Columns / index type** |
|----|----|----|
| PostGIS | garage_locations | geo_point (geography(Point,4326)) + GIST index |
| pgvector | garage_reviews, garages | review_embedding vector(1536) + profile_embedding vector(1536) + IVFFlat index |
| uuid-ossp | All tables | id uuid DEFAULT uuid_generate_v4() |

**9.3 Vector Index Rules**

> • Use IVFFlat index for cosine similarity — operator class:
> vector_cosine_ops
>
> • Set lists = 100 for datasets up to 100K vectors. Increase to sqrt(n)
> at scale.
>
> • Never run raw sequential scan on vector columns in production —
> always use the index

**10. Service Rules**

| **Layer** | **Rule** |
|----|----|
| NestJS controllers | Thin — validate request, call service, return response. No business logic. |
| NestJS services | Own all business logic. Call repositories or other services. |
| NestJS repositories | Own all DB persistence. Prisma queries live here only — not in services. |
| React components | Presentational only. No fetch calls. No API logic. |
| React hooks | Own UI logic and state. Call services for data. |
| Frontend services | Own all API calls. Return typed response objects. |
| Celery extractors | Parse. Accept raw input, return structured Pydantic model. |
| Celery aggregators | Compute. Accept extracted signals, return aggregated profile. |
| Celery pipelines | Orchestrate. Call extractors and aggregators in sequence. |

**11. LLM Usage Rules**

| *Two LLM providers are used. The provider boundary is strict — Groq handles all async batch jobs. Claude handles all live user-facing calls. Never swap providers without updating this document.* |
|----|

**11.1 Provider Routing**

| **Job type** | **Provider** | **Client module** |
|----|----|----|
| Review signal extraction (batch) | Groq | apps/worker/src/providers/groq_client.py |
| Garage profile aggregation (batch) | Groq | apps/worker/src/providers/groq_client.py |
| Review summarisation (batch) | Groq | apps/worker/src/providers/groq_client.py |
| Live query resolution | Anthropic (Claude Haiku) | apps/api/src/modules/search/llm_resolver.service.ts |

**11.2 Groq Output Validation Rules**

> • Every Groq response must be validated against the Pydantic
> extraction schema before any value is stored
>
> • If Pydantic validation fails: retry with temperature=0 and a schema
> repair prompt
>
> • After 3 consecutive failures on same job: fall back to Claude Haiku
> and log fallback_triggered=true
>
> • Never store partially-valid Groq output — validate the whole schema
> or retry

**11.3 Prompt Management Rules**

> • All prompts stored as versioned files in apps/worker/src/prompts/
>
> • No prompt strings inline in business logic
>
> • Every prompt file has a version string — e.g. extraction_v3.txt
>
> • The model_version column in garage_tags and garage_scores must store
> the prompt version used
>
> • Groq and Claude versions of the same logical prompt maintained
> separately in same directory
>
> • Temperature: 0 for all extraction prompts. 0.1 maximum for
> summarisation.

**11.4 LLM Call Logging Requirements**

Every LLM call (Groq or Claude) must emit a structured log entry with:

| **Log field** | **Type** | **Notes** |
|----|----|----|
| provider | string | "groq" \| "anthropic" |
| model | string | e.g. 'llama-3.3-70b-versatile', 'claude-haiku-4-5' |
| prompt_version | string | From prompt file version string |
| job_type | string | e.g. 'extraction', 'aggregation', 'query_resolution' |
| garage_id | uuid \| null | null for query resolution jobs |
| input_token_count | int | Approximate from SDK |
| output_token_count | int | Approximate from SDK |
| latency_ms | int | Wall-clock time of API call |
| validation_passed | bool | Did Pydantic/Zod validation pass on first attempt? |
| fallback_triggered | bool | Was the provider fallback activated? |
| error | string \| null | Error message if call failed |

**12. State Management Rules**

| **State type** | **Tool** | **Rule** |
|----|----|----|
| Server data (API responses) | React Query (TanStack) | Cache, invalidate, and refetch via React Query. Never store in Zustand. |
| UI state (modals, filters, selections) | Zustand | Lightweight. One store per feature area maximum. |
| Form state | React Hook Form (if needed) or useState | No Zustand for form fields. |
| Global shared state | Zustand | Only for truly cross-cutting concerns (e.g. active vehicle, auth user). |

**13. Error Handling Rules**

> • No silent failures — every async path must handle and log errors
>
> • Typed errors only — use custom exception classes, not generic
> Error()
>
> • User-facing error messages must be human-readable and actionable
> (see UI/UX spec Section 11)
>
> • Structured logs on every error (see Section 14)
>
> • LLM call failures must follow the fallback rules in Section 11.2 —
> never propagate to users

**14. Logging Standards**

All logs must be structured (JSON), contextual, and machine-readable. No
console.log in production code.

| **Required field** | **Source** |
|----|----|
| request_id | Generated per HTTP request — propagated to all downstream jobs |
| user_id | From JWT if authenticated — null for anonymous |
| module | NestJS module name or Celery task name |
| action | What was being done (e.g. 'search_query', 'extract_review') |
| status | "success" \| "error" \| "retry" \| "fallback" |
| duration_ms | Wall clock time for the operation |
| error | Error message and stack if status='error' |

LLM calls additionally require the fields in Section 11.4.

**15. Testing Standards**

| **Test type** | **Required?** | **Scope** |
|----|----|----|
| Unit tests | Yes | Core business logic in NestJS services and Python aggregators |
| Integration tests | Yes | All NestJS API endpoints — request in, response out |
| Contract tests | Yes | All request/response DTOs — verify shape matches spec |
| Pipeline tests | Yes | AI extraction pipeline — known input → known output schema |
| E2E tests | No (MVP) | Full browser E2E coverage not required on day 1 |

> • Critical path coverage required before any feature is marked done
>
> • Pipeline tests must include: valid review → correct extraction,
> malformed LLM output → validation rejection, below-threshold evidence
> → no tag written

**16. AI Coding Agent Rules**

| *AI coding agents (Claude Code, Cursor, Copilot) are permitted implementation tools. They are not architecture authorities. They must follow this document exactly.* |
|----|

**16.1 What AI Agents Must Never Do**

> • Invent architecture decisions not in the spec documents
>
> • Add schema fields not in the DBS specification
>
> • Add API endpoints not in the API Contract specification
>
> • Bypass TypeScript strict mode or Pydantic validation
>
> • Introduce a new dependency not approved in Section 3
>
> • Use \`any\` in TypeScript
>
> • Write prompts inline in business logic
>
> • Create a FastAPI HTTP service for worker tasks

**16.2 What AI Agents Must Do**

> • Follow the spec documents exactly — PRD, SAD, DBS, API, AI, Ranking,
> UI/UX, this document
>
> • Generate typed code matching the contracts in packages/types/
>
> • Generate tests alongside implementation
>
> • Preserve NestJS module boundaries — do not put logic in the wrong
> module
>
> • Ask for clarification before inventing missing context
>
> • Log all LLM calls following Section 11.4 format

**17. Config Rules**

> • All config via environment variables — never hardcoded values
>
> • Config schema validated on boot using Zod (Node) or Pydantic
> (Python) — fail fast if env is incomplete
>
> • No secrets in code, git history, or logs
>
> • Required env vars documented in apps/\*/README.md

| **Env var** | **Service** | **Notes** |
|----|----|----|
| DATABASE_URL | api, worker | Supabase PostgreSQL connection string |
| REDIS_URL | api, worker | Redis connection string |
| GROQ_API_KEY | worker | Groq free tier API key |
| ANTHROPIC_API_KEY | api | Anthropic API key for Claude Haiku |
| JWT_SECRET | api | User JWT signing secret |
| ADMIN_JWT_SECRET | api | Admin JWT signing secret — different from JWT_SECRET |
| GOOGLE_CLIENT_ID | api | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | api | Google OAuth client secret |
| SUPABASE_URL | api | Supabase project URL |
| SUPABASE_SERVICE_KEY | api | Supabase service role key |

**18. Security Rules**

> • Validate all input at the NestJS pipe layer before any service logic
> runs
>
> • Sanitise all external text (review text, garage names) before LLM
> submission and DB storage
>
> • Rate limit all public endpoints (see API Contract Section 18)
>
> • Verify auth server-side on every protected request — never trust
> client-supplied user ID
>
> • Admin JWT secret must differ from user JWT secret — separate env var
>
> • Admin endpoints return 403 FORBIDDEN for user tokens regardless of
> content
>
> • Audit log all admin override actions (who, what, when, reason)
>
> • Supabase RLS (Row Level Security) enabled — users can only
> read/write their own data

**19. Performance Rules**

> • Paginate all list endpoints — no unbounded queries
>
> • Cache garage detail reads in Redis (TTL: 5 minutes) — garage data
> changes slowly
>
> • Debounce search bar autocomplete: 300ms
>
> • All long-running work (ingestion, enrichment) is async via Celery —
> never in the request path
>
> • Avoid N+1 queries — use Prisma's include for related data in one
> query
>
> • Index all hot query paths — garage_id FKs, geo_point GIST, text
> search tsvector, vector IVFFlat
>
> • pgvector similarity search must use the IVFFlat index — never
> sequential scan on vector columns

**20. CI / CD Rules**

Every PR must pass all of these before merge:

> • ESLint + Prettier (TypeScript)
>
> • tsc --noEmit (type check, no build)
>
> • Unit tests
>
> • Integration tests
>
> • Prisma schema validation (prisma validate)
>
> • Python: ruff lint + mypy type check + pytest

| *No direct deploy to production from local. All deployments must pass CI. Render auto-deploys from main branch — CI must be green before merge to main.* |
|----|

**21. Code Review Rules**

Every PR must be reviewed against:

| **Check** | **Fails if** |
|----|----|
| Spec compliance | Implementation contradicts any of the 8 spec documents |
| Typing | Any \`any\`, implicit type, or missing DTO |
| Test coverage | Critical path code added without corresponding test |
| Naming | Violates Section 6 naming conventions |
| Module boundaries | Logic placed in wrong module or layer (e.g. DB query in controller) |
| Prompt hygiene | Prompt string found inline in business logic code |
| LLM logging | LLM call added without the Section 11.4 log fields |
| No dead code | Commented-out code, unused imports, or unreachable branches |

**22. Definition of Done**

A feature is only complete when all of the following are true:

> • Matches the relevant spec document exactly
>
> • Fully typed — no implicit types or any
>
> • Unit and integration tests written and passing
>
> • Validated against DTOs / Pydantic schemas
>
> • Observable — structured logs in place
>
> • Reviewed and merged via PR (not pushed directly to main)

| *Code that 'works' but violates this spec is not done. Working incorrectly is worse than not working, because it passes review and creates hidden technical debt.* |
|----|

**23. Final Rule**

The system must remain understandable by a new engineer in under one
day.

*If an implementation decision increases confusion, it is wrong —
regardless of whether it 'works'.*

*GarageIQ UAE — Engineering Standards v1.1 — Internal Engineering
Reference*
