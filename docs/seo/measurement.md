# Landing measurement contract — 6 October 2026

This change prepares client-side measurement. It does not establish database
receipt, authenticated reporting access, indexing, traffic or a live deployment.
Since 18 November 2026 both first-party writes go through two Supabase RPCs
defined in `supabase/migrations/20261118000000_waitlist_rpc.sql`
(`join_waitlist`, `log_event`); anon has no direct INSERT on either table.
That SQL must be applied by the owner to project `zbqtaiozkhfscwynddjd` before
the matching `public/main.js` is deployed, or every signup fails.

| Event | Trigger | Counting rule |
| --- | --- | --- |
| `landing_view` | Once when this page's `DOMContentLoaded` handler runs | Page-load denominator, including returning visitors |
| `waitlist_submit` | Locally valid email before the insert request | Intent, not a conversion |
| `waitlist_success` | A 2xx `join_waitlist` response | Friendly completion, including duplicates; never use as new-lead count |
| `waitlist_new_signup` | Written by `join_waitlist` itself, only when its insert added a row | Filter `persona = driver` for the primary goal; owners and unknown personas remain separate |
| `waitlist_error` | Failed request, including 429 rate limit | Failure, never a conversion |

`join_waitlist` runs `insert ... on conflict (email) do nothing` and answers 204
for new and already-listed emails alike, so the page shows the same "You're on
the list!" either way and a caller cannot test whether an address is listed.
The client never sends `waitlist_new_signup`; `log_event` rejects that name, so
the primary metric counts only real new rows. Both RPCs validate persona and
lengths (400 otherwise) and rate-limit per client IP: 5 signups per 10 minutes
(429) and 60 events per minute (excess silently dropped). Invalid email,
API error and network error emit no new-signup event. The submit button is
disabled while the insert is pending, including for keyboard submissions.
Restoring a previously saved success state emits no new-signup event.

Every first-party event sends `name`, `session_id`, `persona` and `referrer`
(as `p_`-prefixed RPC arguments). `emirate` is no longer collected; the column
stays for historical rows. No new database column is assumed.
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
cover new and already-listed emails (identical UI), 429 rate limit, invalid email, API/network failure, failed analytics,
denied storage, search/other/missing/malformed referrers, driver/owner/unknown
personas, returning visitors and repeated submissions during one request. It
also checks exact search-host classification and all eight search/non-search ×
driver/owner × new/duplicate report cells. The report check requires a
`waitlist_new_signup` session to match a `landing_view` with the same session ID
and search classification before counting it as a search conversion; unmatched
conversions and null-session events remain separately visible.
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
