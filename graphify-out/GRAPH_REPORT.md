# Graph Report - garageIQ-landing-page  (2026-11-05)

## Corpus Check
- 60 files · ~74,932 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .woff2 1, .xml 1)

## Summary
- 77 nodes · 92 edges · 9 communities (all shown)
- Extraction: 92.4% EXTRACTED · 7.6% INFERRED · 0.0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `736c2293`
- Source-aware freshness check (stale only if this command prints paths, including uncommitted source edits; documentation-only and graph-only commits do not count):

```sh
git diff --name-only 736c2293101377658859cb655bbe36de8e08ddb2 -- ':(glob)**/*.cjs' ':(glob)**/*.js' ':(glob)**/*.json' ':(glob)**/*.py' ':(exclude)graphify-out/**'
```
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seo_check.py
- check-measurement.cjs
- Element
- test_seo_check.py
- initPixelMap
- Page
- package.json
- vercel.json
- uae-paths.js

## God Nodes (most connected - your core abstractions)
1. `check_site()` - 15 edges
2. `Element` - 10 edges
3. `Page` - 7 edges
4. `initPixelMap()` - 6 edges
5. `schema_types()` - 4 edges
6. `main()` - 4 edges
7. `SEOCheckTest` - 4 edges
8. `renderMap()` - 3 edges
9. `referralClass()` - 2 edges
10. `summarizeMeasurement()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `check_site()` --calls--> `Page`  [EXTRACTED]
  scripts/seo_check.py → scripts/seo_check.py  _Bridges community 5 → community 0_

## Import Cycles
- None detected.

## Communities (9 total; all shown)

### Community 0 - "seo_check.py"
Cohesion: 0.19
Nodes (17): check_site(), reference(), main(), page_url(), reject_json_constant(), schema_types(), seo_check.py, Check static marketing HTML, crawl endpoints, local assets and JS syntax.… (+9 more)

### Community 1 - "check-measurement.cjs"
Cohesion: 0.17
Nodes (13): referralClass(), summarizeMeasurement(), check-measurement.cjs, assert, fs, path, script, SEARCH_HOSTS (+5 more)

### Community 2 - "Element"
Cohesion: 0.20
Nodes (10): Element, .addEventListener(), .append(), .blur(), .constructor(), .focus(), .querySelectorAll(), .replaceChildren() (+2 more)

### Community 3 - "test_seo_check.py"
Cohesion: 0.20
Nodes (10): SEOCheckTest, .test_current_site_passes(), .test_new_nested_page_must_have_self_canonical_sitemap_and_valid_links(), .test_rejects_broken_content_then_passes_after_repair(), test_seo_check.py, Run with: python3 scripts/test_seo_check.py (stdlib only; no live writes)., pathlib, shutil (+2 more)

### Community 4 - "initPixelMap"
Cohesion: 0.24
Nodes (10): initPixelMap(), getPathMetrics(), monolithEase(), renderMap(), spawnPulse(), updateMapLayout(), stopTypewriter(), streamWords() (+2 more)

### Community 5 - "Page"
Cohesion: 0.33
Nodes (6): Page, .handle_data(), .handle_endtag(), .handle_starttag(), .__init__(), HTMLParser

### Community 6 - "package.json"
Cohesion: 0.33
Nodes (6): package.json, description, name, private, scripts, dev

### Community 7 - "vercel.json"
Cohesion: 0.67
Nodes (3): vercel.json, buildCommand, installCommand

### Community 8 - "uae-paths.js"
Cohesion: 1.00
Nodes (2): uae-paths.js, UAE_PATHS

## Knowledge Gaps

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `check_site()` connect `seo_check.py` to `test_seo_check.py`, `Page`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `initPixelMap()` (e.g. with `main.js` and `getPathMetrics()`) actually correct?**
  _`initPixelMap()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Why does `Page` connect `Page` to `seo_check.py`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `Element` connect `Element` to `check-measurement.cjs`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
## Build scope

AST-only extraction of 15 code files. Documents and media were not semantically extracted. Community names use deterministic hub labels. No LLM or paid API calls were made.

Raw pre-build extraction diagnostics (not exported-graph counts): dangling_endpoint_edges=20, self_loop_edges=1, undirected_same_endpoint_collapsed_edges=13. During build, endpoints may be resolved or external import stubs created; edges whose endpoints remain unresolved are dropped and are absent from `graph.json`. The exported graph has no dangling endpoints.
