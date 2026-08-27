import { chromium } from 'playwright';
for (const [label, base] of [['old','http://localhost:8099'],['new','http://localhost:3000']]) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(base + '/projects/', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => (document.documentElement.style.scrollBehavior='auto'));
  await p.waitForTimeout(1200);
  for (let y = 0; y < 9000; y += 400) { await p.evaluate((v)=>window.scrollTo(0,v), y); await p.waitForTimeout(90); }
  await p.evaluate(() => document.getElementById('reviews')?.scrollIntoView({block:'start',behavior:'auto'}));
  await p.waitForTimeout(1800);
  console.log(label, JSON.stringify(await p.evaluate(() => ({
    marbleSvgs: document.querySelectorAll('svg.marble').length,
    inRevStone: document.querySelectorAll('.rev-stone svg.marble').length,
    revStones: document.querySelectorAll('.rev-stone').length,
    firstSeedId: document.querySelector('.rev-stone svg.marble linearGradient')?.id ?? null,
  }))));
  await p.screenshot({ path: `out/projfix/${label}-1440-reviews.png` });
  await b.close();
}
