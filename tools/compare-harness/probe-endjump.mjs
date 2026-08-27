/**
 * THE END-OF-FILM JUMP. Reported: finish the film, reach "Surfaces worth
 * building around", scroll down toward the reviews — and the page snaps back
 * up to the hero.
 *
 * lockFilm() is the only thing that can do that: it collapses the runway and
 * subtracts `travel` from scrollY in the same tick. It is guarded by
 * `locked.current`, and the ONLY place that flag is cleared is the lifecycle
 * effect's cleanup — which also strips `cine-done`. So if the effect re-runs,
 * the film re-arms and locks a SECOND time, subtracting the runway again.
 *
 * This watches for exactly that: every class change on <html>, every
 * scrollTo(), and every backwards scroll. System Chrome (no H.264 in the
 * bundled Chromium). Usage: node probe-endjump.mjs [w] [h]
 */
import { chromium } from 'playwright';

const W = +(process.argv[2] || 1440), H = +(process.argv[3] || 900);
const b = await chromium.launch({ channel: 'chrome' });
const page = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

await page.addInitScript(() => {
  window.__log = [];
  const stamp = () => Math.round(performance.now());
  const st = window.scrollTo.bind(window);
  window.scrollTo = function (...a) {
    const top = typeof a[0] === 'object' ? a[0].top : a[1];
    window.__log.push({ t: stamp(), kind: 'scrollTo', from: Math.round(window.scrollY), to: Math.round(top) });
    return st(...a);
  };
  addEventListener('DOMContentLoaded', () => {
    let prev = document.documentElement.className;
    new MutationObserver(() => {
      const now = document.documentElement.className;
      if (now !== prev) { window.__log.push({ t: stamp(), kind: 'class', from: prev, to: now }); prev = now; }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });
});

await page.goto('http://localhost:3000/', { waitUntil: 'load' });
await page.waitForTimeout(1500);

// Reach the locked end-state the way a visitor does.
const skip = page.locator('button', { hasText: /skip intro/i }).first();
if (await skip.count()) { await skip.click(); console.log('clicked Skip intro'); }
await page.waitForFunction(() => document.documentElement.classList.contains('cine-done'), null, { timeout: 15000 })
  .catch(() => console.log('WARN: cine-done never arrived'));
await page.waitForTimeout(2500);

const atHero = await page.evaluate(() => Math.round(window.scrollY));
console.log(`locked. scrollY at hero = ${atHero}`);

// Now scroll down toward the reviews, the way he does, watching for a snap back.
const trace = [];
for (let i = 0; i < 24; i++) {
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(160);
  const y = await page.evaluate(() => Math.round(window.scrollY));
  trace.push(y);
  const back = trace.length > 1 && y < trace[trace.length - 2] - 200;
  if (back) { console.log(`\n*** JUMPED BACK at step ${i}: ${trace[trace.length - 2]} -> ${y} ***`); break; }
}
console.log('scrollY trace:', trace.join(' '));

const log = await page.evaluate(() => window.__log);
console.log('\n--- html class changes and scrollTo calls ---');
for (const e of log) {
  if (e.kind === 'class') console.log(`  ${String(e.t).padStart(6)}ms  class  "${e.from}"  ->  "${e.to}"`);
  else console.log(`  ${String(e.t).padStart(6)}ms  scrollTo  ${e.from} -> ${e.to}`);
}
const doneAdds = log.filter(e => e.kind === 'class' && !e.from.includes('cine-done') && e.to.includes('cine-done')).length;
console.log(`\ncine-done applied ${doneAdds} time(s)  ${doneAdds > 1 ? '<-- THE EFFECT RE-RAN' : ''}`);
await b.close();
