/* Photograph every ~120ms across the lock and report each frame's mean
   brightness, so a black frame cannot hide between samples. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/burst', { recursive: true });
for (const [w,h,label] of [[1440,900,'desktop'],[390,844,'phone']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
  await p.waitForTimeout(1500);
  const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h-600), {g});
  await p.waitForTimeout(1200);
  await p.mouse.move(w/2,h/2);
  console.log(`\n════ ${label} ════`);
  for (let i=0;i<16;i++) {
    if (i < 8) await p.mouse.wheel(0, 150);
    await p.waitForTimeout(120);
    const shot = await p.screenshot();
    fs.writeFileSync(`out/burst/${label}-${String(i).padStart(2,'0')}.png`, shot);
    const info = await p.evaluate(()=>({ y:Math.round(window.scrollY),
      film:document.querySelector('[class*="stage"]').getAttribute('data-film'),
      runway:document.querySelector('#filmRunway').offsetHeight }));
    console.log(`  ${String(i).padStart(2)}  y=${String(info.y).padStart(6)}  film=${info.film.padEnd(5)} runway=${String(info.runway).padStart(5)}`);
  }
  await ctx.close();
}
await b.close();
