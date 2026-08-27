/**
 * OLD vs NEW, same page, same viewport, same steps.
 *
 *   node compare.mjs <path> [--w 375] [--scroll 2000] [--shots] [--sel "#wheel .slab,..."]
 *
 * <path> is the OLD path (e.g. /projects/). The NEW path is derived by dropping
 * "index.html"/".html", because the rebuild serves extensionless routes as well.
 */
import { chromium } from 'playwright';
import { prepare, measure } from './probe.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const OLD_ORIGIN = 'http://localhost:8099';
const NEW_ORIGIN = 'http://localhost:3000';

const argv = process.argv.slice(2);
const path = argv[0] || '/';
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i === -1 ? d : argv[i + 1]; };
const has = (n) => argv.includes('--' + n);

const W = Number(flag('w', 1440));
const H = Number(flag('h', 900));
const SCROLL = flag('scroll', null) === null ? null : Number(flag('scroll', 0));
const SHOTS = has('shots');
const OUT = flag('out', `${process.cwd()}/out`);
const SELECTORS = (flag('sel', '') || '').split(',').map((s) => s.trim()).filter(Boolean);

const newPath = path.replace(/index\.html$/, '').replace(/\.html$/, '');

function alignDiff(a, b, idOf, keyOf, label) {
  // Match on a stable identity (tag+class+text) so a re-ordered or inserted
  // node reports as ORDER/ONLY-ON-*, never as N bogus property diffs.
  const out = [];
  const bById = new Map();
  b.forEach((y, i) => { const k = idOf(y); if (!bById.has(k)) bById.set(k, []); bById.get(k).push({ y, i }); });
  const usedB = new Set();
  a.forEach((x, i) => {
    const k = idOf(x);
    const bucket = bById.get(k);
    const hit = bucket && bucket.find((c) => !usedB.has(c.i));
    if (!hit) { out.push(`${label} ONLY-ON-OLD  ${keyOf(x)}`); return; }
    usedB.add(hit.i);
    const kx = keyOf(x), ky = keyOf(hit.y);
    if (kx !== ky) out.push(`${label} PROP-DIFF\n    OLD ${kx}\n    NEW ${ky}`);
    else if (hit.i !== i) out.push(`${label} ORDER old#${i} -> new#${hit.i}  ${k}`);
  });
  b.forEach((y, i) => { if (!usedB.has(i)) out.push(`${label} ONLY-ON-NEW  ${keyOf(y)}`); });
  return out;
}

const browser = await chromium.launch();
const results = {};
for (const [name, origin, p] of [['old', OLD_ORIGIN, path], ['new', NEW_ORIGIN, newPath]]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e).slice(0, 160)));
  const resp = await page.goto(origin + p, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((e) => ({ status: () => 'ERR ' + e.message.slice(0, 80) }));
  await page.waitForTimeout(1500);            // let fonts + first paint settle
  await prepare(page, { scroll: SCROLL });
  const m = await measure(page, SELECTORS);
  m.status = typeof resp?.status === 'function' ? resp.status() : '?';
  m.consoleErrors = errors.slice(0, 8);
  if (SHOTS) {
    mkdirSync(OUT, { recursive: true });
    const tag = `${path.replace(/[^a-z0-9]+/gi, '_')}_${W}${SCROLL !== null ? '_s' + SCROLL : ''}`;
    await page.screenshot({ path: `${OUT}/${tag}__${name}.png`, fullPage: SCROLL === null });
  }
  results[name] = m;
  await ctx.close();
}
await browser.close();

const o = results.old, n = results.new;
const lines = [];
lines.push(`PATH  old=${path}  new=${newPath}   viewport ${W}x${H}${SCROLL !== null ? `  scrollY=${SCROLL}` : ''}`);
lines.push(`status   OLD ${o.status}   NEW ${n.status}`);
lines.push(`title    ${o.title === n.title ? 'SAME' : `\n    OLD ${o.title}\n    NEW ${n.title}`}`);
lines.push(`docH     OLD ${o.docH}   NEW ${n.docH}   ${o.docH === n.docH ? 'SAME' : `DELTA ${n.docH - o.docH}`}`);

if (SELECTORS.length) {
  lines.push('\nCOUNTS');
  for (const s of SELECTORS) {
    const a = o.counts[s], b = n.counts[s];
    lines.push(`  ${a === b ? 'ok  ' : 'DIFF'} ${s}  old=${a} new=${b}`);
  }
  const gA = o.probeHeights || {}, gB = n.probeHeights || {};
  for (const k of Object.keys(gA)) {
    lines.push(`  ${gA[k] === gB[k] ? 'ok  ' : 'DIFF'} height(${k})  old=${gA[k]} new=${gB[k]}`);
  }
}

const hId  = (x) => `${x.tag}.${x.cls}|${x.text}`;
const hKey = (x) => `${x.tag}.${x.cls} "${x.text}" fs=${x.fs} lh=${x.lh} fw=${x.fw} ls=${x.ls} ff=${x.ff} tt=${x.tt} w=${x.w}`;
const hDiffs = alignDiff(o.headings, n.headings, hId, hKey, 'heading');
lines.push(`\nHEADINGS  old=${o.headings.length} new=${n.headings.length}  diffs=${hDiffs.length}`);
hDiffs.slice(0, 40).forEach((d) => lines.push('  ' + d));

const bId  = (x) => `${x.tag}.${x.cls}|${x.text}`;
const bKey = (x) => `${x.tag}.${x.cls} "${x.text}" fs=${x.fs} lh=${x.lh}`;
const bDiffs = alignDiff(o.body, n.body, bId, bKey, 'body');
lines.push(`\nBODY TEXT  diffs=${bDiffs.length}`);
bDiffs.slice(0, 25).forEach((d) => lines.push('  ' + d));

const ids = [...new Set([...Object.keys(o.sections), ...Object.keys(n.sections)])];
const sDiffs = [];
for (const id of ids) {
  const a = o.sections[id], b = n.sections[id];
  if (!a) { sDiffs.push(`  #${id} ONLY-ON-NEW ${JSON.stringify(b)}`); continue; }
  if (!b) { sDiffs.push(`  #${id} ONLY-ON-OLD ${JSON.stringify(a)}`); continue; }
  if (JSON.stringify(a) !== JSON.stringify(b)) sDiffs.push(`  #${id}  old=[x,y,w,h]${JSON.stringify(a)}  new=${JSON.stringify(b)}`);
}
lines.push(`\nSECTION GEOMETRY  diffs=${sDiffs.length}`);
sDiffs.slice(0, 30).forEach((d) => lines.push(d));

if (n.consoleErrors.length || o.consoleErrors.length) {
  lines.push('\nCONSOLE ERRORS');
  o.consoleErrors.forEach((e) => lines.push('  OLD ' + e));
  n.consoleErrors.forEach((e) => lines.push('  NEW ' + e));
}

const text = lines.join('\n');
console.log(text);
if (has('json')) { mkdirSync(OUT, { recursive: true }); writeFileSync(`${OUT}/last.json`, JSON.stringify(results, null, 1)); }
