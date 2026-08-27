/**
 * THE #hero / back-forward YANK.
 *
 * useHeroFilm.ts (~1461): when heroHash() or backToFinished() is true it binds
 *
 *   addEventListener('load', () => { skipToEnd(); setTimeout(skipToEnd, 160); })
 *
 * and skipToEnd() does scrollTo(top + travel) — the hero. Nothing checks
 * whether the visitor has scrolled away in the meantime, and window 'load'
 * fires only after every image and font. Scroll down before that and you are
 * yanked back to "Surfaces worth building around". Twice.
 */
import { chromium } from 'playwright';
const W = +(process.argv[2] || 1440), H = +(process.argv[3] || 900);
const URL = process.argv[4] || 'http://localhost:3000/#hero';

const b = await chromium.launch({ channel: 'chrome' });
const page = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.addInitScript(() => {
  window.__log = [];
  const st = window.scrollTo.bind(window);
  window.scrollTo = function (...a) {
    const top = typeof a[0] === 'object' ? a[0].top : a[1];
    window.__log.push({ t: Math.round(performance.now()), from: Math.round(window.scrollY), to: Math.round(top) });
    return st(...a);
  };
  addEventListener('load', () => window.__log.push({ t: Math.round(performance.now()), evt: 'window load' }));
});

// Hold ONE image so window 'load' lands late, the way it does on the real site
// (24 MB of film and 573 images). Locally it otherwise fires at ~240ms.
const DELAY = +(process.env.LOAD_DELAY_MS || 4000);
let held = 0;
await page.route('**/*.{webp,jpg,png}', async (route) => {
  if (held === 0) { held = 1; await new Promise((r) => setTimeout(r, DELAY)); }
  await route.continue();
});

// Act BEFORE window 'load' — that is the whole point.
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);
// Scroll like a person: real wheel events, not a scripted scrollTo (which
// emits no `wheel` and so cannot hand control to the visitor).
if (!process.env.NO_SCROLL) { for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, 600); await page.waitForTimeout(25); } }
const parked = await page.evaluate(() => Math.round(window.scrollY));
console.log(`parked the visitor down the page at scrollY=${parked}`);

await page.waitForTimeout(3500);
const ended = await page.evaluate(() => Math.round(window.scrollY));
const centre = await page.evaluate(() => (document.elementFromPoint(innerWidth/2, innerHeight/2)?.textContent||'').trim().slice(0,70));
console.log(`after load settled  scrollY=${ended}   centre="${centre}"`);
console.log(ended < parked - 500 ? `\n*** YANKED BACK: ${parked} -> ${ended} ***` : `\nno yank`);
console.log('\nscroll writes:');
for (const e of await page.evaluate(() => window.__log)) {
  console.log(e.evt ? `  ${String(e.t).padStart(6)}ms  << ${e.evt} >>` : `  ${String(e.t).padStart(6)}ms  scrollTo ${e.from} -> ${e.to}`);
}
await b.close();
