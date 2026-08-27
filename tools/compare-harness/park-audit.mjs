/**
 * THE PARK AUDIT — find unported scroll-entrance animations.
 *
 * An entrance animation shows up as a "parked" state: before the section is
 * scrolled into view the element sits at some transform / opacity < 1, and it
 * settles to rest as it enters. If OLD parks an element and NEW does not, the
 * entrance was never ported and the element simply appears already-arrived.
 *
 *   node park-audit.mjs [path] [width]
 */
import { chromium } from 'playwright';
import { prepare } from './probe.mjs';

const PATH = process.argv[2] || '/';
const W = Number(process.argv[3] || 1440);
const newPath = PATH.replace(/index\.html$/, '').replace(/\.html$/, '');

const snap = async (origin, path) => {
  const ctx = await browser.newContext({ viewport: { width: W, height: W < 720 ? 812 : 900 } });
  const page = await ctx.newPage();
  await page.goto(origin + path, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(1500);
  await prepare(page);                       // skips the cine intro, kills smooth scroll
  const data = await page.evaluate(() => {
    const key = (e) => {
      const id = e.id ? '#' + e.id : '';
      const cls = (e.className || '').toString().trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
      const sec = e.closest('section[id]')?.id || e.closest('[id]')?.id || '';
      return `${sec}|${e.tagName}${id}${cls ? '.' + cls : ''}`;
    };
    const out = new Map();
    for (const e of document.querySelectorAll('body *')) {
      const c = getComputedStyle(e);
      const parked = (c.transform && c.transform !== 'none') || Number(c.opacity) < 0.99 ||
                     (c.clipPath && c.clipPath !== 'none');
      if (!parked) continue;
      const k = key(e);
      if (!out.has(k)) out.set(k, { k, transform: c.transform.slice(0, 70), opacity: c.opacity, clip: c.clipPath.slice(0, 40), n: 0 });
      out.get(k).n++;
    }
    return [...out.values()];
  });
  await ctx.close();
  return data;
};

const browser = await chromium.launch();
const [o, n] = await Promise.all([snap('http://localhost:8099', PATH), snap('http://localhost:3000', newPath)]);
await browser.close();

const nMap = new Map(n.map((x) => [x.k, x]));
const oMap = new Map(o.map((x) => [x.k, x]));

const lost = o.filter((x) => {
  const y = nMap.get(x.k);
  if (!y) return true;                                   // not parked at all on new
  return y.transform === 'none' && Number(y.opacity) >= 0.99 && x.transform !== 'none';
});
const extra = n.filter((x) => !oMap.has(x.k));

console.log(`PARK AUDIT  ${PATH} @${W}px`);
console.log(`  old parked: ${o.length} distinct   new parked: ${n.length} distinct\n`);
console.log(`ENTRANCE PRESENT ON OLD, ABSENT ON NEW  (${lost.length})`);
for (const x of lost) {
  const y = nMap.get(x.k);
  console.log(`  ${x.k}  x${x.n}`);
  console.log(`      OLD transform=${x.transform} opacity=${x.opacity}${x.clip !== 'none' ? ' clip=' + x.clip : ''}`);
  console.log(`      NEW ${y ? `transform=${y.transform} opacity=${y.opacity}` : '(not parked / element absent)'}`);
}
console.log(`\nPARKED ONLY ON NEW  (${extra.length})`);
for (const x of extra.slice(0, 20)) console.log(`  ${x.k} x${x.n}  transform=${x.transform} opacity=${x.opacity}`);
