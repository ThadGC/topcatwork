/* Beat 1 is UNCOVERED by a slanted edge tracked against an edge in the film
   (lib/reveal.ts TREV_X/TREV_S, film-space x off the tablet crop's left edge).
   The tablet cut was re-cropped 27 Aug; FILM_W.tablet moved 864 -> 584 to keep
   those numbers naming the same edge. This drives the runway to the reveal's
   own frames and photographs the result on both builds. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const W = Number(process.argv[2]||900), H = Number(process.argv[3]||900);
const TARGETS = (process.argv[4]||'10.4,11.2,12.0').split(',').map(Number);
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out',{recursive:true});
for (const [base,label] of [['http://localhost:3000','NEW']]) {
  const ctx = await b.newContext({ viewport:{width:W,height:H} });
  const p = await ctx.newPage();
  await p.goto(base+'/',{waitUntil:'domcontentloaded'}).catch(()=>{});
  await p.waitForTimeout(4000);
  console.log(`\n=== ${label} ${W}x${H} ===`);
  for (const t of TARGETS) {
    // walk the runway until the film's presented time reaches t
    for (let i = 0; i < 260; i++) {
      const now = await p.evaluate(() => document.querySelector('video')?.currentTime ?? 0);
      if (now >= t) break;
      await p.evaluate(() => window.scrollBy(0, 90));
      await p.waitForTimeout(45);
    }
    await p.waitForTimeout(1400);
    const info = await p.evaluate(() => {
      const v = document.querySelector('video');
      const line = [...document.querySelectorAll('p,div')].find(e => /slab you choose is unique/i.test(e.textContent||'') && e.getBoundingClientRect().height > 8);
      const r = line ? line.getBoundingClientRect() : null;
      return { t: +(v?.currentTime ?? 0).toFixed(2),
               line: r ? { x:+r.left.toFixed(0), y:+r.top.toFixed(0), w:+r.width.toFixed(0), h:+r.height.toFixed(0) } : null,
               op: line ? getComputedStyle(line).opacity : null };
    });
    console.log(`  t=${String(info.t).padStart(6)}  line=${JSON.stringify(info.line)} op=${info.op}`);
    await p.screenshot({ path: `out/reveal-${label}-${String(t).replace('.','_')}-${W}.png` });
  }
  await ctx.close();
}
await b.close();
