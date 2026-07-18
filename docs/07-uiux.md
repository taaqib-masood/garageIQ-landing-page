<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><p><strong>GarageIQ UAE</strong></p>
<p>UI / UX Specification</p>
<p><em>v1.1 — Customer-Facing Product</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| *v1.1 changes: Admin screens removed (internal tool — separate scope). PWA-specific UX rules added. Cold-start badge states added to garage card and detail screen. Trust chip labels updated (no 'honesty' label). Profile completeness states documented.* |
|----|

**1. Purpose**

This document defines the user interface and interaction behaviour for
the GarageIQ UAE customer-facing PWA. It is the source of truth for
frontend implementation and UX consistency.

**2. UX Principles**

| **Principle** | **Implication** |
|----|----|
| Decision-first UX | Every screen must help users make a better garage decision, not just display information. |
| Trust-first UI | Trust signals must be visual and immediate — chips, badges, score strips. Never buried in text. |
| Fast comprehension | Users must understand a garage's fit for their issue in under 5 seconds. |
| Mobile-first always | Primary UX is optimised for mobile. Thumb-friendly tap targets, sticky bottom CTAs. |
| Search is the primary interaction | Discovery begins with intent. Navigation menus are secondary. |
| AI feels invisible | Users experience clarity and structure — not 'AI features'. No model names in UI. |
| PWA-native behaviour | App installs to home screen, caches last search results, handles offline gracefully. |

**3. Primary User Flows**

| **Flow** | **Entry point** | **Exit point** |
|----|----|----|
| Signup / onboarding | Splash screen | Home / Search with vehicle saved |
| Search and discover | Home screen search bar | Garage detail page |
| Lead action | Garage card or detail | Phone call or WhatsApp initiated |
| Save garage | Garage card or detail CTA | Favourites list updated |
| Leave review | Garage detail → Write Review | Review submitted (pending moderation) |
| Manage vehicles | Profile → My Vehicles | Vehicle added / edited / deleted |

**4. Screen Inventory**

| *Admin screens (Review Moderation, Garage Edit, Tag Override) are internal-only and are NOT part of this spec. They are operated by the GarageIQ team via a separate internal console.* |
|----|

| **Screen**       | **Purpose**                                          |
|------------------|------------------------------------------------------|
| Splash / Landing | Value proposition + search or login CTA              |
| Auth             | Email OTP signup/login + Google OAuth + phone number |
| Onboarding       | Add first vehicle + personalise search               |
| Home / Search    | Primary search entry point                           |
| Search Results   | Ranked garage cards with filters                     |
| Garage Detail    | Full garage intelligence profile + lead actions      |
| Saved Garages    | User's favourited garages                            |
| My Vehicles      | Manage saved vehicles                                |
| Write Review     | Capture user review and rating                       |
| Profile          | Account settings, vehicles, reviews, logout          |

**5. Screen Specifications**

**5.1 Splash / Landing**

Purpose: Introduce value proposition and direct user to search.

| **Element** | **Detail** |
|----|----|
| Headline | "Find the right garage, not just a nearby one" |
| Subheadline | Short trust-building copy. e.g. 'AI-powered garage discovery for UAE car owners' |
| Primary CTA | "Start Searching" → Home / Search screen |
| Secondary CTA | "Log In" → Auth screen |
| PWA install prompt | Shown after 3rd visit if not already installed |

**5.2 Auth Screen**

Purpose: User signup / login.

| **Element**         | **States**                                 |
|---------------------|--------------------------------------------|
| Email input         | Default / focus / error                    |
| Google login button | Idle / loading                             |
| OTP input (6-digit) | Shown after email submit                   |
| Continue CTA        | Idle / loading / success                   |
| Screen states       | default → OTP sent → OTP invalid → success |

**5.3 Onboarding**

Purpose: Collect first vehicle to personalise search. Skippable — user
can complete later.

<table style="width:100%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 27%" />
<col style="width: 60%" />
</colgroup>
<thead>
<tr>
<th><strong>Step</strong></th>
<th><strong>Input</strong></th>
<th><strong>UX rule</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>Car make</td>
<td>Autocomplete from controlled brand list</td>
</tr>
<tr>
<td><p>2</p>
<p>(optional)</p></td>
<td>Car model</td>
<td>Autocomplete filtered by make</td>
</tr>
<tr>
<td><p>3</p>
<p>(optional)</p></td>
<td>Car year</td>
<td>Numeric picker 1980–current</td>
</tr>
<tr>
<td>4 (optional)</td>
<td>Mileage</td>
<td>Numeric input, optional, skip available</td>
</tr>
</tbody>
</table>

> • Progress indicator shown throughout (Step 1 of 4)
>
> • Skip button available on step 2 onwards
>
> • On complete: navigate to Home / Search with vehicle pre-selected

**5.4 Home / Search Screen**

Purpose: Primary search entry point.

| **Section** | **Content** | **Behaviour** |
|----|----|----|
| Search bar | Full-width, prominent, sticky on scroll | Executes on submit / enter. Suggestions on focus after 2 chars. |
| Vehicle selector | Pill showing saved vehicle (e.g. 'Honda Accord 2015') | Tap to switch vehicle or add new. Used to personalise suggestions. |
| Suggested queries | 3 contextual suggestions based on saved vehicle | Tap → pre-fills search bar and executes |
| Popular service chips | AC Repair / Tyres / Battery / Diagnostics / Oil Change | Tap → executes search with service filter |
| Recent searches | Last 3 searches | Tap → re-executes search |

**Search bar placeholders (rotating):**

> • "Need BMW AC repair in Al Quoz?"
>
> • "Cheap tyre replacement in Sharjah?"
>
> • "Honda service near me?"

**5.5 Search Results Screen**

Purpose: Display ranked garage results for user intent.

| **Element** | **Detail** |
|----|----|
| Search bar (sticky) | Pre-filled with current query. Editable. |
| Filter row (sticky) | Horizontal scrolling pills: Area / Service / Brand / Price / Rating. Tap opens bottom sheet. |
| Results list | Garage cards in ranked order. Infinite scroll or paginated. |
| Result count | e.g. '47 garages in Sharjah for Honda tyres' |
| Location context label | Shows resolved location: 'Showing garages in Sharjah' or 'Showing garages near you' |

**5.5.1 Garage Card Structure**

| **Element** | **Source** | **Notes** |
|----|----|----|
| Garage name | garages.name | Bold, prominent |
| Area | garage_locations.area + emirate | Subtitle |
| Rating + review count | Aggregated | e.g. '4.6 (214 reviews)' |
| Profile badge | profile_completeness | "New listing" or "Limited data" badge if applicable — see 5.5.2 |
| AI summary line | ai_summary | 1 sentence. Only shown if profile_completeness ≥ partial |
| Top tag chips | garage_tags | Max 3. Best For tags in primary colour. Avoid For in muted. |
| Price chip | garage_scores.price_score | Budget / Mid / Premium |
| Trust chip | garage_scores.trust_score | "Trusted" if score ≥ 0.75. No "Honest" label. |
| Distance | Computed | Only shown for near-me searches. Hidden for named-location searches. |
| CTA row | — | Call / WhatsApp / Save — icon buttons |

**5.5.2 Cold-Start Badge States**

| *Garages with insufficient review data must communicate this clearly. Never show AI-generated tags for garages with profile_completeness = 'new'.* |
|----|

| **profile_completeness** | **Badge shown** | **Tags shown** | **AI summary shown** |
|----|----|----|----|
| new | "New listing" (grey badge) | None — only name, location, and contact | No |
| limited | "Limited data" (amber badge) | Only high-confidence tags (≥ 0.85) | No |
| partial | None | Standard tags with confidence indicator | Yes, short |
| full | None | All tags | Yes, full |

**5.6 Garage Detail Screen**

Purpose: Help the user decide whether this garage is the right fit for
their issue.

**5.6.1 Header**

> • Garage name (large, bold)
>
> • Area + emirate
>
> • Rating (star display) + review count
>
> • Profile badge if applicable (New listing / Limited data)
>
> • CTA row: Call / WhatsApp / Save

**5.6.2 Trust Snapshot**

Visual score strip. Must be instantly scannable.

| **Score**            | **Label**       | **Chip colour** |
|----------------------|-----------------|-----------------|
| trust_score ≥ 0.75   | Trusted         | Green           |
| trust_score 0.5–0.74 | Reliable        | Amber           |
| trust_score \< 0.5   | Mixed reviews   | Grey            |
| price_score ≥ 0.7    | Budget-friendly | Green           |
| price_score 0.4–0.69 | Mid-range       | Blue            |
| price_score \< 0.4   | Premium pricing | Purple          |
| speed_score ≥ 0.7    | Fast turnaround | Green           |

| *'Honest' and 'Honesty' must not appear as chip labels anywhere in the UI. Trust is expressed through 'Trusted', 'Reliable', or 'Mixed reviews' only.* |
|----|

**5.6.3 Best For**

Prominent chips showing service and brand specialisations. e.g. BMW AC /
Porsche Diagnostics / German Electrical. Only shown when
profile_completeness ≥ partial.

**5.6.4 Avoid For**

Optional warning chips. Only shown when evidence confidence ≥ 0.78. Must
be subtle (muted colour), factual, and non-alarmist. e.g. 'Budget
Repairs' / 'Fast Walk-ins'.

**5.6.5 Services and Brand Chips**

Structured chips from garage_services and garage_brand_specializations.
Shown in confidence order. Hidden below 0.6 confidence.

**5.6.6 Reviews**

> • AI summary paragraph (only for profile_completeness ≥ partial)
>
> • Top 3 reviews — highest-rated user reviews first
>
> • Recent reviews — latest 3
>
> • Load more → paginated list
>
> • Write Review CTA

**5.6.7 Contact Actions (Sticky Bottom Bar)**

Always visible at bottom of screen. Three buttons:

> • Call Garage → initiates phone call via tel: link
>
> • WhatsApp → opens WhatsApp via wa.me link. Fires POST /leads with
> lead_type='whatsapp'
>
> • Save → toggles favourite. Optimistic UI.

**5.7 Saved Garages Screen**

> • Garage card list (same card structure as search results)
>
> • Empty state: 'No saved garages yet' + CTA to search
>
> • Quick compare: select 2 garages → side-by-side score comparison
> (post-MVP)

**5.8 My Vehicles Screen**

> • Vehicle cards: make + model + year + mileage (if provided)
>
> • Add vehicle CTA
>
> • Edit / delete on each card
>
> • Empty state: 'Add your car to get personalised recommendations'

**5.9 Write Review Screen**

| **Field** | **Required** | **Notes** |
|----|----|----|
| Rating (1–5 stars) | Yes | Tap to set star rating |
| Review text | No | Free text, max 1000 chars |
| Service type | No | Picker from controlled ontology |
| Vehicle make / model | No | Pre-filled from saved vehicles if available |
| Submit | — | Disabled until rating is set |

> • On submit: optimistic UI — show review immediately with 'Pending
> approval' label
>
> • On reject (by admin): notify user with reason

**5.10 Profile Screen**

> • User info: name, email, profile image
>
> • Quick links: My Vehicles / Saved Garages / My Reviews
>
> • Logout
>
> • App version label (useful for PWA update debugging)

**6. PWA-Specific UX Rules**

| *GarageIQ MVP ships as a Progressive Web App (Next.js + next-pwa). These rules ensure the PWA delivers a native-app-like experience without React Native.* |
|----|

| **Rule** | **Detail** |
|----|----|
| Install prompt | Show install-to-home-screen prompt after 3rd visit. Dismissible. Do not show on first visit. |
| Offline state | Cache last search results and last-viewed garage details. Show 'You're offline — showing cached results' banner. |
| Service worker | next-pwa handles caching. Cache strategy: network-first for API, stale-while-revalidate for static assets. |
| Splash screen | Custom splash matches brand colours when PWA launches from home screen icon. |
| iOS overscroll | Disable iOS rubber-band overscroll on non-scrollable screens. |
| Safe area insets | All sticky bottom bars must respect iOS safe area (env(safe-area-inset-bottom)). |
| Back navigation | All screens must support browser/hardware back button — use Next.js router.back() |

**7. Component Library**

| **Component**   | **Used in**                                           |
|-----------------|-------------------------------------------------------|
| SearchBar       | Home, Results (sticky)                                |
| GarageCard      | Results, Saved Garages                                |
| TagChip         | Garage cards, detail                                  |
| ScoreBadge      | Trust Snapshot strip                                  |
| ProfileBadge    | "New listing" / "Limited data" — Cards, Detail header |
| FilterSheet     | Results — bottom sheet on mobile                      |
| ReviewCard      | Garage detail reviews section                         |
| CTAButton       | All lead action buttons                               |
| VehicleCard     | Onboarding, My Vehicles                               |
| EmptyState      | Saved Garages, My Vehicles, zero results              |
| LoadingSkeleton | Cards, detail, reviews                                |
| OfflineBanner   | Shown when network unavailable                        |

**8. Interaction Rules**

| **Interaction** | **Rule** |
|----|----|
| Search execute | On submit (Enter or search icon tap). Not on every keystroke. |
| Autocomplete | Suggestions appear after 2 chars, debounced 300ms |
| Filters | Bottom sheet on mobile. Apply button triggers new search. Clear all resets. |
| Save (favourite) | Optimistic UI — update immediately, roll back on error |
| Review submit | Optimistic UI — show with 'Pending' state. No blocking spinner. |
| Lead action (call/WhatsApp) | Fire POST /leads silently in background. Do not block the action. |
| Infinite scroll / pagination | Prefer infinite scroll on results. Show loading skeleton at bottom. |

**9. State Rules**

Every screen must define behaviour for all four states:

| **State** | **Requirement**                                          |
|-----------|----------------------------------------------------------|
| loading   | Skeleton screens — no spinners for primary content areas |
| empty     | Specific empty state message + next best action CTA      |
| error     | Human-readable message + retry action                    |
| success   | Rendered content                                         |

**10. Empty States**

| **Screen / context** | **Message** | **CTA** |
|----|----|----|
| Search — no results | "No garages found for this search in \[area\]" | Widen area / clear filters |
| Search — cold start (new listing only) | "Only new garages found — limited data available" | View anyway / widen search |
| Saved Garages — empty | "You haven't saved any garages yet" | Start searching |
| My Vehicles — empty | "Add your car for personalised recommendations" | Add vehicle |
| Reviews — none yet | "Be the first to review this garage" | Write review |
| Offline — cached | "You're offline — showing last loaded results" | Retry when connected |

**11. Error States**

| **Context** | **Bad (generic)** | **Good (specific + actionable)** |
|----|----|----|
| Garage list fails | "Something went wrong" | "Couldn't load garages near Sharjah. Try widening your area." |
| Search fails | "Error" | "Search timed out. Check your connection and try again." |
| Review submission fails | "Failed to submit" | "Your review couldn't be submitted. It's saved — tap to retry." |

**12. Mobile Design Rules**

> • Minimum tap target: 44×44pt (Apple HIG standard)
>
> • Sticky bottom CTAs on detail screens — always accessible without
> scrolling
>
> • Chips and tags over long paragraphs — dense text reduces scan speed
>
> • Score strips must be visual (colour-coded), not just text labels
>
> • No horizontal scrolling except for filter pills row
>
> • Font size minimum: 14px for body, 12px for labels

**13. Trust UX Rules**

| *Never use the word 'Honest' or 'Honesty' as a chip label, badge, or score name. Trust is communicated through Trusted / Reliable / Mixed reviews labels only. This is a product-level rule that must not be overridden by AI-generated content.* |
|----|

Trust must always be expressed visually and immediately:

> • Score strip on garage cards — colour-coded Trust / Price / Speed
>
> • Trusted badge (green) on cards when trust_score ≥ 0.75
>
> • AI summary sentence on detail (evidence-backed, 1–2 sentences)
>
> • Review count displayed prominently alongside rating
>
> • Profile completeness badge shown honestly — no hidden sparse
> profiles

**14. Success Criteria**

UX succeeds when users can:

> • Search and get relevant results in under 10 seconds
>
> • Understand whether a garage is the right fit in under 5 seconds on
> the card
>
> • Make a confident decision to call or WhatsApp without leaving the
> app
>
> • Trust the displayed intelligence as evidence-backed, not fabricated

*GarageIQ UAE — UI/UX Specification v1.1 — Customer-Facing Product*
