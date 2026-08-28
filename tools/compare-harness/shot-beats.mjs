/* Photograph the film at each text beat, on each band, and put the new frame
   beside the reference frame from the build the client signed off. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/beats', { recursive: true });
const TIMES = {
  phone:   [0, 3, 15.6, 18, 21.5, 30.3, 35, 42],
  tablet:  [0, 3, 14.2, 17.5, 21, 30.3, 35, 42],
  desktop: [0, 3, 11.5, 14.5, 18, 30.2, 35, 42],
};
for (const [w,h,dsf,label] of [[390,844,3,'phone'],[900,900,2,'tablet'],[1440,900,2,'desktop']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/', { waitUntil:'load', timeout:60000 });
  await p.waitForFunction(() => document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',
    { timeout: 40000 }).catch(()=>{});
  await p.waitForTimeout(1200);
  console.log(`\n=== ${label} ===`);
  for (const t of TIMES[label]) {
    await p.evaluate((tt) => {
      const r = document.querySelector('[class*="runway"]');
      const top = r.getBoundingClientRect().top + window.scrollY;
      const v = document.querySelector('video');
      const dur = v && isFinite(v.duration) && v.duration > 1 ? v.duration : 44.25;
      const filmPx = r.offsetHeight - window.innerHeight * 2;
      window.scrollTo(0, Math.round(top + filmPx * (tt/dur)));
    }, t);
    await p.waitForTimeout(900);
    const got = await p.evaluate(() => +(document.querySelector('video')?.currentTime ?? 0).toFixed(2));
    await p.screenshot({ path:`out/beats/${label}-${String(t).replace('.','_')}.png` });
    console.log(`  want ${String(t).padStart(5)}  got ${String(got).padStart(6)}`);
  }
  await ctx.close();
}
await b.close();
