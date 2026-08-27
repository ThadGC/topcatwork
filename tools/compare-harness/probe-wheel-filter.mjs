/* The filtered wheel must hold exactly the stones that matched — one match is
   one slab, never a belt of the same slab repeated (client, 27 Aug).
   Drives the real filter chips and counts the DOM. */
import { chromium } from 'playwright';
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || 900);
const COMBOS = [
  ['1 match  (light+blue+calm)', [['tone','light'],['hue','blue'],['vein','calm']]],
  ['few      (light+blue)',      [['tone','light'],['hue','blue']]],
  ['few      (green)',           [['hue','green']]],
  ['many     (light)',           [['tone','light']]],
  ['all      (none)',            []],
];
const b = await chromium.launch({ channel: 'chrome' });
for (const [base,label] of [['http://localhost:3000','NEW'],['http://localhost:8099','OLD']]) {
  const ctx = await b.newContext({ viewport:{width:W,height:H} });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { document.documentElement.style.scrollBehavior='auto'; } catch {} });
  await p.goto(base+'/',{waitUntil:'domcontentloaded'}).catch(()=>{});
  await p.waitForTimeout(1200);
  // skip the cine intro — match on TEXT, never class
  await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button,a')].find(e => /skip intro/i.test(e.textContent||''));
    if (btn) btn.click();
  });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { document.querySelector('#stones')?.scrollIntoView(); });
  await p.waitForTimeout(2600);   // the entrance animation is 1900ms
  console.log(`\n=== ${label} @${W}x${H} ===`);
  for (const [name, chips] of COMBOS) {
    const r = await p.evaluate(async (chips) => {
      const clear = document.querySelector('#sfClear');
      if (clear) clear.click();
      await new Promise(r => setTimeout(r, 700));
      for (const [f,v] of chips) {
        const c = document.querySelector(`.sf-chips[data-f="${f}"] .sf-chip[data-v="${v}"]`);
        if (c) c.click();
        await new Promise(r => setTimeout(r, 450));
      }
      await new Promise(r => setTimeout(r, 900));
      const slabs = [...document.querySelectorAll('#wheel .slab')];
      const names = slabs.map(s => (s.querySelector('.name')?.textContent || '').trim());
      const uniq = new Set(names);
      const vis = slabs.filter(s => parseFloat(getComputedStyle(s).opacity) > 0.05).length;
      return {
        count: document.querySelector('#sfCount')?.textContent?.trim().slice(0,24) || '',
        slabs: slabs.length, uniq: uniq.size, visible: vis,
        names: [...uniq].slice(0,3), dupes: names.length - uniq.size,
      };
    }, chips);
    const bad = r.dupes > 0 ? '  <<< DUPLICATES' : '';
    console.log(`  ${name.padEnd(28)} readout="${r.count}"  slabs=${String(r.slabs).padStart(3)} unique=${String(r.uniq).padStart(3)} visible=${String(r.visible).padStart(3)} dupes=${r.dupes}${bad}`);
  }
  await ctx.close();
}
await b.close();
