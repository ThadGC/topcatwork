import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/curve', { recursive: true });
for (const [w,h,dsf,label] of [[1440,900,2,'desktop'],[390,844,3,'phone']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
  await p.waitForTimeout(1200);
  const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h+30), {g});
  await p.waitForTimeout(2400);   // lock + settle
  // put the hero's bottom edge in the middle of the viewport
  await p.evaluate(() => {
    const hr = document.querySelector('#hero');
    window.scrollTo(0, Math.round(hr.getBoundingClientRect().bottom + window.scrollY - window.innerHeight*0.62));
  });
  await p.waitForTimeout(700);
  const info = await p.evaluate(() => {
    const hr=document.querySelector('#hero'), bg=document.querySelector('[class*="heroBg"]');
    const cs=getComputedStyle(hr), bs=getComputedStyle(bg), as=getComputedStyle(hr,'::after');
    return { heroBottom:Math.round(hr.getBoundingClientRect().bottom),
      clip:bs.clipPath, afterRadius:as.borderBottomLeftRadius, afterLeft:as.left,
      afterBorder:as.borderBottomWidth+' '+as.borderBottomColor, curveR:cs.getPropertyValue('--curveR') };
  });
  console.log(`\n  ${label}:`, JSON.stringify(info, null, 1).replace(/\n\s*/g,' '));
  await p.screenshot({ path:`out/curve/${label}.png` });
  await ctx.close();
}
await b.close();
