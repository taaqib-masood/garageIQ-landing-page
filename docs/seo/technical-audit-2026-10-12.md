# Landing technical audit — 12 October 2026

Scope: the assigned static landing worktree. This record describes source
changes and supplied observations; it does not establish publication,
deployment, indexing or signup outcomes.

## Evidenced changes

- Carousel controls had 6px buttons spaced 20px apart, with overlapping 44px
  pseudo-element hit areas. The controls now occupy separate 44×44px buttons;
  only their 6px visual dots scale. The 176px row fits the 280px phone frame,
  retains keyboard focus styles and keeps the same vertical visual centre.
- Without JavaScript, reveal spans and FAQ answers remained hidden, and the
  waitlist's default native GET could place an email in the URL. A head
  `noscript` fallback reveals explanatory text and FAQ answers, hides controls
  requiring JavaScript, and retains an accurate signup notice and guide link.
  The form now declares POST as a privacy fallback; no server signup endpoint
  is claimed. The notice link inherits its white text colour.
- Both pages use `style.css?v=20261012-accessibility`. The homepage's sitemap
  modification date reflects this substantive change. The guide's content,
  visible review date, Article dates and sitemap date remain 8 October.

The starting worktree already contained the explicit reduced-motion hero
animation cancellation and stylesheet version `20261012-reduced-motion`.
That repair was retained. Starting HTML/CSS fingerprints differed from the
supplied live snapshot; their cause was not established without coordinator
integrity checks. Existing WebGL and magnetic-pointer motion remain outside
this patch; this is not a claim that all motion has been eliminated.

## Source and live evidence

The three complete local captures acquired **12 October at 21:15:49 +04:00**
matched their supplied SHA256 and byte counts before use:

- [Robots](https://www.garageiq.ae/robots.txt): 192-byte extraction,
  `12afaf32eec763e808b47da6105d8013a1867538bc1a3871e83712c572cac68a`.
- [Sitemap](https://www.garageiq.ae/sitemap.xml): 290-byte extraction,
  `a965aef0c93a7aaf5dada38468d464e765551a3586a8f5679a8e04312458f711`.
- [Google robots guide](https://developers.google.com/search/docs/crawling-indexing/robots/intro):
  49,580 bytes,
  `c8a17ac436df680adc3b111555aa6f852a7545672faec8af661a118f33c21495`;
  page update dated **10 December 2025**.

Extraction hashes are not raw endpoint hashes. Robots permits crawling and
references the canonical sitemap, whose capture lists both public pages.
Google's guide describes crawl control, not an indexing guarantee or a
security boundary. Externally linked disallowed URLs can still appear in
search; crawler support and syntax interpretation vary. Resources needed to
understand a page should remain crawlable.

Coordinator-supplied native observations at **17:16:10 UTC on 12 October**
show all four homepage host variants resolving to the canonical HTTPS www
homepage with 200 responses, healthy robots/sitemap/social image and key
assets, a visible no-JavaScript H1, and rendered homepage schema with zero
reported errors or warnings. No new live acquisition was performed.

The supplied **11 October** three-run mobile baseline has median LCP
2320.3215ms, CLS 0 and TBT 0. Its HTML hash is
`1672eaac96ed68a3d7b5522a6897d50f1902e4a07a3a8297a4c9fe686b701ee5`;
its assets differ from this candidate. These are earlier lab observations,
not candidate results or field INP. Lab telemetry was blocked.

## Worker checks and handoff

Read-only inline structural checks passed at **17:25:32 UTC on 12 October**:
both pages' H1/title/description/canonical/social metadata, unique IDs,
parseable JSON-LD, Article dates, robots/sitemap parity and **35** owned HTML
references. The existing hosting-managed analytics script was excluded from
owned-file checks; its current live response was not supplied. A separate
source review confirmed all eight FAQ/schema answer pairs and guide citations.

An in-memory geometry check reproduced up to 32.8px of neighbouring target
overlap in the starting CSS and zero overlap after the repair across all four
active states. It checked 44px targets, row width and preserved visual centre;
it is a source model, not rendered hit testing. Separate read-only review
confirmed the fallback's contrast, decoration and inactive-link repairs.
The final fallback safeguards, balanced CSS blocks and shared stylesheet
version also passed source checks at **17:29:35 UTC**.

Candidate public SHA256 fingerprints at **17:28:06 UTC**:

- `public/index.html`:
  `4423e06adb97e2900776ef9888713ccd5667071956cf54f227d3892496020c22`
- `public/style.css`:
  `f0a12a18206f721128e68ed01716990491df1fa4508a603c80259c8b9903cd52`
- `public/how-it-works/index.html`:
  `940cea3248e14249617807fb8c0eac9a648b24638d04d547c88f58ec27ed5fa4`
- `public/sitemap.xml`:
  `ac2bc2d152f123c14d805ab4c79c0319443e6ca3b4501126e51c1c0136f725bf`

JavaScript syntax checks passed; the same read-only commands are runnable
from the worktree without network or temporary files:

```sh
node --check public/main.js
node --check public/uae-paths.js
```

`main.js`, lazy assets and font bytes were preserved. No submission, network
request, Git operation or configured acceptance command was performed.

Coordinator handoff still needs trusted checks and exact-candidate review,
320px keyboard/touch and no-JavaScript rendering, intercepted native POST,
mocked signup scenarios, and **three fresh cold mobile lab runs** for the
changed HTML/CSS. Publication and live verification remain pending.
Authenticated Search Console, Bing, funnel receipt, indexing, attribution
and field INP remain unavailable; public checks establish no business gains.
