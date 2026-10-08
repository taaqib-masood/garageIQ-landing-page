# GarageIQ review methodology — 8 October 2026

Prepared `/how-it-works/` for coordinator validation, exact-commit review and
publication. This record does not establish a deployment or live functionality.

## Driver question and scope

**Question:** How can a UAE driver use garage reviews to decide whom to contact
without treating a star average as proof of repair quality?

The static page offers five checks: recurring patterns, dates,
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
- `public/index.html`: preserves the hero's “How it works” fragment link and
  links to the guide from the garage-review explanation.
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
- Passed 32 direct HTML references to owned local files, including fragments,
  assets and the
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

## Review repairs and recheck — 8 October 2026

The supplied review identified a removed fragment link and overlapping wrapped
navigation hit areas. The hero again links to the existing `#problem` section;
“Read our garage review guide” links that section to `/how-it-works/`.
The guide's header/footer navigation resets `margin-block: 0`, overriding the
shared button rule's negative margins while retaining its padding and focus
styles. No prepared checks were changed.

At **20:01:33 +04:00**, an inline, read-only Python standard-library check
passed across both HTML pages: single H1, unique IDs, self-canonicals,
description/social-metadata consistency, parseable JSON-LD, all three linked
sources, Article date/citations and sitemap parity. It also checked the scoped
navigation margin reset. At **20:02:49 +04:00**, the local-reference recheck
passed **32** owned references (17 on the guide, 15 on the homepage), excluding
only the hosting-managed analytics script described above. An in-memory
replacement of `href="#problem"` changed the input and exposed a missing
fragment; this is diagnostic evidence, not execution of the trusted self-check.
A separate read-only source review confirmed both repairs.
At **20:04:39 +04:00**, the final read-only check also passed unique page
titles/descriptions, title/social parity, guide tag nesting and heading order,
all 21 page-scoped CSS blocks, local font presence and reduced-motion support.

An earlier Chrome debugging-pipe attempt used a temporary profile and exited
with **SIGABRT** at **20:02:12 +04:00**, before loading the page. That attempt
did not establish responsive behavior. The coordinator later checked the
candidate with the configured Playwright Chromium headless shell at **320×800**
with mobile touch enabled. All five header/footer navigation links had at least
44px hit areas without overlap; keyboard Tab reached each link with visible
focus, and touch taps on the header and footer links navigated correctly. All
20 requests were intercepted or blocked, with **zero forwarded** and no
waitlist submission.

Public-file SHA-256 fingerprints at the recheck:

| File | SHA-256 |
| --- | --- |
| `public/index.html` | `1672eaac96ed68a3d7b5522a6897d50f1902e4a07a3a8297a4c9fe686b701ee5` |
| `public/style.css` | `f7c85bd85791aad23b86d387a96bd1932da0cb9145ed782de7ed519be6808384` |
| `public/how-it-works/index.html` | `08a2ce4c66bf747c6d07e645ba806c3d14ce292e3b358f54b14818b86be0c6a0` |
| `public/sitemap.xml` | `401e3f32efdcaf7d5509d4b508d0735c9d3327b2e6a30af36580e17e6c3986da` |

The earlier worker checkpoint did not run configured acceptance against its
exact candidate. After that review, the coordinator reran the trusted SEO
checker and its regression suite, including the fragment-removal mutation that
previously missed `#problem`. The narrow-screen flow above was also exercised.
These results are recorded in the private coordinator acceptance file bound to
the final candidate SHA; the file is not a substitute for the independent
review and release checks that follow.

Live routing, deployment, indexing, authenticated search/funnel metrics and
actual signup outcomes remain unverified or unavailable. The existing waitlist
form and JavaScript were not edited.
