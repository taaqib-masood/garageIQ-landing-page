# Homepage claim audit — 8 October 2026

Scope: the static landing homepage only. Product facts follow
[verified context](../../.agents/product-marketing.md) dated 5 October 2026.
GarageIQ is prelaunch garage discovery and review intelligence for UAE drivers.

## Corrections

| Surface | Correction |
| --- | --- |
| Title, description and social metadata | Consistent UAE garage-review/discovery intent and early-access status; canonical retained. |
| Hero, map, marquee and footer | Removed unverified garage/review totals and count animations. The lazy map is a geographic illustration, not confirmed coverage. |
| Example cards and app previews | Replaced invented scores, review totals, named garage and quotation with selection checklists; labelled app screens as prelaunch previews. |
| Capabilities and commercial copy | Removed guaranteed scoring, Arabic/voice support, nightly freshness, benchmarks, owner claiming/leads and paid pricing. Launch offerings remain unconfirmed. |
| FAQ and JSON-LD | Eight visible/schema answer pairs; no Product, ratings, LocalBusiness office or booking markup. Organization/WebSite remain without a coverage assertion. |
| Google Maps comparison | Acknowledges review scores, counts, top reviews and possible summaries; describes Google's relevance, distance and prominence factors. |
| Signup and search preview | Retained the existing form and submission/error/duplicate handling. Preview text now reflects prelaunch status; owner copy explains persona selection. |
| Sitemap and notice | Updated the substantive homepage modification date and corrected the notice's contradictory email-only introduction. |

## Primary-source findings

Google Business Profile Help pages were acquired on **8 October 2026 at
09:27:56 +04:00**. The coordinator verified the saved source hashes before
using these paraphrases:

- [Review scores for local businesses](https://support.google.com/business/answer/4801187?hl=en): Google Search and Maps can show review scores, top reviews and total review counts; the score averages published ratings.
- [Local ranking](https://support.google.com/business/answer/7091): local results use relevance, distance and prominence signals; a high average alone does not establish ranking.
- [Business summaries and topics](https://support.google.com/business/answer/6088158): Maps may show business descriptions, editorial summaries and review snippets. Topic availability depends on sufficient review volume, and snippets can vary by device, platform, language or location.

These sources describe Google's features, not GarageIQ inventory or
capabilities. Unverified counts, launch pricing, scoring implementation,
languages and freshness were removed or left explicitly unconfirmed.

## Review scope and evidence limits

The coordinator reviewed the homepage diff summary against production base
commit `6ecfc89b14e15cc377a571270d1ec30e87268f41`, including the changed public
files, prelaunch claims and waitlist flow. The candidate removes unsupported
counters and retains static primary content. The candidate SHA and dated
release checks are stored in the private coordinator record.

The originating worker reported a read-only structural audit and JavaScript
syntax checks at 09:46 +04:00, plus file fingerprints. Those checks are not a
substitute for the coordinator's exact-commit acceptance record. Publication
remains gated on candidate-specific rendered/no-JavaScript checks, the native
browser signup scenarios, Schema.org validation, host/social-image responses,
and three cold-cache mobile Lighthouse runs. The private record holds those
results and their candidate SHA; field INP, authenticated Search Console/Bing
data, indexing outcomes and ranking/conversion gains remain unavailable unless
separately observed.
