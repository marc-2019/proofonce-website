// ProofOnce site smoke checks: `node --test tests/smoke_site.mjs` (Node >= 22.18 / 23.6, which can import .ts).
// Optional live check (read-only GETs, never POST): LIVE=1 BASE_URL=https://<preview>.pages.dev node --test tests/smoke_site.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const SURFACES = ['index.html', 'llms.txt', 'robots.txt'];

const BANNED = [
  ['identity verification category claim', /identity verification/i],
  ['verified / certified guarantee', /\b(guaranteed|certified|certification|tamper-?proof|legally binding|government[- ]approved|bank-grade)\b/i],
  ['AI-powered', /AI[- ]powered/i],
  ['enterprise-grade', /enterprise[- ]grade/i],
  ['testimonials / trusted by', /testimonial|trusted by/i],
  ['prices (pre-launch)', /NZ\$\s?\d|\$\s?\d+(\.\d\d)?\b|per month|\/mo\b/i],
  ['Southeast Asia', /Southeast Asia/i],
  ['invented percentage stat', /\b\d{1,3}\s?%\s+(of|faster|less|more)/i],
];

for (const f of SURFACES) {
  test(`${f}: banned claims absent`, () => {
    const t = read(f);
    const hits = BANNED.filter(([, re]) => re.test(t)).map(([n]) => n);
    assert.deepEqual(hits, [], `${f}: ${hits.join(', ')}`);
  });
}

test('coming-soon framing kept', () => {
  assert.match(read('index.html'), /Coming Soon/);
  assert.match(read('llms.txt'), /pre-launch/i);
});

const BLOCKED = [
  '/.gitignore', '/.nojekyll', '/.git-hooks/README.md', '/.git-hooks/brand-name-dictionary.json',
  '/marketing-truths.json', '/docs/product/proofonce-product-design-2026-07-08.md',
  '/docs/product/proofonce-nemo-build-plan-2026-07-08.md', '/docs/ops/land-probe-2026-08-30.md',
  '/tests/smoke_site.mjs', '/functions/_middleware.ts', '/_routes.json',
  // encoded / case / traversal variants
  '/%2egitignore', '/%252egitignore', '/%6Darketing-truths.json', '/%6darketing-truths.json',
  '/%64ocs/product/proofonce-product-design-2026-07-08.md', '/docs%2Fops%2Fland-probe-2026-08-30.md',
  '/.GIT-HOOKS/README.md', '/MARKETING-TRUTHS.JSON', '/css/..%2f.gitignore', '/x/../.gitignore',
];
const PUBLIC = ['/', '/index.html', '/llms.txt', '/robots.txt', '/css/style.css'];

test('middleware blocks every repo-only path and encoded variant, passes public pages', async () => {
  const m = await import('../functions/_middleware.ts');
  for (const p of BLOCKED) assert.equal(m.isBlocked(p), true, `not blocked: ${p}`);
  for (const p of PUBLIC) assert.equal(m.isBlocked(p), false, `wrongly blocked: ${p}`);
});

test('_routes.json sends everything except exact public files through the middleware', () => {
  const r = JSON.parse(read('_routes.json'));
  assert.deepEqual(r.include, ['/*']);
  for (const e of r.exclude) assert.ok(!e.includes('*'), `wildcard exclude can bypass the middleware: ${e}`);
});

test('live: blocked paths 404, public pages 200', { skip: process.env.LIVE !== '1' }, async () => {
  const base = process.env.BASE_URL || 'https://proofonce.com';
  for (const p of BLOCKED) {
    const r = await fetch(base + p, { redirect: 'manual' });
    assert.equal(r.status, 404, `${p} -> ${r.status}`);
  }
  for (const p of PUBLIC) {
    const r = await fetch(base + p);
    assert.equal(r.status, 200, `${p} -> ${r.status}`);
  }
});
