<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p><strong>GarageIQ UAE</strong></p>
<p>Product Requirements Document</p>
<p><em>v1.1 — Customer-Facing Product — UAE Market</em></p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><em>This document covers the customer-facing product only. There is
no garage-side portal or self-serve console. Admin operations
(moderation, featured listings, overrides) are handled internally by the
GarageIQ team. Monetization features are post-MVP scope.</em></td>
</tr>
</tbody>
</table>

**1. Product Overview**

GarageIQ UAE is a mobile-first platform that helps car owners in the UAE
discover the right garage for their exact vehicle and repair issue.

Unlike generic listing platforms or maps, GarageIQ does not simply show
nearby garages. It structures fragmented and unstructured garage data —
ratings, reviews, services, brand mentions, customer sentiment, pricing
signals, and repair specialties — into actionable garage intelligence.

The platform allows users to:

- Find garages based on exact repair needs

- Search using natural language

- Discover garages by car make/model and service specialisation

- View AI-generated garage profiles

- Compare garages based on trust, specialisation, pricing, and customer
  fit

- Contact garages directly via call or WhatsApp

- Leave reviews and ratings after service

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><strong>Core value question:</strong> Which garage is actually best
for my exact car problem?</td>
</tr>
</tbody>
</table>

**2. Problem Statement**

The UAE automotive repair market is large, fragmented, and difficult to
navigate. Car owners currently rely on Google Maps, WhatsApp referrals,
Dubizzle forums, word of mouth, and trial and error. These methods are
inefficient because they do not provide structured decision-making
signals.

**2.1 Poor Garage Discovery**

Users can find garages, but cannot reliably find the right garage for
their specific issue. A search for 'garage near me' returns a generic
list with no signal on specialisation.

**2.2 Hidden Specialisation**

Most garages specialise in specific vehicle brands, service categories,
customer segments, and price bands — but these specialisations are
buried inside unstructured review text and not surfaced clearly
anywhere.

**2.3 Low Trust and High Risk**

A 4.7-star rating does not answer the questions users actually have:

- Are they expensive?

- Are they good with luxury cars?

- Are they good for quick repairs?

- Do they overcharge on diagnostics?

- Are they reliable for budget repairs?

*Note: 'Honesty' is not treated as a standalone measurable signal. Trust
indicators are inferred from aggregate review sentiment and folded into
the overall trust score.*

**2.4 No Structured Garage Intelligence**

Google and similar platforms provide raw data, not structured
intelligence. Users need best-for tags, price indicators, trust
indicators, specialisation tags, and brand fit signals. None of this
currently exists in a structured, decision-ready form.

**3. Product Vision**

GarageIQ becomes the trust and intelligence layer for automotive repair
in the UAE — the default platform car owners use to answer:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><strong>Vision:</strong> Where should I take my car for this exact
problem?</td>
</tr>
</tbody>
</table>

GarageIQ transforms fragmented garage discovery into structured,
intelligent, high-trust decision-making.

**4. Product Goals**

**Primary Goals**

- Help users find the right garage for their exact issue

- Reduce trust friction in garage selection

- Convert unstructured reviews into structured garage intelligence

- Improve decision quality for car repair

- Build the most trusted garage discovery platform in UAE

**Secondary Goals**

- Increase user retention through saved vehicles and repeat discovery

- Generate qualified leads for garages (tracked internally)

- Build monetisable garage intelligence infrastructure for post-MVP
  phases

**5. Target Users**

GarageIQ is a customer-facing product only. There are no garage-owner
accounts, garage-side dashboards, or self-serve portals in this version.

**Primary User Segment — Everyday UAE Car Owners**

Car owners looking for trustworthy, relevant garages. Includes:

- Expat car owners unfamiliar with the local garage landscape

- First-time car owners

- Busy professionals who want fast, confident decisions

- Family vehicle managers handling recurring maintenance

- Budget-conscious users who want honest pricing signals

- Premium/luxury car owners who need brand specialists

**Secondary User Segment — Enthusiast / Informed Car Owners**

Users who care about:

- Niche brand specialists

- Exact issue matching

- Trust and quality over price

**6. User Personas**

**Persona 1: Practical Daily Driver**

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<tbody>
<tr>
<td><strong>Attribute</strong></td>
<td><strong>Detail</strong></td>
</tr>
<tr>
<td>Owns</td>
<td>Honda / Toyota / Nissan</td>
</tr>
<tr>
<td>Needs</td>
<td>Reliable and affordable maintenance</td>
</tr>
<tr>
<td>Priorities</td>
<td>Trust, price, convenience</td>
</tr>
<tr>
<td>Pain Point</td>
<td>Overcharging, poor transparency</td>
</tr>
</tbody>
</table>

**Persona 2: Premium Car Owner**

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<tbody>
<tr>
<td><strong>Attribute</strong></td>
<td><strong>Detail</strong></td>
</tr>
<tr>
<td>Owns</td>
<td>BMW / Mercedes / Audi / Porsche</td>
</tr>
<tr>
<td>Needs</td>
<td>Specialist garage with brand expertise</td>
</tr>
<tr>
<td>Priorities</td>
<td>Brand expertise, diagnostics, quality</td>
</tr>
<tr>
<td>Pain Point</td>
<td>Wrong garage causes damage or misdiagnosis</td>
</tr>
</tbody>
</table>

**Persona 3: Family Vehicle Manager**

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<tbody>
<tr>
<td><strong>Attribute</strong></td>
<td><strong>Detail</strong></td>
</tr>
<tr>
<td>Owns</td>
<td>1–2 family vehicles</td>
</tr>
<tr>
<td>Needs</td>
<td>Trusted recurring maintenance</td>
</tr>
<tr>
<td>Priorities</td>
<td>Reliability, convenience, repeat service</td>
</tr>
<tr>
<td>Pain Point</td>
<td>No trusted long-term garage relationship</td>
</tr>
</tbody>
</table>

**Persona 4: Car Enthusiast**

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<tbody>
<tr>
<td><strong>Attribute</strong></td>
<td><strong>Detail</strong></td>
</tr>
<tr>
<td>Owns</td>
<td>Niche or enthusiast vehicle</td>
</tr>
<tr>
<td>Needs</td>
<td>Exact specialist with proven reputation</td>
</tr>
<tr>
<td>Priorities</td>
<td>Trusted expert, community reputation</td>
</tr>
<tr>
<td>Pain Point</td>
<td>Generic garages lack specialist knowledge</td>
</tr>
</tbody>
</table>

**7. Core User Jobs To Be Done**

Users use GarageIQ to:

- Find the best garage for a specific repair issue

- Reduce the risk of choosing the wrong garage

- Identify trustworthy mechanics

- Find specialists by car brand and service type

- Compare garages intelligently before committing

- Save time in repair discovery

- Avoid expensive trial and error

**8. Core Value Proposition**

GarageIQ helps UAE car owners find the right garage, not just a nearby
garage.

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<tbody>
<tr>
<td><strong>Raw Input</strong></td>
<td><strong>GarageIQ Output</strong></td>
</tr>
<tr>
<td>Raw star ratings</td>
<td>Trust signals</td>
</tr>
<tr>
<td>Unstructured review text</td>
<td>Structured garage intelligence</td>
</tr>
<tr>
<td>Generic garage listings</td>
<td>Decision-ready recommendations</td>
</tr>
</tbody>
</table>

**9. MVP Scope**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><em>Admin operations (moderation, tag overrides, featured listings,
verification) are handled internally by the GarageIQ team via a private
admin console. These are not customer-facing features and are not part
of the user product.</em></td>
</tr>
</tbody>
</table>

**9.1 User Features**

- User signup and login

- Add and manage vehicles (make, model, year)

- Search garages by natural language query

- Search garages by service type, make/model, or location

- View ranked garage search results

- View garage detail page with AI-generated profile

- View AI-generated garage tags:

<!-- -->

- Best for (services and brands)

- Price band (budget / mid-range / premium)

- Trust score

- Speed score

- Brand specialisation chips

- Service specialisation chips

<!-- -->

- Call garage directly from the app

- WhatsApp garage directly from the app

- Save garages to favourites

- Leave a review and rating

**9.2 Garage Intelligence Features (Backend)**

- Garage listing ingestion via Google Places API and bulk review data
  source

- Review ingestion and normalisation pipeline

- AI review analysis and signal extraction

- Structured garage profile generation

- Tag and specialisation extraction

- Garage scoring (trust, speed, price, brand fit)

- Search and ranking engine

- Cold-start handling (see Section 14.2)

**10. Out of Scope (MVP)**

The following are explicitly excluded from MVP:

- Garage booking engine

- In-app payments

- Garage job tracking

- Repair status tracking

- Pickup and drop logistics

- Quote comparison engine

- Insurance integrations

- Roadside assistance

- Mechanic dispatch

- AI voice assistant

- Garage-side portal or self-serve console

- Monetisation features (deferred to post-MVP)

*These may be added in later phases but are not MVP requirements.*

**11. Key Features**

**11.1 Natural Language Search**

Users can search using plain English. Examples:

- "Best BMW AC repair in Al Quoz"

- "Cheap tyre replacement for Honda Accord in Sharjah"

- "Honest Porsche garage Dubai"

The system converts user intent into structured search parameters and
returns ranked garage results.

**11.2 AI Garage Profiles**

Every garage with sufficient review evidence receives an AI-generated
intelligence profile:

- Best for (service + brand tags)

- Avoid for (where applicable, with evidence threshold)

- Price band

- Trust score (aggregated from sentiment signals)

- Speed score

- Service strengths

- Vehicle brand strengths

**11.3 Smart Garage Ranking**

Results are ranked by a composite relevance score weighted by:

- Issue / service relevance

- Vehicle brand relevance

- Review confidence (evidence density)

- Trust score

- Geographic proximity

- Price fit to user intent

**11.4 Saved Vehicles**

Users save their cars on signup or onboarding. Saved vehicles improve
search personalisation and recommendation relevance.

**11.5 Garage Trust Layer**

GarageIQ helps users understand garage reliability through structured
signals rather than raw star ratings:

- Trust score (aggregated from transparency, reliability, and
  repeat-visit sentiment)

- Price band (budget / mid-range / premium, inferred from review
  language)

- Speed score (turnaround time signals from review text)

*Honesty is not exposed as a standalone metric. It is one of several
signals contributing to the overall trust score.*

**12. Data Sourcing Strategy**

**12.1 Primary Source**

Google Places API is used for ongoing garage data — location, hours,
contact, category, ratings, and review freshness signals.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><em>Limitation: Google Places API returns a maximum of ~5 reviews
per garage. This is insufficient for AI intelligence generation on its
own.</em></td>
</tr>
</tbody>
</table>

**12.2 Bulk Review Seeding**

For initial database population, a managed scraping service (Outscraper
or Apify) is used to perform a one-time bulk pull of all available
reviews per garage. This provides 50–200+ reviews per garage at seed
time, giving the AI pipeline sufficient signal density to generate
meaningful tags.

Ongoing review freshness is then maintained via Places API. New
user-submitted reviews supplement data over time.

**12.3 Name and Category Inference**

For garages with sparse review data, basic service tags are inferred
from the garage's Google business category and name. For example, a
garage named 'Al Quoz Auto AC Repair' yields a strong AC tag even before
review-based extraction runs.

**13. Monetisation**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><em>Monetisation is deferred to post-MVP. No monetisation features
will be built or exposed to users in the MVP product. When introduced,
all monetisation operations will be managed internally by the GarageIQ
team via the admin console — there is no self-serve mechanism for
garages.</em></td>
</tr>
</tbody>
</table>

**Post-MVP Monetisation Phases**

**Phase 1**

- Sponsored garage placement (managed manually by GarageIQ team)

- Featured garage listings (admin-controlled)

- Paid verified badge

**Phase 2**

- Lead generation fees (call / WhatsApp / inquiry attribution)

- Premium garage profile enhancements

**Phase 3**

- Garage analytics and competitive benchmarking (B2B)

- Lead dashboards

- Review intelligence insights

**14. Risks and Mitigations**

<table style="width:100%;">
<colgroup>
<col style="width: 29%" />
<col style="width: 35%" />
<col style="width: 35%" />
</colgroup>
<tbody>
<tr>
<td><strong>Risk</strong></td>
<td><strong>Impact</strong></td>
<td><strong>Mitigation</strong></td>
</tr>
<tr>
<td>Google Places API review limit (~5/garage)</td>
<td>High</td>
<td>Bulk seed via Outscraper/Apify; supplement with user reviews over
time</td>
</tr>
<tr>
<td>Review sparsity for niche garages</td>
<td>Medium</td>
<td>Name/category inference as fallback; Limited Data badge for thin
profiles</td>
</tr>
<tr>
<td>AI misclassification of garage specialisation</td>
<td>Medium</td>
<td>Evidence thresholds; admin override system; confidence scoring</td>
</tr>
<tr>
<td>Weak early ranking quality</td>
<td>Medium</td>
<td>Rules-based ranking for MVP; tuned by real search log data
post-launch</td>
</tr>
<tr>
<td>Low initial trust in AI-generated tags</td>
<td>Medium</td>
<td>Show evidence count; badge distinguishing AI tag vs user-confirmed
tag</td>
</tr>
<tr>
<td>Over-reliance on third-party review sources</td>
<td>Low-Medium</td>
<td>Build first-party review volume from day one</td>
</tr>
</tbody>
</table>

**14.1 Cold Start Problem**

Many garages will have limited reviews at launch. GarageIQ handles this
with a tiered profile system:

<table style="width:100%;">
<colgroup>
<col style="width: 29%" />
<col style="width: 35%" />
<col style="width: 35%" />
</colgroup>
<tbody>
<tr>
<td><strong>Evidence Level</strong></td>
<td><strong>Profile Behaviour</strong></td>
<td><strong>UI Treatment</strong></td>
</tr>
<tr>
<td>0–2 reviews</td>
<td>No AI tags generated</td>
<td>"New listing" badge, basic info only</td>
</tr>
<tr>
<td>3–4 reviews</td>
<td>Partial tags only (high confidence signals)</td>
<td>"Limited data" badge shown</td>
</tr>
<tr>
<td>5–14 reviews</td>
<td>Standard tag generation with lower confidence</td>
<td>Tags shown, confidence visible</td>
</tr>
<tr>
<td>15+ reviews</td>
<td>Full intelligence profile generated</td>
<td>Complete profile, no badge</td>
</tr>
</tbody>
</table>

**14.2 Review Sparsity Mitigation**

In addition to the tiered system above:

- Name and category inference fills basic tags for data-sparse garages

- User-submitted reviews feed the AI pipeline on an ongoing basis

- Admin team can manually assign tags to garages with no review history

**15. Assumptions**

- Users care more about trust and fit than raw proximity

- Review text contains sufficient signal to infer specialisation at
  scale

- UAE garages are fragmented enough that structured discovery adds
  significant value

- Users will trust structured review intelligence when it is clearly
  evidence-based

- Sufficient garages in UAE have 15+ Google reviews to build a useful
  initial dataset

- Garages will eventually pay for qualified lead visibility (post-MVP)

**16. Success Metrics**

**User Metrics**

- Search-to-garage-click rate

- Search-to-lead rate (call or WhatsApp tap)

- Repeat search rate

- Saved vehicle completion rate on onboarding

- Review submission rate

**Intelligence Metrics**

- Tag accuracy (admin-validated sample)

- Query resolution accuracy

- Ranking relevance score

- Review extraction confidence average

- Percentage of garages with full vs partial vs empty profiles

**17. Product Success Criteria**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr>
<td><strong>Success definition:</strong> GarageIQ succeeds when users
consistently feel: “This helped me find the right garage faster and with
less risk than Google.”</td>
</tr>
</tbody>
</table>

*GarageIQ UAE — PRD v1.1 — Customer-Facing Product*
