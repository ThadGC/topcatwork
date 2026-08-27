/**
 * ANIMATION AUDIT — does this element MOVE on old but sit still on new?
 *
 * For every element we record (transform, opacity) twice: once while its
 * section is far below the fold ("parked"), once with the section scrolled to
 * a fixed offset ("arrived"). Identical cadence on both builds — the handover
 * records a false finding caused purely by scrolling them at different speeds.
 *
 * OLD moves (parked != arrived) and NEW does not  ->  entrance never ported.
 *
 *   node anim-audit.mjs [path] [width]
 */
import { chromium } from 'playwright';
import { prepare } from './probe.mjs';

const PATH = process.argv[2] || '/';
const W = Number(process.argv[3] || 1440);
const newPath = PATH.replace(/index\.html$/, '').replace(/\.html$/, '');

const KEY = `(e)=>{const id=e.id?'#'+e.id:'';
  const cls=(e.className||'').toString().trim().split(/\\s+/).filter(Boolean).slice(0,3).join('.');
  const sec=e.closest('section[id]')?.id||'';
  return sec+'|'+e.tagName+id+(cls?'.'+cls:'');}`;

async function run(origin, path) {
  const ctx = await browser.newContext({ viewport: { width: W, height: W < 720 ? 812 : 900 } });
  const page = await ctx.newPage();
  await page.goto(origin + path, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(1500);
  await prepare(page);

  const grab = () => page.evaluate((ks) => {
    const key = eval(ks);
    const m = {};
    for (const e of document.querySelectorAll('body *')) {
      const c = getComputedStyle(e);
      const k = key(e);
      if (k in m) continue;                       // first of each kind is enough
      m[k] = c.transform.slice(0, 60) + ' | op=' + Number(c.opacity).toFixed(2) + ' | cp=' + c.clipPath.slice(0, 30);
    }
    return m;
  }, KEY);

  // sections, top to bottom, each brought to the SAME offset
  const secs = await page.evaluate(() => [...document.querySelectorAll('section[id]')].map((s) => s.id));
  const parked = await grab();
  const arrived = {};
  for (const id of secs) {
    await page.evaluate((i) => { const e = document.getElementById(i); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 150); }, id);
    await page.waitForTimeout(1100);
    const g = await grab();
    for (const [k, v] of Object.entries(g)) if (k.startsWith(id + '|')) arrived[k] = v;
  }
  await ctx.close();
  return { parked, arrived, secs };
}

const browser = await chromium.launch();
const o = await run('http://localhost:8099', PATH);
const n = await run('http://localhost:3000', newPath);
await browser.close();

const moved = (s, k) => s.parked[k] !== undefined && s.arrived[k] !== undefined && s.parked[k] !== s.arrived[k];
const keys = Object.keys(o.arrived);
const missing = [], differs = [];
for (const k of keys) {
  const oMoved = moved(o, k);
  const nHas = n.arrived[k] !== undefined;
  if (!nHas) continue;                            // element genuinely absent -> other checks cover it
  const nMoved = moved(n, k);
  if (oMoved && !nMoved) missing.push(k);
  else if (oMoved && nMoved && o.arrived[k] !== n.arrived[k]) differs.push(k);
}
console.log(`ANIMATION AUDIT  ${PATH} @${W}px   (sections: ${o.secs.join(', ')})\n`);
console.log(`MOVES ON OLD, STATIC ON NEW  (${missing.length})`);
for (const k of missing) {
  console.log(`  ${k}`);
  console.log(`      OLD parked  ${o.parked[k]}`);
  console.log(`      OLD arrived ${o.arrived[k]}`);
  console.log(`      NEW parked  ${n.parked[k]}`);
  console.log(`      NEW arrived ${n.arrived[k]}`);
}
console.log(`\nBOTH MOVE BUT REST DIFFERS  (${differs.length})`);
for (const k of differs.slice(0, 15)) console.log(`  ${k}\n      OLD ${o.arrived[k]}\n      NEW ${n.arrived[k]}`);
