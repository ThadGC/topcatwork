/* The handoff, frame by frame: the last of the film, then the hero settling.
   The gradient must not change between them. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/handoff', { recursive: true });
for (const [w,h,dsf,label] of [[390,844,3,'phone'],[1440,900,2,'desktop']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
  await p.waitForTimeout(1200);
  const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
  // last frame of the film, stage still up
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h-4), {g});
  await p.waitForTimeout(1400);
  await p.screenshot({path:`out/handoff/${label}-1-film-end.png`});
  // over the line: stage released, hero settling
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h+30), {g});
  await p.waitForTimeout(420);
  await p.screenshot({path:`out/handoff/${label}-2-settling.png`});
  await p.waitForTimeout(1800);
  await p.screenshot({path:`out/handoff/${label}-3-settled.png`});
  await ctx.close();
}
await b.close(); console.log('ok');
