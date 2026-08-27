/**
 * THE END-OF-FILM JUMP, natural-scroll path (the one the client actually uses).
 *
 * SETTLE_MS is 220 and every onScroll re-arms it, so lockFilm() fires 220ms
 * after the visitor STOPS — which can be long after they have scrolled out of
 * the runway and into the reviews. lockFilm() then collapses the runway and
 * does scrollTo(scrollY - travel) in the same tick. This scrolls through the
 * whole film without stopping, carries on into the reviews, then stops and
 * watches what the settle does. System Chrome.
 */
import { chromium } from 'playwright';

const W = +(process.argv[2] || 1440), H = +(process.argv[3] || 900);
const STEP = +(process.argv[4] || 600), GAP = +(process.argv[5] || 90);

const b = await chromium.launch({ channel: 'chrome' });
const page = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.addInitScript(() => {
  window.__log = [];
  const st = window.scrollTo.bind(window);
  window.scrollTo = function (...a) {
    const top = typeof a[0] === 'object' ? a[0].top : a[1];
    window.__log.push({ t: Math.round(performance.now()), kind: 'scrollTo', from: Math.round(window.scrollY), to: Math.round(top) });
    return st(...a);
  };
});
await page.goto('http://localhost:3000/', { waitUntil: 'load' });
await page.waitForTimeout(1800);

const runway = await page.evaluate(() => {
  const c = document.getElementById('cine');
  return { cineH: c ? c.offsetHeight : -1, vp: innerHeight, doc: document.body.scrollHeight };
});
console.log(`runway ${runway.cineH}px, viewport ${runway.vp}, travel ~${runway.cineH - runway.vp}`);

// Scroll continuously through the film and straight on into the reviews.
const trace = [];
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel(0, STEP);
  await page.waitForTimeout(GAP);
  const s = await page.evaluate(() => ({ y: Math.round(window.scrollY), done: document.documentElement.classList.contains('cine-done') }));
  trace.push(`${s.y}${s.done ? '*' : ''}`);
  if (s.done && i > 2) break;          // locked mid-scroll: stop and look
}
console.log('during scroll:', trace.join(' '));

const before = await page.evaluate(() => ({ y: Math.round(window.scrollY), done: document.documentElement.classList.contains('cine-done') }));
// what is under the middle of the viewport right now?
const beforeText = await page.evaluate(() => (document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.textContent || '').trim().slice(0, 60));
await page.waitForTimeout(1600);       // let the 220ms settle fire, and then some
const after = await page.evaluate(() => ({ y: Math.round(window.scrollY), done: document.documentElement.classList.contains('cine-done') }));
const afterText = await page.evaluate(() => (document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.textContent || '').trim().slice(0, 60));

console.log(`\nbefore settle  scrollY=${before.y}  cine-done=${before.done}  centre="${beforeText}"`);
console.log(`after  settle  scrollY=${after.y}  cine-done=${after.done}  centre="${afterText}"`);
console.log(`\nscrollTo calls:`);
for (const e of await page.evaluate(() => window.__log)) console.log(`  ${String(e.t).padStart(6)}ms  ${e.from} -> ${e.to}`);
await page.screenshot({ path: 'out/endjump-after.png' });
await b.close();
