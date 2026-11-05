import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const graph = JSON.parse(read('graph.json'));
const html = read('graph.html');
const report = read('GRAPH_REPORT.md');
const literal = name => JSON.parse(html.match(new RegExp(`^const ${name} = (.*);$`, 'm'))[1]);
const nodes = literal('RAW_NODES');
const legend = literal('LEGEND');
assert.deepEqual(nodes.map(n => n.id).sort(), graph.nodes.map(n => n.id).sort());
assert(legend.length > 0);
assert.equal(legend.length, new Set(graph.nodes.map(n => n.community)).size);
assert(!/<script\b[^>]*\bsrc\s*=/i.test(html));
assert(html.includes('vis-network@9.1.6/standalone/umd/vis-network.min.js'));
const functionSource = html.match(/function matchesVisibleSearch\(n, q\) \{[\s\S]*?\n\}/)[0];
const hiddenCommunities = new Set([1]);
const matches = vm.runInNewContext(`(${functionSource})`, { hiddenCommunities });
assert.equal(matches({ label: 'SearchService', community: 1 }, 'search'), false);
assert.equal(matches({ label: 'SearchService', community: 2 }, 'search'), true);
assert.equal(matches({ label: 'Other', community: 2 }, 'search'), false);
assert.equal(matches({ label: 'SearchService', community: 1 }, ''), false);
assert(html.includes('RAW_NODES.filter(n => matchesVisibleSearch(n, q))'));
assert(/el.onclick = \(\) => \{\s*if \(hiddenCommunities.has\(n.community\)\) return;/.test(html));
assert(/function updateSelectAllState\(\) \{\s*searchInput.dispatchEvent\(new Event\('input'\)\);/.test(html));
assert.equal((report.match(/^### Community /gm) || []).length, legend.length);
assert(!report.includes('thin omitted'));
assert(/Extraction: \d+\.\d% EXTRACTED · \d+\.\d% INFERRED · \d+\.\d% AMBIGUOUS/.test(report));
assert(report.includes('git diff --name-only '));
assert(report.includes(':(exclude)graphify-out/**'));
assert(!report.includes('Run `git rev-parse HEAD`'));
if (new URL('../', import.meta.url).pathname.endsWith('/salon-booking-saas/')) {
  assert(!graph.nodes.some(n => /^output\//.test(n.source_file || '')));
}
const ids = new Set(graph.nodes.map(n => n.id));
assert((graph.links || graph.edges).every(e => ids.has(e.source) && ids.has(e.target)));
console.log(`PASS graph: ${nodes.length} nodes, ${legend.length} communities; offline bundle, hidden-search/filter/selection, report and endpoint checks; HTML ${statSync(new URL('graph.html', import.meta.url)).size} bytes`);
