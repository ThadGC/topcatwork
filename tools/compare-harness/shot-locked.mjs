import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/lock', { recursive: true });
for (const [w,h,dsf,label] of [[390,844,3,'phone'],[1440,900,2,'desktop']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
  await p.waitForTimeout(1200);
  const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h), {g});
  await p.waitForTimeout(2600);                       // let the lock + settle land
  await p.screenshot({path:`out/lock/${label}-settled.png`});
  // then scroll down a little to show the divider into the reviews section
  await p.evaluate((h)=>window.scrollBy(0, Math.round(h*0.72)), h);
  await p.waitForTimeout(900);
  await p.screenshot({path:`out/lock/${label}-divider.png`});
  await ctx.close();
}
await b.close(); console.log('ok');
