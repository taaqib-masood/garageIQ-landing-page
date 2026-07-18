<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><p><strong>GarageIQ UAE</strong></p>
<p>Ranking &amp; Search Logic Specification</p>
<p><em>v1.1 — Internal Engineering Reference</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| *v1.1 changes: Location resolution now uses direct text match on garage_locations — no geocoding API. Two-path retrieval strategy documented (named-location vs near-me). Trust score derivation updated — honesty removed as standalone signal. Featured placement removed from re-ranking (post-MVP). Cold-start demotion rules added.* |
|----|

**1. Purpose**

This document defines the search and ranking logic for GarageIQ UAE. It
is the source of truth for how queries are interpreted, garages are
retrieved, and results are ranked.

**2. Search Philosophy**

| **GarageIQ does NOT return** | **GarageIQ DOES return** |
|----|----|
| Nearby garages | The most relevant garages for the user's exact issue |
| Highest-rated garages | Garages with verified specialisation in the requested service |
| Most-reviewed garages | Garages that fit the user's vehicle, budget, and location |

*Search is not a listing system. Search is a garage relevance engine.*

**3. Search Objectives**

The ranking system optimises for:

> • Issue relevance — does this garage match the requested service?
>
> • Vehicle relevance — does this garage specialise in the user's car
> brand?
>
> • Trustworthiness — is this garage reliable based on review evidence?
>
> • User fit — price band match, customer segment alignment
>
> • Geographic practicality — reasonable distance without penalising
> quality
>
> • Confidence of recommendation — is the intelligence well-evidenced?

**4. Search Inputs**

| **Input type** | **Signals** |
|----|----|
| Explicit — from request | Natural language query, service filter, vehicle make/model/year, price preference, user device location (lat/lng), selected area/emirate, radius_km, urgency |
| Implicit — from user profile | Saved vehicles, prior search history, click behaviour, favourited garages, preferred price tier |

**5. Query Resolution Layer**

All searches start with structured query resolution. Claude Haiku
converts raw user input into a structured intent object. Search operates
on structured intent only — natural language is never ranked directly.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Input: "Need cheap Honda tyre replacement in Sharjah"</p>
<p>//</p>
<p>// Structured intent output:</p>
<p>{</p>
<p>"service_type": "Tyres",</p>
<p>"vehicle_brand": "Honda",</p>
<p>"vehicle_model": null,</p>
<p>"location_text": "Sharjah", // raw string for text-match
resolution</p>
<p>"price_band": "budget",</p>
<p>"urgency": null</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

If resolution confidence is low (\< 0.6): fall back to keyword +
text-based area match + geo fallback.

**6. Search Pipeline**

| **Stage** | **Description** |
|----|----|
| 1\. Query Resolution | Claude Haiku extracts structured intent from natural language |
| 2\. Location Resolution | Determine retrieval strategy based on presence/absence of named location |
| 3\. Candidate Retrieval | Fetch broad candidate set using resolved location + service/brand filters |
| 4\. Candidate Scoring | Score each candidate against composite relevance formula |
| 5\. Re-ranking | Apply diversity, cold-start demotion, spam suppression |
| 6\. Response Assembly | Return top N ranked results with enriched profile data |

**7. Location Resolution Strategy**

| *GarageIQ does NOT use a geocoding API (Mapbox, Google) for location resolution. Named locations are resolved via direct text match on garage_locations columns. PostGIS spatial queries are reserved for device-coordinate 'near me' searches only. This eliminates geocoding API cost and dependency.* |
|----|

| **Path** | **Condition** | **Resolution Method** | **SQL Technique** |
|----|----|----|----|
| Named location | Query contains a location name extracted by Claude (e.g. 'Sharjah', 'Al Quoz') | ILIKE match on garage_locations.emirate, city, and area columns | WHERE emirate ILIKE \$1 OR city ILIKE \$1 OR area ILIKE \$1 |
| Near me | No named location in query; device lat/lng present | PostGIS ST_DWithin radius search around device coordinates | WHERE ST_DWithin(geo_point, ST_MakePoint(\$lat,\$lng)::geography, \$radius_m) |
| No location | No named location; no device coords | No location filter applied; rank by relevance only | No geo WHERE clause |

**7.1 Named Location Precedence Rule**

Named location always takes precedence over device coordinates. A user
in Dubai searching 'garages in Sharjah' gets Sharjah results — their
Dubai device location is ignored for retrieval. Device coords are only
used as the fallback when there is no named location.

**7.2 Area Normalisation at Ingestion**

Area names in garage_locations must be normalised to a canonical list
during ingestion. This prevents text-match failures from inconsistent
spellings ('Al Quoz' vs 'Al-Quoz' vs 'AlQuoz Industrial 3'). The
ingestion pipeline maps raw source area strings to canonical area names
before writing to the database.

**8. Candidate Retrieval**

Retrieval fetches a broad candidate set (target: top 100) before
scoring. Uses a tiered hybrid approach:

| **Retrieval tier** | **Method** | **Target** |
|----|----|----|
| Tier 1 — Exact structured | Direct filter on garage_services, garage_brand_specializations, and location text match | High-precision, lower recall |
| Tier 2 — PostgreSQL FTS | Full-text search across garage name, primary_category, and service tags | Broader keyword match |
| Tier 3 — pgvector semantic | Cosine similarity on profile_embedding for semantic query expansion | Catch intent not in exact keywords |
| Geo constraint | Applied as overlay on all tiers — named location text match OR PostGIS radius | Enforced on all candidates |

All candidates are deduplicated before scoring. Target is ~100
candidates before the scoring pass.

**9. Candidate Scoring**

Each candidate receives a composite relevance score.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>Final Score =</p>
<p>(0.24 × Service Match Score) +</p>
<p>(0.18 × Brand Match Score) +</p>
<p>(0.14 × Trust Score) +</p>
<p>(0.10 × Geo Score) +</p>
<p>(0.08 × Price Fit Score) +</p>
<p>(0.07 × Speed Score) +</p>
<p>(0.08 × Review Confidence Score) +</p>
<p>(0.06 × Popularity Score) +</p>
<p>(0.05 × User Preference Score)</p>
<p>// Weights are configurable. Tuned post-launch using search-to-lead
data.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**10. Score Definitions**

**10.1 Service Match Score (weight: 0.24)**

How strongly the garage matches the requested service. Most important
factor.

> • Direct service tag match from garage_services
>
> • Service mention frequency in review evidence
>
> • Confidence-weighted service specialisation score

**10.2 Brand Match Score (weight: 0.18)**

How strongly the garage matches the requested vehicle brand.

> • Brand specialisation tag from garage_brand_specializations
>
> • Review evidence density for the brand
>
> • Brand concentration (% of brand-mentioning reviews vs total)

<span class="mark">What about brand agnostic garages?</span>

**10.3 Geo Score (weight: 0.10)**

Geographic practicality. Important but not dominant — a better
specialist farther away outranks a closer weak match.

| **Signal** | **Boost** |
|----|----|
| Named location: exact area match | Full score |
| Named location: same emirate match | 0.6 × score |
| Near-me: within radius | Continuous decay by distance — nearer = higher score |
| No location context | Neutral — all garages treated equally |

**10.4 Trust Score (weight: 0.14)**

Garage reliability derived from review evidence. Sourced from
garage_scores.trust_score.

> • Transparency and reliability language frequency in reviews
>
> • Complaint density (negative trust signals reduce score)
>
> • Repeat-visit sentiment (return customer language)
>
> • Overall review consistency

| *'Honesty' is not a standalone signal. It is subsumed into trust_score as one of multiple contributing sentiment types (transparency, reliability, complaint density). The word 'honesty' does not appear in any tag, prompt, or ranking field.* |
|----|

**10.5 Price Fit Score (weight: 0.08)**

Match between user price intent and garage price profile.

| **User intent** | **Garage price_band** | **Score**     |
|-----------------|-----------------------|---------------|
| budget          | budget                | 1.0           |
| budget          | mid_range             | 0.5           |
| budget          | premium               | 0.1           |
| mid_range       | mid_range             | 1.0           |
| premium         | premium               | 1.0           |
| no preference   | any                   | 0.7 (neutral) |

**10.6 Speed Score (weight: 0.07)**

Turnaround likelihood. Sourced from garage_scores.speed_score.

> • Quick / fast / same-day language frequency
>
> • Wait-time complaint frequency (negative signal)

**10.7 Review Confidence Score (weight: 0.08)**

Reliability of the garage's intelligence profile. Prevents
weakly-evidenced garages from over-ranking. Sourced from
garage_scores.review_confidence_score.

| *Cold-start demotion: garages with profile_completeness = 'new' receive review_confidence_score = 0.0. Garages with profile_completeness = 'limited' are capped at 0.3. This naturally demotes new listings without explicitly filtering them from results.* |
|----|

**10.8 Popularity Score (weight: 0.06)**

Soft signal. Low weight to avoid crowd bias.

> • Review volume
>
> • Click-through rate from past search sessions
>
> • Favourite count
>
> • Lead volume (call/WhatsApp taps)

**10.9 User Preference Score (weight: 0.05)**

Personalisation layer. Low weight in MVP.

> • Saved vehicle make/model match to garage brand specialisation
>
> • Prior clicks and favourites in same area or service category
>
> • Preferred price tier from past interactions

**11. Re-ranking Rules**

| *Featured/sponsored placement is post-MVP scope. The sponsored slot insertion in the original spec is removed. Re-ranking handles diversity, quality control, and deduplication only.* |
|----|

| **Re-ranking rule** | **Detail** |
|----|----|
| Diversity enforcement | No more than 3 garages from the same area in the top 5 results |
| Duplicate suppression | Deduplicate on external_source_id — same garage via multiple sources appears once |
| Cold-start demotion | profile_completeness='new' garages are pushed below position 15 regardless of other scores |
| Spam suppression | Garages with review_confidence_score \< 0.2 demoted from top 10 |
| Low-confidence demotion | If overall_score \< 0.3, demote to bottom of results — do not filter |

**12. Fallback Logic**

| **Condition** | **Action** |
|----|----|
| Structured intent weak (confidence \< 0.6) | Fallback to keyword match + area text match |
| Service match absent | Broaden to service family (e.g. 'transmission' → 'engine & drivetrain') |
| Brand match absent | Remove brand weighting — run service-only ranking |
| Named location matches \< 3 garages | Expand to same emirate |
| Emirate match \< 3 garages | Remove location filter — rank all active garages by relevance |
| Total results \< 5 after all filters | Expand semantic retrieval and remove price filter |

**13. Query Type Handling**

| **Type** | **Example** | **Primary weights** |
|----|----|----|
| Service-led | "Need AC repair" | Service Match + Trust + Geo |
| Brand-led | "Best BMW garage" | Brand Match + Trust + Service depth |
| Budget-led | "Cheap tyre replacement" | Price Fit + Service + Trust |
| Urgent | "Need urgent battery replacement" | Speed + Geo + Service |
| Near-me | "Garage near me" | Geo (PostGIS radius) + Trust + Service |

**14. Result Diversity Rules**

> • No more than 3 garages from the exact same street or sub-area in top
> 10
>
> • Mix of price bands in top results unless user explicitly filtered by
> price
>
> • At least one budget option in top 5 when user has not specified
> premium intent

**15. Search Quality Metrics**

| **Metric** | **Definition** | **Target** |
|----|----|----|
| Search-to-click rate | % of searches that result in a garage card click | \> 50% |
| Search-to-lead rate | % of searches that result in a call/WhatsApp tap | \> 15% |
| Zero-result rate | % of searches returning 0 results | \< 2% |
| Reformulation rate | % of searches followed by another search within 30s | \< 20% |
| Click rank position | Average rank position of clicked result | \< 3 |
| Cold-start exposure rate | % of results shown with 'New listing' or 'Limited data' badge | \< 25% of impressions |

**16. Ranking Guardrails**

| **Never allow** |
|----|
| Low-confidence garage (review_confidence_score \< 0.2) to appear in top 10 |
| Pure popularity (review volume alone) to dominate relevance |
| Raw star rating to override structured service/brand fit |
| A 'new listing' garage to appear above position 15 in ranked results |
| Location text match to be bypassed in favour of geocoding API |

**Priority hierarchy: Relevance \> Trust \> Proximity \> Popularity \>
Star rating**

**17. Success Criteria**

Search succeeds when users consistently feel: "These results actually
match my exact problem better than Google."

*GarageIQ UAE — Ranking & Search Logic Specification v1.1 — Internal
Engineering Reference*

<span class="mark">how about the natural language process will break the
keywords and search it based on those keywords.</span>

<span class="mark">Example: input= “quick battery change for bmw”</span>

<span class="mark">The results page displays garages for
keywords/filters: fast, battery and bmw.</span>

<span class="mark">The user can then remove these tags/filters and/or
add in additional ones if they want to without typing out a whole query
again.</span>
