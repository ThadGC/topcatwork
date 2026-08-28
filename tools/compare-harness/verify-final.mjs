import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/final', { recursive: true });

console.log('════ BISECT MODES (390x844) ════');
for (const mode of ['', 'off', 'frozen', 'noseek', 'notext', 'range', 'noscale']) {
  const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:3 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0,90)));
  p.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,90)); });
  const url = 'http://localhost:3000/' + (mode ? `?film=${mode}` : '');
  await p.goto(url, { waitUntil:'load', timeout:60000 });
  await p.waitForTimeout(mode === 'off' ? 2500 : 7000);
  const r = await p.evaluate(() => {
    const st = document.querySelector('[class*="stage"]');
    const rw = document.querySelector('[class*="runway"]');
    const v  = document.querySelector('video');
    return {
      film: st?.getAttribute('data-film') ?? null,
      runway: rw ? getComputedStyle(rw).height : null,
      doc: document.documentElement.scrollHeight,
      src: v?.src ? (v.src.startsWith('blob:') ? 'blob' : 'url') : 'none',
      storyShown: (() => { const st=document.querySelector('[class*="story"]');
        return st ? getComputedStyle(st).display !== 'none' : false; })(),
      running: document.documentElement.classList.contains('film-running'),
      h1: document.querySelector('main h1')?.textContent?.trim().slice(0,34) ?? null,
    };
  });
  // scrub a bit and see whether the film moved
  await p.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight*0.25)));
  await p.waitForTimeout(1200);
  const t = await p.evaluate(() => +(document.querySelector('video')?.currentTime ?? -1).toFixed(2));
  console.log(`  ?film=${(mode||'(default)').padEnd(9)} film=${String(r.film).padEnd(5)} runway=${String(r.runway).padEnd(9)} src=${r.src} text=${r.storyShown} running=${r.running} t@25%=${t}  ${errs.length?'ERRORS '+errs:'clean'}`);
  await p.screenshot({ path:`out/final/mode-${mode||'default'}.png` });
  await ctx.close();
}

console.log('\n════ FIRST PAINT — is the plate on screen? ════');
for (const [w,h,dsf,label] of [[390,844,3,'phone'],[1440,900,2,'desktop']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/', { waitUntil:'domcontentloaded', timeout:60000 });
  await p.waitForTimeout(1400);
  const r = await p.evaluate(() => {
    const pl = document.querySelector('[class*="plate"]');
    const cs = pl ? getComputedStyle(pl) : null;
    return { plateOpacity: cs?.opacity, plateImg: (cs?.backgroundImage||'').match(/plate-[a-z]+\.webp/)?.[0] };
  });
  console.log(`  ${label}: plate opacity ${r.plateOpacity}, image ${r.plateImg}`);
  await p.screenshot({ path:`out/final/first-${label}.png` });
  await ctx.close();
}
await b.close();
