<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><p><strong>GarageIQ UAE</strong></p>
<p>AI / ML Intelligence Specification</p>
<p><em>v1.1 — Internal Engineering Reference</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| *v1.1 changes: Hybrid LLM strategy documented (Groq for batch, Claude for live). Honesty removed as standalone signal — folded into trust_score. Cold-start thresholds aligned with PRD v1.1. Provider routing rules added.* |
|----|
| *Gemini 1.5 flash in place of haiku due to its cost effectiveness and free API calls* |

**1. Purpose**

This document defines the AI intelligence layer for GarageIQ UAE — what
AI does, what it doesn't do, all extraction schemas, provider routing,
confidence scoring, fallback rules, and hallucination prevention.

**2. AI System Role**

AI in GarageIQ is an asynchronous enrichment system. It never sits in
the synchronous request path except for live query resolution.

| **AI Does NOT** | **AI DOES** |
|----|----|
| Directly answer user queries | Convert unstructured review text into structured signals |
| Directly rank garages | Infer specialisation from reviews |
| Directly control search results | Classify sentiment and trust indicators |
| Generate UI copy without validation | Generate normalised garage intelligence profiles |
|  | Resolve natural language search queries into structured intent |
|  | Enrich the search system with structured metadata |

*AI is a data enrichment pipeline, not the product itself.*

**3. AI Responsibilities**

| **Function** | **Provider** | **Trigger** |
|----|----|----|
| Review Signal Extraction | Groq (Llama 3.3 70B) | Post-ingestion, async batch |
| Garage Intelligence Aggregation | Groq (Llama 3.3 70B) | Post-extraction, async batch |
| Query Resolution | Claude Haiku (claude-haiku-4-5) | Live — every user search |
| Review Summarisation | Groq (Llama 3.3 70B) | Post-aggregation, async |
| Confidence Scoring | Computed by pipeline | Part of every extraction job |

**4. LLM Provider Strategy**

| *GarageIQ uses a hybrid LLM strategy. Groq free tier handles all high-volume async batch work. Claude API handles all live, user-facing, latency-sensitive calls. This keeps monthly LLM spend under \$10 at MVP scale.* |
|----|

| **Task** | **Provider** | **Model** | **Reason** | **Fallback** |
|----|----|----|----|----|
| Bulk seed extraction (one-time) | Groq Free | llama-3.3-70b-versatile | \$0 cost, 14.4K req/day free tier | Retry 3x → Claude Haiku |
| Ongoing review re-enrichment | Groq Free | llama-3.3-70b-versatile | Async, retry-tolerant | Retry 3x → Claude Haiku |
| Review summarisation | Groq Free | llama-3.3-70b-versatile | Async, retry-tolerant | Retry 3x → Claude Haiku |
| Live query resolution | Anthropic API | claude-haiku-4-5 | Real users waiting; SLA required | Structured regex fallback parser |

**4.1 Groq Fallback Rules**

Groq output must pass Pydantic schema validation before being stored. If
validation fails:

> • Retry the same call with temperature=0 and an explicit repair prompt
>
> • After 3 consecutive Groq failures on the same job, fall back to
> Claude Haiku
>
> • Log the fallback event: provider, model, failure_reason,
> fallback_triggered=true
>
> • Do not block garage availability — partial enrichment is acceptable

**4.2 Cost Model**

| **Item** | **Provider** | **Estimated Cost** |
|----|----|----|
| 5,000 garage seed extraction | Groq Free | \$0 |
| 5,000 garage aggregation | Groq Free | \$0 |
| Daily query resolution (1,000 searches) | Claude Haiku | ~\$0.30/day (~\$9/month) |
| Monthly review re-enrichment | Groq Free | \$0 |
| Total monthly LLM spend at MVP | — | \< \$10 |

**5. Core AI Workflows**

**5.1 Review Signal Extraction**

Converts raw review text into structured signals. Runs per-review in
batch.

**Input — single review text:**

| "Excellent for BMW AC diagnostics. Expensive but honest and quick." |
|---------------------------------------------------------------------|

**Output — structured extraction schema:**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>{</p>
<p>"brands_detected": ["BMW"],</p>
<p>"services_detected": ["AC Repair", "Diagnostics"],</p>
<p>"price_sentiment": "premium",</p>
<p>"trust_signal": "high", // inferred from "honest" — NOT a standalone
honesty field</p>
<p>"speed_signal": "high",</p>
<p>"quality_signal": "high",</p>
<p>"customer_segment": "luxury",</p>
<p>"positive_signals": ["transparent", "quick", "reliable"],</p>
<p>"negative_signals": ["expensive"],</p>
<p>"confidence_score": 0.91</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

\#how does score work? Does it infer from “excellent” in review? What is
the logic behind only 0.91? is this a dummy example or a real practical
score?

**5.2 Garage Intelligence Aggregation**

Aggregates all extracted review signals for a garage into a single
intelligence profile. Runs per-garage after extraction completes.
Evidence thresholds are enforced before writing any tag or score (see
Section 8).

**Output — garage-level profile:**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>{</p>
<p>"best_for": ["BMW AC", "German Diagnostics"],</p>
<p>"avoid_for": ["Budget Repairs"],</p>
<p>"service_specialisations": ["AC Repair", "Diagnostics"],</p>
<p>"brand_specialisations": ["BMW", "Porsche"],</p>
<p>"trust_score": 0.84,</p>
<p>"speed_score": 0.71,</p>
<p>"price_score": 0.32, // low = expensive</p>
<p>"luxury_score": 0.88,</p>
<p>"budget_score": 0.18,</p>
<p>"review_confidence_score": 0.79,</p>
<p>"confidence_score": 0.86</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**5.3 Query Resolution**

Converts natural language user input into structured search intent. Runs
LIVE on every user search via Claude Haiku. (or groq)

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Input</p>
<p>"Need cheap Honda tyre replacement in Sharjah"</p>
<p>// Output</p>
<p>{</p>
<p>"service_type": "Tyres",</p>
<p>"vehicle_brand": "Honda",</p>
<p>"vehicle_model": null,</p>
<p>"location_text": "Sharjah", // raw string — search module resolves to
garage text match</p>
<p>"price_band": "budget",</p>
<p>"budget_max_aed": null,</p>
<p>"urgency": null</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

*Note: location_text is a raw extracted string. The Search module
resolves it via ILIKE match on garage_locations.emirate / city / area.
No geocoding API is called.*

**5.4 Review Summarisation**

Generates short factual summaries per garage for display in the UI. Runs
post-aggregation.

| **Rule** | **Detail** |
|----|----|
| Length | 1–2 sentences maximum |
| Tone | Factual, non-promotional, evidence-backed |
| Forbidden | Marketing language, unsupported claims, rating inflation |
| Example (good) | "Well-rated for BMW diagnostics and AC repair. Premium pricing." |
| Example (bad) | "The best garage in Dubai for all your luxury car needs!" |

**5.5 Confidence Scoring**

Every AI output must carry a confidence_score (0.0–1.0). No output is
valid without it.

> • Extraction confidence — how reliably was the signal extracted from
> the review text
>
> • Aggregation confidence — how much evidence supports the garage-level
> tag or score
>
> • Outputs below 0.5 confidence are suppressed — not stored or
> displayed

**6. Extraction Schema**

Every review extraction must conform to this Pydantic schema. Fields not
evidenced are omitted (not null-filled).

| **Field** | **Type** | **Notes** |
|----|----|----|
| brands_detected | list\[str\] | From controlled brand ontology only (Section 7.2) |
| services_detected | list\[str\] | From controlled service ontology only (Section 7.1) |
| price_sentiment | str | budget \| mid_range \| premium \| null <span class="mark">\#add mixed field if reviews vary</span> |
| trust_signal | str | Aggregate trust inference — low \| medium \| high \| null. NOT honesty-only. <span class="mark">\#add mixed field if reviews vary</span> |
| speed_signal | str | low \| medium \| high \| null <span class="mark">\#add mixed field if reviews vary</span> |
| quality_signal | str | low \| medium \| high \| null <span class="mark">\#add mixed field if reviews vary</span> |
| customer_segment | str | budget \| general \| premium \| luxury \| fleet \| null |
| positive_signals | list\[str\] | Free-form list from controlled positive signal vocab |
| negative_signals | list\[str\] | Free-form list from controlled negative signal vocab |
| confidence_score | float | 0.0–1.0. Required. Suppressed if \< 0.5 |

| *trust_signal is an aggregate inference. It combines transparency mentions, reliability signals, complaint density, and repeat-visit sentiment. It does NOT map to a standalone 'honesty' concept. The word 'honesty' should not appear in any prompt, tag, or UI label.* |
|----|

**7. Controlled Ontology**

AI may only emit values from these approved lists. Any value outside
these lists is rejected by the Pydantic validator and treated as a
hallucination.

**7.1 Services**

| **Service**     |
|-----------------|
| AC Repair       |
| Diagnostics     |
| Tyres           |
| Transmission    |
| Suspension      |
| Electrical      |
| Oil Change      |
| Engine Repair   |
| Body Work       |
| Paint           |
| Battery         |
| Brake Service   |
| General Service |

<span class="mark">\#more services need to be added?</span>

**7.2 Vehicle Brands**

| **Brand**  |
|------------|
| Toyota     |
| Honda      |
| Nissan     |
| Lexus      |
| BMW        |
| Mercedes   |
| Audi       |
| Porsche    |
| Land Rover |
| Jeep       |
| Ford       |
| Chevrolet  |
| Mitsubishi |

<span class="mark">\#more brands needed, refer dubizzle</span>

**7.3 Price Bands**

> • budget
>
> • mid_range
>
> • premium

<span class="mark">\#add mixed field if reviews vary</span>

**7.4 Trust Signals (aggregate)**

> • low — repeated complaints, overcharging language, broken promises
>
> • medium — mixed signals, some reliability concerns, some positive
>
> • high — consistent transparency, reliable, repeat-visit language

<span class="mark">\#add mixed field if reviews vary</span>

**7.5 Speed Signals**

> • low — slow, waiting, long turnaround mentioned
>
> • medium — no strong signal
>
> • high — quick, fast, same day, prompt mentioned

<span class="mark">\#add mixed field if reviews vary</span>

**7.6 Customer Segments**

> • budget — cheap, affordable, value, cost-conscious language
>
> • general — mixed, standard services
>
> • premium — quality-focused, careful, worth the price
>
> • luxury — premium brands, specialist attention, high-end
>
> • fleet — company cars, multiple vehicles, commercial

**8. Evidence Thresholds and Cold-Start Handling**

The enrichment pipeline checks review count before writing any
intelligence. This prevents low-evidence garages from generating
misleading tags.

| **Review Count** | **Pipeline Behaviour** | **Profile Completeness** | **UI Badge** |
|----|----|----|----|
| 0–4 | Pipeline skips enrichment entirely | new | "New listing" badge |
| 4–9 | Extraction runs; only high-confidence (≥0.85) signals written | limited | "Limited data" badge |
| 10–15 | Full extraction and aggregation run at standard thresholds | partial | Confidence indicator shown |
| 16+ | Full pipeline runs; no restrictions | full | No badge — full profile |

**8.1 Minimum Evidence Per Signal Type**

| **Signal**                 | **Minimum Evidence Required**                |
|----------------------------|----------------------------------------------|
| service_specialisation tag | 4+ reviews mentioning the service            |
| brand_specialisation tag   | 4+ reviews mentioning the brand              |
| trust_score                | 5+ reviews containing trust-bearing language |
| price_score                | 4+ reviews containing price sentiment        |
| best_for tag               | 3+ reviews supporting the tag                |
| avoid_for tag              | 3+ reviews with negative signal for the tag  |

**8.2 Fallback for Data-Sparse Garages**

For garages with 0–4 reviews, name and business category inference
provides basic tags:

> • Garage named 'Al Quoz BMW Specialist' → BMW brand tag + Al Quoz
> location tag
>
> • Google business category 'Tyre Shop' → Tyres service tag
>
> • All inferred-only tags carry source_type='inferred' and are visually
> distinguished in the UI

<span class="mark">What about name and business category that does not
provide high confidence inference.</span>

**9. Hallucination Prevention Rules**

| **Rule** |
|----|
| Never invent a service tag not evidenced in review text |
| Never invent a brand specialisation without review evidence |
| Never infer pricing without explicit pricing sentiment in the review |
| Never fabricate 'best for' or 'avoid for' tags |
| Never emit a value outside the controlled ontology (Section 7) |
| Never string together adjacent review phrases as if they were one review |
| If evidence is ambiguous or sparse: omit the field, reduce confidence, or mark unknown |
| No speculative outputs. Every tag must be traceable to review evidence. |

**10. Prompting Strategy**

| **Rule** | **Detail** |
|----|----|
| Schema-bound output | Every prompt specifies a strict JSON output schema. Model is instructed to return ONLY valid JSON. |
| Deterministic temperature | All extraction prompts use temperature=0. No creativity. |
| Ontology injection | Controlled vocabulary lists are injected directly into the prompt. |
| Negative examples | Prompts include explicit 'do not do' examples for known failure modes. |
| Versioning | Every prompt has a version identifier stored in model_version column. |
| No inline prompts | Prompts are stored in /worker/src/prompts/ as versioned .txt or .py files. Never hardcoded in business logic. |
| Groq vs Claude prompt parity | The same logical prompt is maintained for both providers. Groq version may include stricter schema reminders due to lower JSON reliability. |

<span class="mark">\#add prompt validation to avoid prompt
injection</span>

**11. Scoring Logic**

AI outputs raw signals. The pipeline aggregates them into scores. Scores
are stored in garage_scores and used by the ranking engine.

| **Score** | **Range** | **Derivation** |
|----|----|----|
| trust_score | 0.0–1.0 | Aggregate of trust_signal='high' frequency, complaint density (negative), repeat-visit language frequency |
| speed_score | 0.0–1.0 | Frequency of speed_signal='high' mentions vs 'low' mentions |
| price_score | 0.0–1.0 | 0.0 = very expensive, 1.0 = very cheap. Derived from price_sentiment distribution |
| luxury_score | 0.0–1.0 | Frequency of luxury/premium customer segment signals |
| budget_score | 0.0–1.0 | Frequency of budget customer segment signals |
| review_confidence_score | 0.0–1.0 | Volume × evidence density × signal consistency |

*AI does not compute the final search ranking score. That is the ranking
engine's responsibility.*

**12. Fallback Rules**

| **Failure scenario** | **Action** |
|----|----|
| Groq returns invalid JSON | Retry with repair prompt. After 3 failures → fall back to Claude Haiku. Log fallback event. |
| Groq rate limit hit | Queue job for retry after 60s. No user impact (async). |
| Claude Haiku unavailable (live) | Return structured regex fallback parser result. Log degraded_mode=true. |
| Extraction confidence \< 0.5 | Suppress the specific field. Do not write to DB. |
| Aggregation below evidence threshold | Skip tag/score write. Leave existing data unchanged. |
| Pipeline crash | Preserve raw review data. Mark garage for re-enrichment. Do not block garage listing. |

**13. Human Override Rules**

Admin overrides supersede all AI outputs and are stored in
admin_overrides table.

> • All AI outputs are versioned (model_version column) and auditable
>
> • Admin can override any tag, score, or metadata field
>
> • Override reason must be recorded
>
> • Overridden values survive re-enrichment (override_value takes
> precedence over new AI output)
>
> • Admin can manually trigger re-enrichment via POST
> /admin/garages/:id/enrich

**14. Observability**

Every LLM call must emit structured logs. Every enrichment job must
update pipeline metrics.

| **Metric** | **Alert threshold** |
|----|----|
| Groq extraction JSON failure rate | \> 10% in any 1-hour window |
| Groq → Claude fallback rate | \> 20% in any 1-hour window |
| Hallucination rejection rate (ontology) | \> 5% — review prompt quality |
| Low-confidence suppression rate | \> 30% — signal for prompt tuning |
| Admin override rate | \> 15% on new enrichments — signal for AI quality issues |
| Query resolution latency (Claude) | p95 \> 2s — alert on Claude API degradation |

**15. Success Criteria**

AI succeeds when it reliably converts messy review text into structured,
evidence-backed garage intelligence with precision high enough to
improve search and decision quality — at near-zero marginal cost using
the hybrid Groq + Claude approach.

*GarageIQ UAE — AI Intelligence Specification v1.1 — Internal
Engineering Reference*
