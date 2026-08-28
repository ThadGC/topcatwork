/* Sample every chrome element's opacity for the first three seconds of load. */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await ctx.newPage();
await p.addInitScript(() => {
  window.__nav = [];
  const start = performance.now();
  const tick = () => {
    const h = document.querySelector('header.bar');
    const mbar = document.querySelector('.mbar');
    const nav = document.querySelector('nav.mobile-nav');
    if (h) {
      const bs = getComputedStyle(h, '::before'), as = getComputedStyle(h, '::after');
      window.__nav.push({
        t: Math.round(performance.now() - start),
        cls: h.className,
        before: +bs.opacity, after: +as.opacity,
        mbar: mbar ? getComputedStyle(mbar).className || (mbar.className + '|' + getComputedStyle(mbar).transform.slice(0,20)) : null,
        mbarCls: mbar ? mbar.className : null,
        root: document.documentElement.className,
        film: document.querySelector('[class*="stage"]')?.getAttribute('data-film') ?? null,
      });
    }
    if (performance.now() - start < 3200) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await p.waitForTimeout(4000);
const tr = await p.evaluate(()=>window.__nav);
console.log('  samples:', tr.length);
let prev=null;
for (const r of tr) {
  const key = `${r.cls}|${r.before}|${r.after}|${r.mbarCls}|${r.root}|${r.film}`;
  if (key !== prev) {
    console.log(`  ${String(r.t).padStart(5)}ms  bar="${r.cls}"  ::before ${r.before}  ::after ${r.after}  mbar="${r.mbarCls}"  root="${r.root}"  film=${r.film}`);
    prev = key;
  }
}
await b.close();
