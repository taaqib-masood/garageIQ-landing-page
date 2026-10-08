# GarageIQ review methodology — 8 October 2026

Prepared `/how-it-works/` for coordinator validation, exact-commit review and
publication. This record does not establish a deployment or live functionality.

## Driver question and scope

**Question:** How can a UAE driver use garage reviews to decide whom to contact
without treating a star average as proof of repair quality?

The 889-word static page offers five checks: recurring patterns, dates,
specific repair details, uncertainty and direct confirmation with the garage.
It adds a clearly hypothetical AC example and practical questions about
diagnosis, quote scope, parts, approval, timing and warranty terms. A review's
price is distinguished from a current written quote.

GarageIQ's planned discovery/review-intelligence focus is separated from
today's landing site and waitlist. The page claims no implemented scoring
formula, verified dataset accuracy, current coverage, authenticity check,
data-refresh schedule, booking, repair service or confirmed launch date.

Changed files:

- `public/how-it-works/index.html`: visible guide, update date, linked sources,
  unique metadata, self-canonical, Article and BreadcrumbList JSON-LD,
  homepage/FAQ links and driver CTA to the existing `/#waitlist`.
- `public/index.html`: hero's “How it works” link points to the new guide.
- `public/style.css`: 21 appended rules scoped to `.methodology-page`, reusing
  the self-hosted font, colours, typography, buttons and focus/motion rules.
- `public/sitemap.xml`: adds the new canonical with `lastmod` 2026-10-08.

## Supplied evidence

All excerpts were acquired by the coordinator's agent-reach process on
**2026-10-08 at 19:43:40 +04:00**. Acquisition metadata is supplied evidence;
the worker did not refetch sources. Source publication/update dates were not
supplied, so the page labels the acquisition and editorial dates separately.

| Source | Supported use |
| --- | --- |
| [Google review scores](https://support.google.com/business/answer/4801187?hl=en) | Published ratings are averaged; a new score may take up to two weeks to update. |
| [Google Maps business summaries](https://support.google.com/business/answer/6088158) | Review topics/snippets may highlight underlying review themes; snippets can differ by device, platform, language or location. |
| [Google helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | Editorial guidance on original, useful, sourced content; not evidence of repair expertise or GarageIQ accuracy. |

The five-check method and garage questions are original practical guidance,
not Google-endorsed scoring rules or an empirically validated assessment.
No real garage or reviewer was evaluated. UAE search-result research and
query-demand measurements were not supplied and were not inferred.

## Local validation

Read-only inline `python3 -B` checks used Python's `html.parser`, `json`,
`urllib.parse` and `xml.etree.ElementTree`; they created no temporary files.

- Passed across both HTML pages: unique titles/descriptions, one H1 each,
  self-canonicals, matching Open Graph/Twitter text and parseable JSON-LD.
- Passed 33 owned local references, including fragments, assets and the
  reciprocal homepage link, existing FAQ anchor and waitlist CTA.
- Passed all three source links, Article citation/date consistency and
  sitemap-to-canonical parity with substantive update dates.
- Passed new-page tag nesting and heading order, English language/main/skip
  navigation, absence of executable scripts, local CSS font reference and
  presence of existing reduced-motion support.
- Passed balanced added CSS blocks and all 21 rules' page-specific scope.

The first local-reference scan stopped at the existing homepage's
`/_vercel/insights/script.js`, which has no worktree file. The owned-file scan
explicitly excluded only that hosting-managed reference. Its live availability
was not tested; the new page does not load it.

A separate read-only agent reviewed the source files and supplied claims and
found no blocking issues. This editorial review is not approval of a candidate
commit; the coordinator must independently review its exact candidate SHA.

Configured acceptance/integrity checks were not accessed or executed.
Browser rendering, live routing, deployment, indexing, authenticated search
metrics and actual signup outcomes remain unverified or unavailable. No real
waitlist entry was submitted; the existing form and JavaScript were preserved.
