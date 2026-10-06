# Landing measurement contract — 6 October 2026

This change prepares client-side measurement. It does not establish database
receipt, authenticated reporting access, indexing, traffic or a live deployment.
The existing first-party endpoint is reused without a backend/schema change.

| Event | Trigger | Counting rule |
| --- | --- | --- |
| `landing_view` | Once when this page's `DOMContentLoaded` handler runs | Page-load denominator, including returning visitors |
| `waitlist_submit` | Locally valid email before the insert request | Intent, not a conversion |
| `waitlist_success` | A successful insert response or HTTP 409 | Friendly completion, including duplicates; never use as new-lead count |
| `waitlist_new_signup` | Successful 2xx response to the existing plain insert, excluding HTTP 409 | Filter `persona = driver` for the primary goal; owners and unknown personas remain separate |
| `waitlist_error` | Failed insert or network request | Failure, never a conversion |

The insert does not request upsert or conflict-ignore behavior. A 409 keeps the
success interface and says the visitor is already on the list. Invalid email,
API error and network error emit no new-signup event. The submit button is
disabled while the insert is pending, including for keyboard submissions.
Restoring a previously saved success state emits no new-signup event.

Every first-party event preserves the existing payload keys: `name`,
`session_id`, `persona`, `emirate`, `referrer`. No new database column is assumed.
Email and typed garage-search queries go only to the existing waitlist request,
never to analytics. The referrer value is an observed hostname, with URL path,
query and fragment removed. It stays the same for all events on that page load
and is persisted in each event request; it is not stored across page loads.
The optional secondary sink's `from_hero_search` flag describes use of the page's
search box. It is not evidence of a search-engine referral and is not saved by
the first-party sink.

## Search referral reporting

Classify the stored hostname in a reviewed report rather than adding an
unverified `from_search` database field. Use exact, lower-case hostname
membership in a dated allowlist. An initial conservative list is
`google.com`, `www.google.com`, `google.ae`, `www.google.ae`, `bing.com`,
`www.bing.com`, `duckduckgo.com`, `www.duckduckgo.com`. Review other engine and
regional hostnames before adding them; substring matches such as `google` would
misclassify lookalike domains. Other present hostnames are other observed
referrals, not proof that the visitor never used search. Missing/malformed
referrers are unknown, which can include direct visits, apps and stripped
referrers. Referrer attribution cannot distinguish every paid and organic visit.

For one complete reporting window, count distinct non-null session IDs with
`waitlist_new_signup`, `persona = driver`, and an allowlisted search referrer.
Divide by distinct non-null session IDs with `landing_view` and the same
search-referrer classification in that window. Require a matching denominator
session and report conversions without one separately. Report owners, unknown
personas, unknown referrers and events with null session IDs separately. Never
collapse null IDs into one visitor or treat unknown attribution as search.

The ID is per tab and survives reloads when session storage works. Denied storage
keeps signup functional but produces a null ID; those events cannot support
distinct-session conversion measurement. Several visits in the same tab may
share an ID and have different observed referrers. Count a search conversion
only when the conversion itself has a search referrer, not merely because that
tab had an older search visit. This conservative model can miss internal
navigation journeys; retain that limitation in each report.

Exclude diagnostic traffic when reviewing aggregates. Raw identifiers, visitor
exports and account credentials belong outside this public repository. Historical
`waitlist_success` cannot be retrospectively separated into new versus duplicate
leads. Record the actual verified release time as the start of the new series.

## Verification and remaining access

Run `node docs/seo/check-measurement.cjs`. It executes the complete script in a
Node VM, with all requests intercepted and no production entries. Its scenarios
cover 200/201, duplicate 409, invalid email, API/network failure, failed analytics,
denied storage, search/other/missing/malformed referrers, driver/owner/unknown
personas, returning visitors and repeated submissions during one request.
Run `python3 scripts/seo_check.py --json` for read-only landing checks.

On 6 October 2026, a fresh isolated headless Chromium check passed 11 scenarios,
including keyboard submit, native focus, new and duplicate completion, retries,
denied storage, failed analytics, returning state, owner persona and overlapping
submissions. Every HTTP request was intercepted, with zero production writes;
the check used an existing browser binary and no user's browser profile or UI.
First-party receipt and read-only aggregate access remain unverified: a mocked
test or successful client fetch cannot prove
that an event was stored. Do not create fake production leads to check this.
Search Console and Bing property/indexing/baseline access also remain unverified.
Task 1 stays open until those account-side checks have evidence. Keep the current
optional analytics shim until the sufficient primary sink is verified; no new SDK
is introduced here. The HTML's `main.js` cache version is `20261006-funnel`,
because the existing asset caching can retain the previous code. A verified
deployment is still required before this event series can be used in reports.
