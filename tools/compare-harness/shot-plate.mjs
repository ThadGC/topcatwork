import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('out/projfix', { recursive: true });

const W = Number(process.argv[2] || 1440);
const KEY = process.argv[3] || 'wimbledon';

for (const [label, base] of [
  ['old', 'http://localhost:8099'],
  ['new', 'http://localhost:3000'],
]) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: W === 375 ? 812 : 900 } });
  await page.goto(base + '/projects/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = 'auto'));
  await page.waitForTimeout(1400);
  await page.evaluate(() => document.getElementById('gallery')?.scrollIntoView({ block: 'start', behavior: 'auto' }));
  await page.waitForTimeout(700);
  await page.evaluate((k) => {
    const cs = [...document.querySelectorAll('.gal-card')];
    (cs.find((c) => c.dataset.key === k) || cs[0])?.click();
  }, KEY);
  await page.waitForTimeout(2200);
  // scroll the overlay to the bottom of the media grid, where the plate sits
  await page.evaluate(() => {
    const d = document.getElementById('projDetail');
    const m = document.getElementById('projMedia');
    if (d && m) d.scrollTop = m.offsetTop + m.offsetHeight - innerHeight + 40;
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `out/projfix/${label}-${W}-${KEY}-grid.png` });
  const info = await page.evaluate(() => {
    const m = document.getElementById('projMedia');
    const p = m?.querySelector('.proj-brand');
    return {
      cells: m?.children.length ?? 0,
      last: m?.lastElementChild?.className ?? null,
      plateSrc: p?.querySelector('img')?.getAttribute('src') ?? null,
      plateVisible: p ? getComputedStyle(p).display : null,
    };
  });
  console.log(label, JSON.stringify(info));
  await browser.close();
}
