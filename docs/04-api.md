<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><p><strong>GarageIQ UAE</strong></p>
<p>API Contract Specification</p>
<p><em>v1.1 — Customer-Facing Product — Internal Engineering
Reference</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| *This document covers customer-facing endpoints only. Admin endpoints use a separate auth guard and are operated exclusively by the GarageIQ team. Monetisation endpoints are post-MVP scope. Native mobile app is post-MVP — MVP client is a PWA (Next.js).* |
|----|

**1. Purpose**

This document defines the canonical API contract for GarageIQ UAE. It is
the source of truth for frontend/backend integration.

| **Establishes**                                                   |
|-------------------------------------------------------------------|
| Endpoint contracts — method, path, auth, request/response schemas |
| Validation rules and error contracts                              |
| Pagination standards                                              |
| API ownership boundaries                                          |
| Location resolution strategy                                      |
| Admin endpoint separation                                         |

**2. API Principles**

| **Principle** | **Definition** |
|----|----|
| REST-first | MVP uses REST APIs with predictable resource-oriented contracts. |
| Typed contracts only | All request and response payloads must be schema-validated at the NestJS pipe layer. |
| Consistent response envelopes | All endpoints return consistent success/error shapes. |
| Search is intent-driven | Search endpoints accept natural language and structured inputs. Raw text is never ranked directly. |
| AI outputs are product primitives | Frontend never consumes raw LLM output. All AI signals pass through the enrichment pipeline first. |
| Location resolution is text-first | Named locations (emirate/area) are resolved via text match on garage_locations. PostGIS is reserved for device-coordinate 'near me' queries only. |
| Admin is fully isolated | Admin endpoints use a separate JWT guard, separate auth endpoint, and are unreachable by user tokens. |

**3. Base Conventions**

| **Convention** | **Value** |
|----|----|
| Base URL | /api/v1 |
| Content-Type | application/json |
| User Auth | Bearer JWT — header: Authorization: Bearer \<token\> |
| Admin Auth | Bearer JWT (separate secret) — header: Authorization: Bearer \<admin_token\> |
| Token expiry | User access: 15 min \| User refresh: 7 days \| Admin: 2 hours (no refresh) |

**4. Standard Response Envelope**

**4.1 Success**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>{</p>
<p>"success": true,</p>
<p>"data": {},</p>
<p>"meta": {},</p>
<p>"error": null</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**4.2 Error**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>{</p>
<p>"success": false,</p>
<p>"data": null,</p>
<p>"meta": {},</p>
<p>"error": {</p>
<p>"code": "VALIDATION_ERROR",</p>
<p>"message": "Invalid request payload",</p>
<p>"details": {}</p>
<p>}</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**5. Error Codes**

| **Code** | **Meaning** |
|----|----|
| VALIDATION_ERROR | Request payload failed schema validation |
| UNAUTHORIZED | Missing or invalid JWT token |
| FORBIDDEN | Valid token but insufficient permissions (e.g. user token on admin endpoint) |
| NOT_FOUND | Resource does not exist |
| CONFLICT | Duplicate resource (e.g. duplicate review) |
| RATE_LIMITED | Too many requests — back off and retry |
| INTERNAL_ERROR | Unhandled server error — log and alert |

**6. Auth APIs**

**6.1 POST /auth/signup**

Create user account. Sends OTP via email.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Request</p>
<p>{ "email": "user@example.com", "full_name": "John Doe" }</p>
<p>// Response</p>
<p>{ "success": true, "data": { "user_id": "uuid", "otp_sent": true }
}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**6.2 POST /auth/verify-otp**

Verify OTP and issue JWT tokens.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Request</p>
<p>{ "email": "user@example.com", "otp": "123456" }</p>
<p>// Response</p>
<p>{</p>
<p>"success": true,</p>
<p>"data": {</p>
<p>"access_token": "jwt",</p>
<p>"refresh_token": "jwt",</p>
<p>"user": { "id": "uuid", "email": "...", "full_name": "..." }</p>
<p>}</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**6.3 POST /auth/google**

Google OAuth login via Passport.js Google strategy. Returns same token
shape as 6.2.

**6.4 POST /auth/refresh**

Exchange refresh token for a new access token.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Request</p>
<p>{ "refresh_token": "jwt" }</p>
<p>// Response</p>
<p>{ "success": true, "data": { "access_token": "jwt" } }</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**7. User APIs**

| *All /users endpoints require Bearer JWT (user token). Admin token cannot access these.* |
|----|

**7.1 GET /users/me**

Get current user profile.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Response</p>
<p>{</p>
<p>"success": true,</p>
<p>"data": {</p>
<p>"id": "uuid",</p>
<p>"email": "user@example.com",</p>
<p>"full_name": "John Doe",</p>
<p>"profile_image_url": "https://...",</p>
<p>"created_at": "2025-01-15T10:00:00Z"</p>
<p>}</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**7.2 PATCH /users/me**

Update current user profile. All fields optional.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Request</p>
<p>{ "full_name": "Updated Name", "profile_image_url": "https://..."
}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**8. Vehicle APIs**

**8.1 POST /vehicles**

Add a vehicle to the user's profile. Used for personalised garage
recommendations.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Request</p>
<p>{</p>
<p>"make": "Honda",</p>
<p>"model": "Accord",</p>
<p>"year": 2015,</p>
<p>"trim": "EX", // optional</p>
<p>"mileage_km": 120000 // optional</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**8.2 GET /vehicles**

List all vehicles for the authenticated user.

**8.3 PATCH /vehicles/:id**

Update a vehicle. All fields optional.

**8.4 DELETE /vehicles/:id**

Delete a vehicle from user profile.

**9. Search APIs**

**9.1 POST /search/query**

Primary search endpoint. Accepts natural language, structured input, or
hybrid. Internally routes through query resolution (Claude Haiku) then
candidate retrieval and ranking.

| *Location resolution strategy: if the query contains a named location ('Sharjah', 'Al Quoz'), it is extracted by Claude and matched via text against garage_locations.emirate / city / area. No geocoding API is used. Device coordinates (location.lat/lng) are used ONLY when no named location is present in the query — in that case PostGIS ST_DWithin applies a radius search. Named location always takes precedence over device coordinates.* |
|----|

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Request</p>
<p>{</p>
<p>"query": "Need cheap Honda tyre replacement in Sharjah", // natural
language</p>
<p>"vehicle_id": "uuid", // optional — uses saved vehicle for
personalisation</p>
<p>"location": {</p>
<p>"lat": 25.2048, // device coords — used ONLY if no named location in
query</p>
<p>"lng": 55.2708</p>
<p>},</p>
<p>"filters": {</p>
<p>"price_band": "budget", // budget | mid_range | premium</p>
<p>"service_type": "Tyres", // controlled ontology value</p>
<p>"brand": "Honda", // controlled ontology value</p>
<p>"radius_km": 15 // only applied when using device coords, not named
location</p>
<p>},</p>
<p>"page": 1,</p>
<p>"limit": 20</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Response</p>
<p>{</p>
<p>"success": true,</p>
<p>"data": {</p>
<p>"query_resolution": {</p>
<p>"service_type": "Tyres",</p>
<p>"brand": "Honda",</p>
<p>"price_band": "budget",</p>
<p>"urgency": null</p>
<p>},</p>
<p>"location_resolution": {</p>
<p>"strategy": "named_location", // "named_location" | "device_coords" |
"none"</p>
<p>"resolved_area": "Sharjah", // the matched text from
garage_locations</p>
<p>"device_coords_used": false</p>
<p>},</p>
<p>"results": [</p>
<p>{</p>
<p>"id": "uuid",</p>
<p>"name": "Garage Name",</p>
<p>"area": "Al Nahda, Sharjah",</p>
<p>"rating": 4.6,</p>
<p>"review_count": 214,</p>
<p>"distance_km": 2.4, // null if named_location strategy</p>
<p>"relevance_score": 0.87,</p>
<p>"profile_completeness": "full", // full | partial | limited | new</p>
<p>"scores": {</p>
<p>"trust": 0.82,</p>
<p>"speed": 0.74,</p>
<p>"price": 0.91</p>
<p>},</p>
<p>"top_tags": ["Tyres", "Honda", "Budget"],</p>
<p>"price_band": "budget"</p>
<p>}</p>
<p>]</p>
<p>},</p>
<p>"meta": { "page": 1, "limit": 20, "total": 47 }</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**9.2 GET /search/suggestions**

Returns autocomplete suggestions for the search bar.

| **Param** | **Type** | **Required** | **Notes**                          |
|-----------|----------|--------------|------------------------------------|
| q         | string   | yes          | Partial query string (min 2 chars) |
| lat       | number   | no           | Device latitude                    |
| lng       | number   | no           | Device longitude                   |

**9.3 GET /search/areas**

Returns list of canonical UAE areas and emirates for use in location
filter autocomplete. Sourced from distinct garage_locations.area and
garage_locations.emirate values — no external geocoding API.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Response</p>
<p>{</p>
<p>"success": true,</p>
<p>"data": {</p>
<p>"emirates": ["Dubai", "Sharjah", "Abu Dhabi", "Ajman", "Ras Al
Khaimah", "Fujairah", "Umm Al Quwain"],</p>
<p>"areas": ["Al Quoz", "Ras Al Khor", "Deira", "Bur Dubai", "Al Nahda",
"Industrial Area 1", ...]</p>
<p>}</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**10. Garage APIs**

**10.1 GET /garages**

List garages with structured filters. All params optional — returns all
active garages if none provided.

| **Param** | **Type** | **Notes** |
|----|----|----|
| area | string | Matches garage_locations.area (text, case-insensitive) |
| emirate | string | Matches garage_locations.emirate (text, case-insensitive) |
| brand | string | Controlled ontology — must match garage_brand_specializations.brand_name |
| service | string | Controlled ontology — must match garage_services.service_name |
| price_band | string | budget \| mid_range \| premium |
| min_rating | number | 0.0–5.0 |
| page | int | Default 1 |
| limit | int | Default 20, max 50 |

**10.2 GET /garages/:id**

Get full garage detail including AI-generated intelligence profile.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Response</p>
<p>{</p>
<p>"success": true,</p>
<p>"data": {</p>
<p>"id": "uuid",</p>
<p>"name": "Garage Name",</p>
<p>"slug": "garage-name-al-quoz",</p>
<p>"phone": "+971...",</p>
<p>"whatsapp": "+971...",</p>
<p>"rating": 4.7,</p>
<p>"review_count": 483,</p>
<p>"is_verified": true,</p>
<p>"profile_completeness": "full", // full | partial | limited | new</p>
<p>"profile_badge": null, // "Limited data" | "New listing" | null</p>
<p>"location": {</p>
<p>"address_line": "...",</p>
<p>"area": "Al Quoz",</p>
<p>"city": "Dubai",</p>
<p>"emirate": "Dubai",</p>
<p>"latitude": 25.1234,</p>
<p>"longitude": 55.5678</p>
<p>},</p>
<p>"scores": {</p>
<p>"trust": 0.88,</p>
<p>"speed": 0.71,</p>
<p>"price": 0.45,</p>
<p>"overall": 0.82</p>
<p>},</p>
<p>"tags": [</p>
<p>{ "type": "best_for", "value": "BMW AC", "confidence": 0.94 },</p>
<p>{ "type": "avoid_for", "value": "Budget Repairs", "confidence": 0.78
}</p>
<p>],</p>
<p>"services": [</p>
<p>{ "name": "AC Repair", "confidence": 0.96 },</p>
<p>{ "name": "Diagnostics", "confidence": 0.91 }</p>
<p>],</p>
<p>"brand_specializations": [</p>
<p>{ "brand": "BMW", "confidence": 0.93 },</p>
<p>{ "brand": "Porsche", "confidence": 0.85 }</p>
<p>],</p>
<p>"ai_summary": "Well-rated for BMW diagnostics and AC repair. Premium
pricing.",</p>
<p>"reviews_preview": []</p>
<p>}</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**10.3 GET /garages/:id/reviews**

Paginated garage reviews from both external (ingested) and
user-submitted sources.

| **Param**   | **Type** | **Notes**                              |
|-------------|----------|----------------------------------------|
| source_type | string   | external \| user \| all (default: all) |
| page        | int      | Default 1                              |
| limit       | int      | Default 10, max 30                     |

**10.4 POST /garages/:id/favorite**

Save garage to user favourites. Idempotent — no error if already saved.

**10.5 DELETE /garages/:id/favorite**

Remove garage from user favourites.

**11. Review APIs**

**11.1 POST /reviews**

Submit a user review. Review enters moderation queue immediately
(moderation_status: pending). User sees optimistic UI. Triggers
re-enrichment of garage AI profile on approval.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Request</p>
<p>{</p>
<p>"garage_id": "uuid",</p>
<p>"rating": 4.5,</p>
<p>"review_text": "Great for BMW AC, expensive but worth it.",</p>
<p>"service_type": "AC Repair", // optional, controlled ontology</p>
<p>"vehicle_make": "BMW", // optional</p>
<p>"vehicle_model": "X5" // optional</p>
<p>}</p>
<p>// Response</p>
<p>{</p>
<p>"success": true,</p>
<p>"data": {</p>
<p>"id": "uuid",</p>
<p>"moderation_status": "pending",</p>
<p>"message": "Review submitted and pending approval."</p>
<p>}</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**11.2 PATCH /reviews/:id**

Edit own review. Only allowed if review belongs to authenticated user.
Triggers re-moderation.

**11.3 DELETE /reviews/:id**

Delete own review. Hard delete. Triggers garage score recomputation.

**12. Lead APIs**

| *Lead tracking records monetisable user actions (call tap, WhatsApp tap). No payment processing or billing logic exists at MVP. Lead data is stored for post-MVP monetisation analytics.* |
|----|

**12.1 POST /leads**

Track a lead action. Called by frontend on call/WhatsApp button tap.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Request</p>
<p>{</p>
<p>"garage_id": "uuid",</p>
<p>"lead_type": "whatsapp", // call | whatsapp | click</p>
<p>"source_surface": "garage_detail" // search | garage_detail</p>
<p>}</p>
<p>// Response</p>
<p>{ "success": true, "data": { "id": "uuid" } }</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**13. Favourites APIs**

**13.1 GET /favorites**

List all saved garages for authenticated user. Returns full garage card
data.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Response</p>
<p>{</p>
<p>"success": true,</p>
<p>"data": [ { /* garage card object */ } ],</p>
<p>"meta": { "page": 1, "limit": 20, "total": 8 }</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**14. Chat / Query Resolution APIs**

| *Query resolution uses Claude Haiku (claude-haiku-4-5) for all live user-facing calls. This is the only endpoint that calls the LLM synchronously in the request path. Rate limit is strict to control cost.* |
|----|

**14.1 POST /chat/resolve-query**

Converts natural language user input into structured search intent.
Called by the search flow before 9.1 POST /search/query when query is
natural language.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Request</p>
<p>{ "message": "Need BMW AC repair in Al Quoz under 800 AED" }</p>
<p>// Response</p>
<p>{</p>
<p>"success": true,</p>
<p>"data": {</p>
<p>"resolved_query": {</p>
<p>"service_type": "AC Repair",</p>
<p>"vehicle_brand": "BMW",</p>
<p>"vehicle_model": null,</p>
<p>"location_text": "Al Quoz",</p>
<p>"price_band": "budget",</p>
<p>"budget_max_aed": 800,</p>
<p>"urgency": null</p>
<p>},</p>
<p>"confidence": 0.95,</p>
<p>"llm_provider": "claude-haiku-4-5"</p>
<p>}</p>
<p>}</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

*location_text is a raw extracted string (e.g. 'Al Quoz'). The search
module resolves it to matching garages via text match on
garage_locations — no geocoding occurs at this step.*

**15. Admin APIs**

| *Admin endpoints are internal-only. They are protected by a separate admin JWT guard (different secret from user tokens). User tokens cannot access admin endpoints — the guard returns 403 FORBIDDEN regardless of user role. Admin users are created manually — no self-signup exists.* |
|----|

**15.0 POST /admin/auth/login**

Admin-only login. Separate from user auth. Returns a short-lived admin
JWT (2 hours, no refresh).

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p>// Request</p>
<p>{ "email": "admin@garageiq.ae", "password": "..." }</p>
<p>// Response</p>
<p>{ "success": true, "data": { "access_token": "admin_jwt",
"expires_in": 7200 } }</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**15.1 Garage Management**

| **Method** | **Path** | **Purpose** |
|----|----|----|
| GET | /admin/garages | List all garages with full metadata |
| PATCH | /admin/garages/:id | Edit garage metadata (name, contact, category) |
| PATCH | /admin/garages/:id/tags | Override or suppress AI-generated tags |
| PATCH | /admin/garages/:id/scores | Override garage trust/speed/price scores |
| PATCH | /admin/garages/:id/verify | Set is_verified = true / false |
| PATCH | /admin/garages/:id/feature | Set is_featured = true / false (post-MVP) |

**15.2 Review Moderation**

| **Method** | **Path**                    | **Purpose**                       |
|------------|-----------------------------|-----------------------------------|
| GET        | /admin/reviews/moderation   | List reviews pending moderation   |
| PATCH      | /admin/reviews/:id/moderate | Approve, reject, or flag a review |

**15.3 Pipeline Monitoring**

| **Method** | **Path** | **Purpose** |
|----|----|----|
| GET | /admin/jobs/status | Check ingestion and enrichment pipeline health |
| POST | /admin/garages/:id/enrich | Manually trigger AI re-enrichment for a garage |

**16. Pagination Standard**

| **Field**   | **Location**       | **Notes**                         |
|-------------|--------------------|-----------------------------------|
| page        | Request query/body | 1-indexed, default 1              |
| limit       | Request query/body | Default 20, endpoint-specific max |
| total       | Response meta      | Total matching records            |
| total_pages | Response meta      | Computed: ceil(total / limit)     |

**17. Validation Rules**

> • All payloads schema-validated via NestJS pipes (class-validator +
> class-transformer)
>
> • UUID validation on all :id params and body UUIDs
>
> • Numeric ranges enforced (rating: 1.0–5.0, year: 1980–current+1)
>
> • All string inputs trimmed and max-length enforced
>
> • Enum fields (price_band, service_type, brand, lead_type) validated
> against controlled ontology
>
> • Unknown fields rejected — no passthrough of undeclared properties
>
> • AI output values schema-validated before storage (Pydantic on Python
> side, Zod on Node side)

**18. Rate Limits**

| **Endpoint group** | **Limit** | **Reason** |
|----|----|----|
| POST /auth/signup | 5/min per IP | Prevent spam account creation |
| POST /auth/verify-otp | 10/min per IP | Prevent OTP brute force |
| POST /search/query | 30/min per user | Moderate — LLM cost per query |
| POST /chat/resolve-query | 20/min per user | Strict — synchronous Claude Haiku call |
| POST /reviews | 5/hour per user | Prevent review spam |
| POST /leads | 60/min per user | Moderate — fire-and-forget tracking |
| GET /garages, GET /garages/:id | 120/min per user | High — cacheable reads |

**19. Module Ownership**

| **NestJS Module** | **Owns** |
|----|----|
| AuthModule | POST /auth/\* — user signup, OTP, Google OAuth, token refresh |
| UsersModule | GET\|PATCH /users/me |
| VehiclesModule | POST\|GET\|PATCH\|DELETE /vehicles/\* |
| SearchModule | POST /search/query, GET /search/suggestions, GET /search/areas, POST /chat/resolve-query |
| GaragesModule | GET /garages, GET /garages/:id, GET /garages/:id/reviews, POST\|DELETE /garages/:id/favorite |
| ReviewsModule | POST\|PATCH\|DELETE /reviews/\* |
| LeadsModule | POST /leads |
| FavouritesModule | GET /favorites |
| AdminModule | POST /admin/auth/login, all /admin/\* endpoints — separate guard |

*GarageIQ UAE — API Contract Specification v1.1 — Internal Engineering
Reference*
