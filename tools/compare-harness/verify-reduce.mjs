import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('out/projfix', { recursive: true });

const W = Number(process.argv[2] || 1440);
const SEL = ['#reviews .section-head', '#process .section-head', '.cta-card', '.page-head h1'];

for (const [label, base] of [
  ['old', 'http://localhost:8099'],
  ['new', 'http://localhost:3000'],
]) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: W, height: W === 375 ? 812 : 900 },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(base + '/projects/', { waitUntil: 'domcontentloaded' });
  // Deliberately do NOT scroll: under reduce the source shows every .rise
  // block from first paint, so anything parked here is a defect.
  await page.waitForTimeout(1500);
  const out = await page.evaluate((sels) => {
    const risen = [...document.querySelectorAll('.rise')];
    const parked = risen.filter((e) => {
      const s = getComputedStyle(e);
      return parseFloat(s.opacity) < 0.5;
    });
    return {
      riseTotal: risen.length,
      parked: parked.length,
      sample: sels.map((sel) => {
        const e = document.querySelector(sel);
        if (!e) return { sel, missing: true };
        const s = getComputedStyle(e);
        return { sel, opacity: s.opacity, transform: s.transform };
      }),
    };
  }, SEL);
  console.log(label, JSON.stringify(out));
  await page.screenshot({ path: `out/projfix/${label}-${W}-reduce.png` });
  await browser.close();
}
