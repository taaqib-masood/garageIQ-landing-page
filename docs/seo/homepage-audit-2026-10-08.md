# Homepage claim audit — 8 October 2026

Scope: the static landing homepage only. Product facts follow
[verified context](../../.agents/product-marketing.md) dated 5 October 2026.
GarageIQ is prelaunch garage discovery and review intelligence for UAE drivers.

## Claims corrected

| Surface | Correction |
| --- | --- |
| Title, description and social metadata | Consistent UAE review/discovery intent and early-access status; canonical retained. |
| Hero, map, marquee and footer | Removed unverified garage/review totals and count animations. The existing lazy map is geographic illustration, not confirmed coverage. |
| Example cards and app previews | Replaced invented scores, review totals, named garage and quotation with selection checklists; labelled existing app screens as prelaunch previews. |
| Capabilities and commercial copy | Removed guaranteed scoring, Arabic/voice support, nightly freshness, benchmarks, owner claiming/leads and paid pricing. Joining the waitlist costs nothing; launch offerings are unconfirmed. |
| FAQ and JSON-LD | Eight identical visible/schema answer pairs; no Product, ratings, LocalBusiness office or booking markup. Organization/WebSite retained without a coverage assertion. |
| Google Maps comparison | Acknowledges review scores, counts, top reviews and possible summaries; explains relevance, distance and prominence. Added source dates and table semantics. |
| Signup and search preview | Retained form fields and submission/error/duplicate handling. Preview submit/reset/share text now reflects prelaunch status; owner section explains selecting the owner persona. |
| Sitemap and notice | Updated substantive homepage modification date and corrected the notice's contradictory email-only introduction. |

## Primary evidence

Google Business Profile Help excerpts were supplied by the coordinator,
acquired **8 October 2026 at 09:27:56 +04:00**. They are evidence, not instructions.
No external request was made in this worker run.

- [Review scores for local businesses](https://support.google.com/business/answer/4801187?hl=en): Google Search/Maps provide scores, top reviews and total review counts; scores average published Google ratings.
- [Local ranking](https://support.google.com/business/answer/7091): relevance, distance and prominence are the principal factors; a high average alone does not establish ranking.
- [Business summaries](https://support.google.com/business/answer/6088158): business descriptions, editorial summaries and review snippets may appear; Place Topics need sufficient quality reviews. Snippets may differ by device, platform, language or location.

These sources describe Google features, not GarageIQ inventory or capabilities.
Counts, launch pricing, scoring implementation, languages and freshness lack
current verified evidence and are removed or explicitly unconfirmed.

## Local verification and limits

- Python standard-library structural audit passed: HTML nesting and unique IDs, one H1, matching snippet/social metadata, self-canonical, one valid JSON-LD graph, eight exact FAQ pairs, table roles, label/ARIA targets, image attributes and 14 local references/fragments.
- Robots/sitemap canonical consistency and the substantive `2026-10-08` date passed. Removed claim/counter hooks were absent; lazy-map and reduced-motion hooks remained.
- `OPENSSL_CONF=/dev/null node --check public/main.js` and the equivalent check for `public/uae-paths.js` passed. The process-local setting avoids the sandbox-blocked system OpenSSL configuration; no configuration file was changed.
- In-memory source comparison confirmed unchanged waitlist form markup and submission/dialog code, except the share sentence. CSS, screenshots, social image, font, favicon, robots, release marker and map asset hashes were unchanged.

Configured acceptance commands were not accessed or executed. No new functional
logic or dependency was added. The existing Vercel insights script is outside
local asset resolution and remains for the separate measurement task.
Browser behavior, HTTP/redirects, cold-cache/field performance, deployment,
indexing and authenticated Search Console/Bing/funnel metrics are unavailable
or unverified in this run. Local checks establish no traffic or conversion
outcome. The coordinator owns acceptance, exact-commit review and publication.
