<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><p><strong>GarageIQ UAE</strong></p>
<p>Database Schema Specification</p>
<p><em>v1.1 — PostgreSQL · PostGIS · pgvector · Supabase</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**1. Purpose**

This document defines the canonical relational schema for GarageIQ UAE.
It is the source of truth for backend data modelling.

| **This document establishes** |
|----|
| All primary tables — column definitions, data types, constraints, relationships, and indexes |
| PostgreSQL extension requirements and column-level usage (PostGIS, pgvector, uuid-ossp) |
| AI output versioning and admin override rules |
| pgvector embedding column additions required for semantic search |
| Entity relationship diagram and full relationship/cardinality summary |

**2. Database Principles**

| **Principle** | **Rule** |
|----|----|
| PostgreSQL is the source of truth | All structured application data lives in PostgreSQL. No other store is authoritative. |
| Raw and enriched data are separated | Raw ingestion payloads must never overwrite normalised or enriched records. |
| AI outputs are structured and versioned | All AI-generated tags and scores carry a model_version column and are auditable. |
| Search is read-optimised | Search-related fields are denormalised only where necessary. The search index is derived, not canonical. |
| Human overrides are preserved | Admin overrides always take precedence over AI outputs and survive re-enrichment. |
| Extensions are scoped | Each PostgreSQL extension is used only in documented tables and columns. See Section 5. |

**3. Core Entity Overview**

14 primary entities grouped by domain:

| **Domain** | **Tables** | **Colour code** |
|----|----|----|
| User domain | users, user_vehicles | Blue |
| Garage core | garages, garage_locations | Dark blue |
| AI intelligence | garage_tags, garage_scores, garage_services, garage_brand_specializations | Purple |
| Review data | garage_reviews, user_reviews | Orange |
| User actions | favorites, leads, search_queries | Green |
| Admin / overrides | admin_overrides | Red |

**4. Tables**

Each table section shows: column schema, constraints, and indexes. All
primary keys are uuid. All timestamps are timestamptz. All foreign keys
default to ON DELETE CASCADE except where noted.

| **4.1 users — User accounts** |
|-------------------------------|

| **Column**        | **Type**     | **Nullable** | **Notes**               |
|-------------------|--------------|--------------|-------------------------|
| id                | uuid         | NOT NULL     | PK — uuid_generate_v4() |
| email             | varchar(255) | nullable     | UNIQUE                  |
| phone             | varchar(32)  | nullable     | UNIQUE                  |
| auth_provider     | varchar(32)  | NOT NULL     | email \| google         |
| provider_user_id  | varchar(255) | nullable     | External OAuth ID       |
| full_name         | varchar(255) | nullable     |                         |
| profile_image_url | text         | nullable     |                         |
| created_at        | timestamptz  | NOT NULL     | DEFAULT now()           |
| updated_at        | timestamptz  | NOT NULL     | DEFAULT now()           |

| **Type** | **Definition**  |
|----------|-----------------|
| PK       | id              |
| UNIQUE   | email           |
| UNIQUE   | phone           |
| INDEX    | idx_users_email |
| INDEX    | idx_users_phone |

| **4.2 user_vehicles — Vehicles linked to a user account** |
|-----------------------------------------------------------|

| **Column** | **Type**    | **Nullable** | **Notes**                       |
|------------|-------------|--------------|---------------------------------|
| id         | uuid        | NOT NULL     | PK                              |
| user_id    | uuid        | NOT NULL     | FK → users.id ON DELETE CASCADE |
| make       | varchar(64) | NOT NULL     | e.g. Honda, BMW                 |
| model      | varchar(64) | NOT NULL     | e.g. Accord, X5                 |
| year       | int         | NOT NULL     |                                 |
| trim       | varchar(64) | nullable     | Optional                        |
| mileage_km | int         | nullable     | Optional                        |
| created_at | timestamptz | NOT NULL     |                                 |
| updated_at | timestamptz | NOT NULL     |                                 |

| **Type** | **Definition**                             |
|----------|--------------------------------------------|
| PK       | id                                         |
| FK       | user_id → users.id ON DELETE CASCADE       |
| INDEX    | idx_user_vehicles_user_id                  |
| INDEX    | idx_user_vehicles_make_model (make, model) |

| **4.3 garages — Canonical garage entity (central hub)** |
|---------------------------------------------------------|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| external_source_id | varchar(255) | nullable | Google Place ID |
| source_provider | varchar(64) | NOT NULL | e.g. google |
| name | varchar(255) | NOT NULL |  |
| slug | varchar(255) | NOT NULL | UNIQUE — URL-safe identifier |
| phone | varchar(32) | nullable |  |
| whatsapp | varchar(32) | nullable |  |
| website_url | text | nullable |  |
| primary_category | varchar(128) | nullable |  |
| profile_embedding | vector(1536) | nullable | pgvector — aggregated profile embedding (see §5.3) |
| is_verified | boolean | NOT NULL | DEFAULT false |
| is_featured | boolean | NOT NULL | DEFAULT false |
| is_active | boolean | NOT NULL | DEFAULT true |
| created_at | timestamptz | NOT NULL |  |
| updated_at | timestamptz | NOT NULL |  |

| **Type** | **Definition** |
|----|----|
| PK | id |
| UNIQUE | slug |
| INDEX | idx_garages_slug |
| INDEX | idx_garages_external_source_id |
| INDEX | idx_garages_verified_featured (is_verified, is_featured) |
| INDEX | idx_garages_profile_embedding USING ivfflat (profile_embedding vector_cosine_ops) WITH (lists=100) |

| **4.4 garage_locations — Geospatial location data (1:1 with garages)** |
|------------------------------------------------------------------------|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| garage_id | uuid | NOT NULL | FK → garages.id ON DELETE CASCADE |
| address_line | text | nullable |  |
| area | varchar(128) | nullable | e.g. Al Quoz — normalised at ingestion |
| city | varchar(64) | NOT NULL | e.g. Dubai |
| emirate | varchar(64) | NOT NULL | e.g. Dubai, Sharjah |
| country | varchar(64) | NOT NULL | UAE |
| latitude | numeric(9,6) | NOT NULL |  |
| longitude | numeric(9,6) | NOT NULL |  |
| geo_point | geography(Point,4326) | NOT NULL | PostGIS — used for ST_DWithin near-me queries |
| created_at | timestamptz | NOT NULL |  |

| **Type** | **Definition** |
|----|----|
| PK | id |
| FK | garage_id → garages.id ON DELETE CASCADE |
| INDEX | idx_garage_locations_garage_id |
| INDEX | idx_garage_locations_geo_point USING GIST (geo_point) — PostGIS radius search |
| INDEX | idx_garage_locations_area (area) — text match for named-location queries |
| INDEX | idx_garage_locations_emirate (emirate) — text match for emirate-level queries |

| *area and emirate are normalised to a canonical list during ingestion to ensure consistent text matching (e.g. 'Al Quoz' not 'Al-Quoz' or 'AlQuoz Industrial 3'). Named-location queries match via ILIKE on these columns — no geocoding API needed.* |
|----|

| **4.5 garage_reviews — Externally ingested reviews (Google / Outscraper)** |
|----|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| garage_id | uuid | NOT NULL | FK → garages.id ON DELETE CASCADE |
| source_provider | varchar(64) | NOT NULL | e.g. google |
| source_review_id | varchar(255) | NOT NULL | External review ID — dedup key |
| author_name | varchar(255) | nullable |  |
| rating | numeric(2,1) | NOT NULL | 1.0 – 5.0 |
| review_text | text | nullable | Input to AI extraction pipeline |
| review_date | timestamptz | nullable |  |
| raw_payload | jsonb | nullable | Full source payload — JSONB |
| review_embedding | vector(1536) | nullable | pgvector — per-review embedding (see §5.3) |
| created_at | timestamptz | NOT NULL |  |

| **Type** | **Definition** |
|----|----|
| PK | id |
| FK | garage_id → garages.id ON DELETE CASCADE |
| UNIQUE | (source_provider, source_review_id) — prevents duplicate ingestion |
| INDEX | idx_garage_reviews_garage_id |
| INDEX | idx_garage_reviews_rating |
| INDEX | idx_garage_reviews_review_date |
| INDEX | idx_garage_reviews_embedding USING ivfflat (review_embedding vector_cosine_ops) WITH (lists=100) |

| **4.6 user_reviews — First-party user-submitted reviews** |
|-----------------------------------------------------------|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| user_id | uuid | NOT NULL | FK → users.id ON DELETE CASCADE |
| garage_id | uuid | NOT NULL | FK → garages.id ON DELETE CASCADE |
| rating | numeric(2,1) | NOT NULL | 1.0 – 5.0 |
| review_text | text | nullable | Feeds AI enrichment pipeline on approval |
| service_type | varchar(64) | nullable | Controlled ontology value |
| vehicle_make | varchar(64) | nullable |  |
| vehicle_model | varchar(64) | nullable |  |
| is_verified_visit | boolean | NOT NULL | DEFAULT false |
| moderation_status | varchar(32) | NOT NULL | pending \| approved \| rejected |
| created_at | timestamptz | NOT NULL |  |

| **Type** | **Definition**                           |
|----------|------------------------------------------|
| PK       | id                                       |
| FK       | user_id → users.id ON DELETE CASCADE     |
| FK       | garage_id → garages.id ON DELETE CASCADE |
| INDEX    | idx_user_reviews_garage_id               |
| INDEX    | idx_user_reviews_user_id                 |
| INDEX    | idx_user_reviews_moderation_status       |

| **4.7 garage_tags — AI-generated and admin-managed tags** |
|-----------------------------------------------------------|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| garage_id | uuid | NOT NULL | FK → garages.id ON DELETE CASCADE |
| tag_type | varchar(64) | NOT NULL | service \| brand \| trust \| price \| best_for \| avoid_for |
| tag_value | varchar(128) | NOT NULL | e.g. BMW, AC Repair, premium |
| confidence_score | numeric(4,3) | nullable | 0.0 – 1.0 — suppressed if \< 0.5 |
| source_type | varchar(32) | NOT NULL | ai \| admin \| inferred |
| model_version | varchar(64) | nullable | Prompt version used to generate this tag |
| created_at | timestamptz | NOT NULL |  |

| **Type** | **Definition**                                   |
|----------|--------------------------------------------------|
| PK       | id                                               |
| FK       | garage_id → garages.id ON DELETE CASCADE         |
| INDEX    | idx_garage_tags_garage_id                        |
| INDEX    | idx_garage_tags_type_value (tag_type, tag_value) |
| INDEX    | idx_garage_tags_confidence (confidence_score)    |

| **4.8 garage_scores — Aggregated AI scores (1:1 with garages)** |
|-----------------------------------------------------------------|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| garage_id | uuid | NOT NULL | FK → garages.id ON DELETE CASCADE UNIQUE |
| trust_score | numeric(4,2) | nullable | 0.0–1.0 — aggregated trust signal |
| speed_score | numeric(4,2) | nullable | 0.0–1.0 — turnaround sentiment |
| price_score | numeric(4,2) | nullable | 0.0 = expensive, 1.0 = budget |
| luxury_score | numeric(4,2) | nullable | 0.0–1.0 — luxury segment frequency |
| budget_score | numeric(4,2) | nullable | 0.0–1.0 — budget segment frequency |
| review_confidence_score | numeric(4,2) | nullable | 0.0–1.0 — evidence density and volume |
| overall_score | numeric(4,2) | nullable | 0.0–1.0 — composite ranking score |
| model_version | varchar(64) | nullable | Prompt version used in last enrichment |
| updated_at | timestamptz | NOT NULL |  |

| **Type** | **Definition**                                          |
|----------|---------------------------------------------------------|
| PK       | id                                                      |
| FK       | garage_id → garages.id ON DELETE CASCADE                |
| UNIQUE   | garage_id — enforces 1:1 relationship with garages      |
| INDEX    | idx_garage_scores_garage_id                             |
| INDEX    | idx_garage_scores_overall_score — used for ranking sort |

| **4.9 garage_services — Normalised service capabilities** |
|-----------------------------------------------------------|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| garage_id | uuid | NOT NULL | FK → garages.id ON DELETE CASCADE |
| service_name | varchar(128) | NOT NULL | Controlled ontology value — e.g. AC Repair, Tyres |
| confidence_score | numeric(4,3) | nullable | 0.0 – 1.0 |
| source_type | varchar(32) | NOT NULL | ai \| admin \| inferred |
| created_at | timestamptz | NOT NULL |  |

| **Type** | **Definition** |
|----|----|
| PK | id |
| FK | garage_id → garages.id ON DELETE CASCADE |
| INDEX | idx_garage_services_garage_id |
| INDEX | idx_garage_services_service_name — used for service filter queries |

| **4.10 garage_brand_specializations — Normalised vehicle brand expertise** |
|----|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| garage_id | uuid | NOT NULL | FK → garages.id ON DELETE CASCADE |
| brand_name | varchar(64) | NOT NULL | Controlled ontology value — e.g. BMW, Honda |
| confidence_score | numeric(4,3) | nullable | 0.0 – 1.0 |
| source_type | varchar(32) | NOT NULL | ai \| admin \| inferred |
| created_at | timestamptz | NOT NULL |  |

| **Type** | **Definition** |
|----|----|
| PK | id |
| FK | garage_id → garages.id ON DELETE CASCADE |
| INDEX | idx_garage_brand_specs_garage_id |
| INDEX | idx_garage_brand_specs_brand_name — used for brand filter queries |

| **4.11 favorites — User-saved garages** |
|-----------------------------------------|

| **Column** | **Type**    | **Nullable** | **Notes**                         |
|------------|-------------|--------------|-----------------------------------|
| id         | uuid        | NOT NULL     | PK                                |
| user_id    | uuid        | NOT NULL     | FK → users.id ON DELETE CASCADE   |
| garage_id  | uuid        | NOT NULL     | FK → garages.id ON DELETE CASCADE |
| created_at | timestamptz | NOT NULL     |                                   |

| **Type** | **Definition**                                  |
|----------|-------------------------------------------------|
| PK       | id                                              |
| FK       | user_id → users.id ON DELETE CASCADE            |
| FK       | garage_id → garages.id ON DELETE CASCADE        |
| UNIQUE   | (user_id, garage_id) — prevents duplicate saves |
| INDEX    | idx_favorites_user_id                           |
| INDEX    | idx_favorites_garage_id                         |

| **4.12 leads — Monetisable user lead actions (call / WhatsApp)** |
|------------------------------------------------------------------|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| user_id | uuid | nullable | FK → users.id SET NULL on delete — anonymous allowed |
| garage_id | uuid | NOT NULL | FK → garages.id ON DELETE CASCADE |
| lead_type | varchar(32) | NOT NULL | call \| whatsapp \| click |
| source_surface | varchar(64) | NOT NULL | search \| garage_detail |
| created_at | timestamptz | NOT NULL |  |

| **Type** | **Definition** |
|----|----|
| PK | id |
| FK | user_id → users.id ON DELETE SET NULL (nullable — anonymous leads tracked) |
| FK | garage_id → garages.id ON DELETE CASCADE |
| INDEX | idx_leads_garage_id |
| INDEX | idx_leads_lead_type |
| INDEX | idx_leads_created_at |

| **4.13 search_queries — Search analytics and ranking feedback log** |
|---------------------------------------------------------------------|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| user_id | uuid | nullable | FK → users.id SET NULL on delete — anonymous allowed |
| raw_query | text | NOT NULL | Original user input string |
| parsed_query | jsonb | nullable | Structured intent from Claude Haiku — JSONB |
| results_count | int | nullable | Number of garages returned |
| created_at | timestamptz | NOT NULL |  |

| **Type** | **Definition**                        |
|----------|---------------------------------------|
| PK       | id                                    |
| FK       | user_id → users.id ON DELETE SET NULL |
| INDEX    | idx_search_queries_user_id            |
| INDEX    | idx_search_queries_created_at         |

| **4.14 admin_overrides — Human overrides for AI-generated outputs** |
|---------------------------------------------------------------------|

| **Column** | **Type** | **Nullable** | **Notes** |
|----|----|----|----|
| id | uuid | NOT NULL | PK |
| garage_id | uuid | NOT NULL | FK → garages.id ON DELETE CASCADE |
| target_type | varchar(64) | NOT NULL | tag \| score \| metadata |
| target_key | varchar(128) | NOT NULL | e.g. trust_score, best_for:BMW |
| override_value | jsonb | NOT NULL | New value — JSONB to accommodate any type |
| reason | text | nullable | Admin-supplied reason for override |
| admin_user_id | uuid | NOT NULL | ID of admin who made the override |
| created_at | timestamptz | NOT NULL |  |

| **Type** | **Definition**                           |
|----------|------------------------------------------|
| PK       | id                                       |
| FK       | garage_id → garages.id ON DELETE CASCADE |
| INDEX    | idx_admin_overrides_garage_id            |
| INDEX    | idx_admin_overrides_created_at           |

**5. PostgreSQL Extensions**

GarageIQ uses three PostgreSQL extensions. All are available on Supabase
managed PostgreSQL and must be enabled once during initial schema
migration.

**5.1 Extension Map**

| **Extension** | **Purpose** | **Tables** | **Columns / Index type** |
|----|----|----|----|
| PostGIS | Geospatial point storage and radius queries | garage_locations | geo_point geography(Point,4326) + GIST index |
| pgvector | Embedding-based semantic search | garages, garage_reviews | profile_embedding vector(1536) + review_embedding vector(1536) + IVFFlat index |
| JSONB (built-in) | Schema-flexible storage for semi-structured data | garage_reviews, search_queries, admin_overrides | raw_payload, parsed_query, override_value |
| uuid-ossp | UUID v4 primary key generation | All tables | id uuid DEFAULT uuid_generate_v4() |

**5.2 Required Migration SQL**

Run once during initial schema migration on Supabase:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>CREATE EXTENSION IF NOT EXISTS postgis;</p>
<p>CREATE EXTENSION IF NOT EXISTS vector;</p>
<p>CREATE EXTENSION IF NOT EXISTS "uuid-ossp";</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**5.3 pgvector Embedding Columns**

| *The architecture document specifies pgvector for semantic retrieval. Two embedding columns are required — one in garage_reviews (per-review), one in garages (aggregated profile). Both are already included in Sections 4.3 and 4.5 above.* |
|----|

| **Table** | **Column** | **Type** | **Purpose** |
|----|----|----|----|
| garage_reviews | review_embedding | vector(1536) | Per-review embedding for similarity-based query expansion |
| garages | profile_embedding | vector(1536) | Aggregated profile embedding for fast semantic ranking |

Vector dimension 1536 matches OpenAI ada-002 / text-embedding-3-small.
Adjust if using a different embedding provider (Voyage AI, Cohere,
etc.).

Index DDL:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>CREATE INDEX idx_garage_reviews_embedding</p>
<p>ON garage_reviews</p>
<p>USING ivfflat (review_embedding vector_cosine_ops)</p>
<p>WITH (lists = 100);</p>
<p>CREATE INDEX idx_garages_profile_embedding</p>
<p>ON garages</p>
<p>USING ivfflat (profile_embedding vector_cosine_ops)</p>
<p>WITH (lists = 100);</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**6. Entity Relationship Diagram**

The diagram below shows all 14 entities, their primary and foreign keys,
and cardinality. Tables are colour-coded by domain (see Section 3).
JSONB columns are highlighted in green. PostGIS-backed columns are
highlighted in amber. The garages table is the central hub — 10 of 14
relationships radiate from it.

<img src="media/image1.png" style="width:6.29921in;height:4.33071in" />

*Figure 1 — GarageIQ UAE Entity Relationship Diagram (14 entities)*

**6.1 Relationship Summary**

| **From** | **To** | **Cardinality** | **On Delete** |
|----|----|----|----|
| users | user_vehicles | 1 : N | CASCADE |
| users | user_reviews | 1 : N | CASCADE |
| users | favorites | 1 : N | CASCADE |
| users | leads | 1 : N | SET NULL (nullable FK) |
| users | search_queries | 1 : N | SET NULL (nullable FK) |
| garages | garage_locations | 1 : 1 | CASCADE |
| garages | garage_scores | 1 : 1 | CASCADE |
| garages | garage_reviews | 1 : N | CASCADE |
| garages | user_reviews | 1 : N | CASCADE |
| garages | garage_tags | 1 : N | CASCADE |
| garages | garage_services | 1 : N | CASCADE |
| garages | garage_brand_specializations | 1 : N | CASCADE |
| garages | favorites | 1 : N | CASCADE |
| garages | leads | 1 : N | CASCADE |
| garages | admin_overrides | 1 : N | CASCADE |

**6.2 Central Hub — garages**

The garages table participates in 10 of the 14 entity relationships.
Most write paths either originate from garages (ingestion, AI
enrichment, admin overrides) or terminate at garages (user actions:
reviews, favourites, leads). Indexes on garage_id are defined explicitly
in every dependent table.

**7. Schema Notes**

| **Rule** |
|----|
| All IDs use UUID — generated via uuid_generate_v4() default |
| All timestamps use timestamptz — never timestamp without timezone |
| All AI outputs carry a model_version column — tags and scores are auditable and replaceable |
| All admin overrides supersede AI outputs and survive re-enrichment |
| Search index is derived, not source-of-truth — rebuilt from garage_scores and garage_tags |
| Vector columns (review_embedding, profile_embedding) use cosine similarity by default |
| All FKs default to ON DELETE CASCADE except leads.user_id and search_queries.user_id (SET NULL) |
| area and emirate in garage_locations are normalised at ingestion time — text match depends on consistency |

*GarageIQ UAE — Database Schema Specification v1.1 — PostgreSQL ·
PostGIS · pgvector · Supabase*
