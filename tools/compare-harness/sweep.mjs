/**
 * Sweep a representative page set across the three device bands, OLD vs NEW.
 *
 *   node sweep.mjs [--bands 375,900,1440] [--pages a,b,c] [--full]
 *
 * Bands matter: the site has three, at 720 / 721 / 1120 / 1121. 375 is phone,
 * 900 is tablet, 1440 is desktop. Never widen a phone rule by copying it.
 */
import { chromium } from 'playwright';
import { prepare, measure } from './probe.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const OLD = 'http://localhost:8099', NEW = 'http://localhost:3000';
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i === -1 ? d : argv[i + 1]; };

const BANDS = (flag('bands', '375,900,1440')).split(',').map(Number);
const DEFAULT_PAGES = [
  '/', '/about/', '/contact/', '/estimate/', '/projects/', '/trade/',
  '/services/', '/services/kitchen-worktops.html', '/services/outdoor-kitchens.html',
  '/stones/', '/stones/compare.html', '/materials/', '/guides/',
  '/worktops/', '/worktops/hertfordshire/st-albans/', '/privacy/', '/terms/', '/sitemap.html',
];
const PAGES = (flag('pages', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const LIST = PAGES.length ? PAGES : DEFAULT_PAGES;

const SEL = ['#wheel .slab', '.gal-card', '.rev-deck .rev', '#projHeroBg .phb-slide',
             '.svc-card', '.stone-tile', 'a[href]', 'img', 'form', 'button'];

const hId = x => `${x.tag}.${x.cls}|${x.text}`;
const hKey = x => `fs=${x.fs} lh=${x.lh} fw=${x.fw} ls=${x.ls} ff=${x.ff} tt=${x.tt}`;
const hKeyW = x => `${hKey(x)} w=${x.w}`;

function align(a, b, idOf) {
  const map = new Map();
  b.forEach((y, i) => { const k = idOf(y); (map.get(k) ?? map.set(k, []).get(k)).push({ y, i }); });
  const used = new Set(); const pairs = []; const onlyOld = []; const onlyNew = [];
  a.forEach(x => {
    const bucket = map.get(idOf(x));
    const hit = bucket && bucket.find(c => !used.has(c.i));
    if (!hit) { onlyOld.push(x); return; }
    used.add(hit.i); pairs.push([x, hit.y]);
  });
  b.forEach((y, i) => { if (!used.has(i)) onlyNew.push(y); });
  return { pairs, onlyOld, onlyNew };
}

const browser = await chromium.launch();
const report = [];
const rows = [];

for (const w of BANDS) {
  const h = w < 720 ? 812 : 900;
  for (const p of LIST) {
    const newPath = p.replace(/index\.html$/, '').replace(/\.html$/, '');
    const got = {};
    for (const [name, origin, path] of [['old', OLD, p], ['new', NEW, newPath]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', e => errs.push(String(e).slice(0, 120)));
      let status = 'ERR';
      try {
        const r = await page.goto(origin + path, { waitUntil: 'domcontentloaded', timeout: 40000 });
        status = r ? r.status() : '?';
        await page.waitForTimeout(1400);
        await prepare(page);
        got[name] = await measure(page, SEL);
        got[name].status = status; got[name].errs = errs;
      } catch (e) {
        got[name] = { status, fatal: String(e).slice(0, 120), headings: [], body: [], counts: {}, sections: {}, docH: 0, probeHeights: {}, errs };
      }
      await ctx.close();
    }
    const o = got.old, n = got.new;
    const issues = [];
    if (o.status !== n.status) issues.push(`STATUS old=${o.status} new=${n.status}`);
    if (n.fatal) issues.push(`NEW FATAL ${n.fatal}`);
    for (const s of SEL) if (o.counts[s] !== n.counts[s]) issues.push(`count ${s}: old=${o.counts[s]} new=${n.counts[s]}`);
    for (const k of Object.keys(o.probeHeights || {})) {
      if (o.probeHeights[k] !== (n.probeHeights || {})[k]) issues.push(`h(${k}) old=${o.probeHeights[k]} new=${(n.probeHeights||{})[k]}`);
    }
    const { pairs, onlyOld, onlyNew } = align(o.headings, n.headings, hId);
    const typeDiffs = pairs.filter(([x, y]) => hKey(x) !== hKey(y));
    const widthDiffs = pairs.filter(([x, y]) => hKey(x) === hKey(y) && Math.abs(x.w - y.w) > 4);
    if (typeDiffs.length) issues.push(`TYPE ${typeDiffs.length}: ` + typeDiffs.slice(0, 4).map(([x, y]) => `"${x.text}" ${hKey(x)} -> ${hKey(y)}`).join(' ;; '));
    if (widthDiffs.length) issues.push(`WIDTH ${widthDiffs.length}: ` + widthDiffs.slice(0, 4).map(([x, y]) => `"${x.text}" ${x.w}->${y.w}`).join(' ;; '));
    if (onlyOld.length) issues.push(`headingsOnlyOld ${onlyOld.length}: ` + onlyOld.slice(0, 4).map(x => `${x.tag}.${x.cls} "${x.text}"`).join(' ;; '));
    if (onlyNew.length) issues.push(`headingsOnlyNew ${onlyNew.length}: ` + onlyNew.slice(0, 4).map(x => `${x.tag}.${x.cls} "${x.text}"`).join(' ;; '));

    const bAl = align(o.body, n.body, hId);
    const bType = bAl.pairs.filter(([x, y]) => x.fs !== y.fs || x.lh !== y.lh);
    if (bType.length) issues.push(`BODYTYPE ${bType.length}: ` + bType.slice(0, 4).map(([x, y]) => `"${x.text}" ${x.fs}/${x.lh} -> ${y.fs}/${y.lh}`).join(' ;; '));

    const dh = (n.docH || 0) - (o.docH || 0);
    if (Math.abs(dh) > 40) issues.push(`docH old=${o.docH} new=${n.docH} delta=${dh}`);
    if ((n.errs || []).length) issues.push(`pageerror NEW: ${n.errs[0]}`);

    rows.push({ w, p, n: issues.length });
    if (issues.length) report.push(`\n=== ${p}   @${w}px ===\n` + issues.map(i => '  - ' + i).join('\n'));
    process.stderr.write(`${w}px ${p} -> ${issues.length}\n`);
  }
}
await browser.close();
mkdirSync(`${process.cwd()}/out`, { recursive: true });
const text = report.join('\n') || 'NO DIFFERENCES';
writeFileSync(`${process.cwd()}/out/sweep.txt`, text);
console.log('\n===== SUMMARY (issue count per page/band) =====');
for (const r of rows) console.log(`  ${String(r.w).padStart(4)}px  ${r.n === 0 ? ' ok ' : String(r.n).padStart(3) + ' '}  ${r.p}`);
console.log(`\nFull detail written to out/sweep.txt (${text.length} bytes)`);
