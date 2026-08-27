#!/usr/bin/env node
/**
 * verify.mjs — prove the extraction is complete.
 *
 *   node web/scripts/verify.mjs
 *
 * Three checks, all driven off the source HTML rather than the parser:
 *
 *  1. PAGE COVERAGE  every .html under stones/ services/ guides/ materials/
 *     and every index.html under worktops/ maps to exactly one JSON record.
 *
 *  2. COPY COVERAGE  every distinct run of visible text inside <main> on every
 *     source page appears in that page's JSON record. Site chrome (header,
 *     nav, footer, mobile bar, the enquiry <form>) is excluded: it is byte
 *     identical on every page and belongs in the layout, not the data.
 *
 *  3. STRUCTURAL ASSERTIONS  shape checks on the records themselves.
 *
 * Exits non-zero on any miss.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse, firstTag, attr, decodeEntities } from './lib/minidom.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DATA = path.resolve(HERE, '..', 'src', 'data');

const norm = (s) => decodeEntities(s ?? '').replace(/\s+/g, ' ').trim();

/**
 * The source frequently runs two fields together with no whitespace
 * (`<li><strong>Title</strong>body</li>`), while the record splits them into
 * separate keys. Comparing with whitespace removed makes the check immune to
 * that without weakening it: every character of the source copy must still be
 * present, in order.
 */
const despace = (s) => s.replace(/\s+/g, '');

/* Elements whose text reads as one unit of copy. */
const LEAF = new Set([
  'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'dt', 'dd', 'td', 'th',
  'summary', 'caption', 'figcaption', 'button', 'a', 'span', 'strong', 'em', 'b',
]);
/*
 * Chrome and non-copy subtrees. `footer` is here because services/index.html
 * closes </main> *after* the site footer, so the footer's copy would otherwise
 * be counted as page content.
 */
const SKIP = new Set([
  'script', 'style', 'svg', 'nav', 'form', 'aside', 'noscript', 'template', 'footer',
]);

/** Decorative, screen-reader-hidden glyphs (chevrons, stars) are not copy. */
const decorative = (node) => attr(node, 'aria-hidden') === 'true';

/** Every meaningful text run inside <main>, excluding chrome. */
function copyUnits(html) {
  const root = parse(html);
  const main = firstTag(root, 'main');
  if (!main) return [];
  const units = new Set();
  const keep = (t) => { if (t.length >= 4 && /[a-z]{3}/i.test(t)) units.add(t); };

  const rec = (node) => {
    for (const child of node.children ?? []) {
      if (child.type === 'text') { if (!child.raw) keep(norm(child.value)); continue; }
      if (child.type !== 'element') continue;
      if (SKIP.has(child.tag) || decorative(child)) continue;
      // Whole-node text too, so a sentence broken by inline <em>/<a> is
      // checked as one string rather than three fragments.
      if (LEAF.has(child.tag)) keep(norm(allText(child)));
      rec(child);
    }
  };
  rec(main);
  return [...units];
}

function allText(node) {
  let out = '';
  const rec = (n) => {
    for (const c of n.children ?? []) {
      if (c.type === 'text') { if (!c.raw) out += decodeEntities(c.value); }
      else if (c.type === 'element' && !SKIP.has(c.tag) && !decorative(c)) rec(c);
    }
  };
  rec(node);
  return out;
}

/** Strings that are addresses/asset paths, not copy. */
const URLISH = /^(https?:|tel:|mailto:|[/#]|[\w-]+\.(html|webp|jpe?g|png|svg|css|js)\b)/i;

/**
 * Keys holding structure rather than copy. They are skipped so two adjacent
 * runs of prose in a record stay adjacent in the haystack: without this,
 * { type, classes, text } would wedge "text span r-score" between the two
 * halves of a sentence the source renders as one run.
 */
const STRUCT_KEYS = new Set([
  'type', 'tag', 'classes', 'kind', 'region', 'level', 'variant', 'id', 'slug',
  'source', 'url', 'href', 'src', 'srcset', 'sizes', 'loading', 'decoding',
  'width', 'height', 'descriptor', 'style', 'background', 'canonical',
  'robots', 'family', 'path', 'county', 'town', '$source', '$generator',
]);

/**
 * Flatten a JSON record into one haystack string. URLs are dropped: in an
 * object like { title, body, href } the href sits between two runs of prose
 * that the source renders contiguously, and would otherwise break the match.
 */
function haystack(value) {
  const parts = [];
  const rec = (v) => {
    if (v == null) return;
    if (typeof v === 'string') { if (!URLISH.test(v.trim())) parts.push(v); return; }
    if (typeof v === 'number' || typeof v === 'boolean') { parts.push(String(v)); return; }
    if (Array.isArray(v)) { v.forEach(rec); return; }
    if (typeof v === 'object') {
      for (const [k, val] of Object.entries(v)) if (!STRUCT_KEYS.has(k)) rec(val);
    }
  };
  rec(value);
  return norm(parts.join(' '));
}

/* ------------------------------------------------------------------------ */

const load = (name) => JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));

const stones = load('stones.json');
const services = load('services.json');
const guides = load('guides.json');
const materials = load('materials.json');
const locations = load('locations.json');

/** source-path -> record */
const bySource = new Map();
const add = (rec) => { if (rec?.source) bySource.set(rec.source, rec); };

stones.stones.forEach(add);
add(stones.collection);
add(stones.compare.page);
services.services.forEach(add);
add(services.index);
guides.guides.forEach(add);
add(guides.index);
materials.materials.forEach(add);
add(materials.index);
locations.locations.forEach(add);
add(locations.index);

/* --- check 1: page coverage --------------------------------------------- */

function listHtml(dir) {
  return fs.readdirSync(path.join(REPO, dir))
    .filter((f) => f.endsWith('.html'))
    .map((f) => `${dir}/${f}`);
}
function listIndexes(dir) {
  const out = [];
  const walkDir = (rel) => {
    for (const e of fs.readdirSync(path.join(REPO, rel), { withFileTypes: true })) {
      const child = `${rel}/${e.name}`;
      if (e.isDirectory()) walkDir(child);
      else if (e.name === 'index.html') out.push(child);
    }
  };
  walkDir(dir);
  return out;
}

const expected = [
  ...listHtml('stones'), ...listHtml('services'), ...listHtml('guides'),
  ...listHtml('materials'), ...listIndexes('worktops'),
].sort();

const missingPages = expected.filter((f) => !bySource.has(f));
const extraPages = [...bySource.keys()].filter((f) => !expected.includes(f));

/* --- check 2: copy coverage --------------------------------------------- */

const copyMisses = [];
let unitsChecked = 0;
let exactHits = 0;

for (const rel of expected) {
  const rec = bySource.get(rel);
  if (!rec) continue;
  const hay = norm(haystack(rec));
  const hayTight = despace(hay);
  const units = copyUnits(fs.readFileSync(path.join(REPO, rel), 'utf8'));
  unitsChecked += units.length;
  const missed = [];
  for (const u of units) {
    if (hay.includes(u)) { exactHits++; continue; }
    if (hayTight.includes(despace(u))) continue;
    missed.push(u);
  }
  if (missed.length) copyMisses.push({ page: rel, missed });
}

/* --- check 3: structural assertions -------------------------------------- */

const structural = [];
const check = (ok, msg) => { if (!ok) structural.push(msg); };

check(stones.stones.length === 132, `expected 132 stones, got ${stones.stones.length}`);
check(stones.stones.every((s) => s.slug && s.name && s.family && s.finish),
  'a stone is missing slug/name/family/finish');
check(stones.stones.every((s) => s.hero?.image?.src && (s.hero.image.srcset?.length ?? 0) === 2),
  'a stone is missing its hero image or its two srcset variants');
check(stones.stones.every((s) => s.facts.length >= 5), 'a stone has fewer than 5 spec rows');
check(stones.stones.every((s) => s.related.length === 3), 'a stone does not have 3 related links');
check(stones.stones.every((s) => s.related.every((r) => r.slug && r.href && r.image?.src && r.image.srcset?.length === 2)),
  'a related-stone link is missing slug/href/image/srcset');
check(stones.stones.every((s) => s.compare && s.taxonomy), 'a stone is missing compare/taxonomy data');
check(stones.stones.every((s) => s.sections.about?.paragraphs?.length === 2),
  'a stone About section does not have 2 paragraphs');
check(stones.stones.every((s) => s.estimator?.slug === s.slug),
  'a stone estimator deep-link slug does not match the page slug');
check(stones.stones.every((s) => s.compare.name === s.name),
  'a stone name disagrees with its CMP_DATA record');
check(stones.stones.every((s) => s.compare.finish === s.finish),
  'a stone finish disagrees with its CMP_DATA record');
{
  const slugs = new Set(stones.stones.map((s) => s.slug));
  const dangling = stones.stones.flatMap((s) => s.related.filter((r) => !slugs.has(r.slug)).map((r) => `${s.slug} -> ${r.slug}`));
  check(dangling.length === 0, `dangling related-stone links: ${dangling.join(', ')}`);
  const tiles = new Set(stones.collection.tiles.map((t) => t.slug));
  check(slugs.size === tiles.size && [...slugs].every((s) => tiles.has(s)),
    'stones/index.html tiles do not match the set of stone pages');
}

check(services.services.length === 9, `expected 9 services, got ${services.services.length}`);
check(services.services.every((s) => s.faq?.items.length > 0), 'a service has no FAQ items');
check(services.services.every((s) => s.hero?.background), 'a service has no hero background image');
check(services.services.every((s) => s.enquiryForm?.select?.options.length === 9),
  'a service enquiry form does not have 9 select options');

check(guides.guides.length === 9, `expected 9 guides, got ${guides.guides.length}`);
check(guides.guides.every((g) => g.faq?.items.length > 0), 'a guide has no FAQ items');
check(guides.guides.every((g) => g.blocks.some((b) => b.content.some((c) => c.type === 'byline'))),
  'a guide has no byline');
check(guides.guides.every((g) => g.blocks.some((b) => b.content.some((c) => c.type === 'relatedColumns'))),
  'a guide has no related columns');

check(materials.materials.length === 5, `expected 5 materials, got ${materials.materials.length}`);
check(materials.materials.every((m) => m.blocks.some((b) => b.content.some((c) => c.type === 'facts'))),
  'a material has no facts list');

check(locations.locations.length === 8, `expected 8 locations, got ${locations.locations.length}`);
check(locations.locations.every((l) => l.pricing?.rows.length === 4), 'a location has no 4-row pricing table');
check(locations.locations.every((l) => l.level && l.county), 'a location is missing level/county');
check(locations.locations.every((l) => l.areaChips.length > 0),
  'a location page has no area chips');
check(locations.locations.filter((l) => l.level === 'town').every((l) => l.nearby.length === 3),
  'a town page does not link 3 nearby towns');

/* --- report -------------------------------------------------------------- */

const ok = !missingPages.length && !extraPages.length && !copyMisses.length && !structural.length;

console.log('PAGE COVERAGE');
console.log(`  source pages expected : ${expected.length}`);
console.log(`  records produced      : ${bySource.size}`);
console.log(`  missing               : ${missingPages.length}${missingPages.length ? ' -> ' + missingPages.join(', ') : ''}`);
console.log(`  unexpected            : ${extraPages.length}${extraPages.length ? ' -> ' + extraPages.join(', ') : ''}`);
console.log('');
console.log('COPY COVERAGE (every visible text run inside <main>, chrome excluded)');
console.log(`  distinct text runs checked : ${unitsChecked}`);
console.log(`  matched verbatim           : ${exactHits}`);
console.log(`  matched ignoring spacing   : ${unitsChecked - exactHits - copyMisses.reduce((n, m) => n + m.missed.length, 0)}`);
console.log(`  pages with dropped copy    : ${copyMisses.length}`);
for (const m of copyMisses.slice(0, 20)) {
  console.log(`   - ${m.page}`);
  for (const s of m.missed.slice(0, 6)) console.log(`       MISSING: ${JSON.stringify(s.slice(0, 180))}`);
  if (m.missed.length > 6) console.log(`       ... and ${m.missed.length - 6} more`);
}
console.log('');
console.log('STRUCTURAL ASSERTIONS');
if (!structural.length) console.log('  all passed');
for (const s of structural) console.log(`  FAIL: ${s}`);
console.log('');
console.log(ok ? 'VERIFY: PASS' : 'VERIFY: FAIL');
if (!ok) process.exitCode = 1;
