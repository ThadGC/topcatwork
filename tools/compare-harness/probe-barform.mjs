/* At what scroll position does the OLD build's bar form, after the film locks? */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [base,label] of [['http://localhost:8099','OLD'],['http://localhost:3000','NEW']]) {
  const ctx = await b.newContext({ viewport:{width:1440,height:900} });
  const p = await ctx.newPage();
  await p.goto(base+'/',{waitUntil:'load',timeout:60000});
  await p.waitForTimeout(6000);
  // drive to the end and lock
  const g = await p.evaluate(()=>{const c=document.querySelector('#cine')||document.querySelector('#filmRunway');
    const isOld=!!document.querySelector('#cine');
    const cs=isOld?getComputedStyle(c):null;
    return { top:c.getBoundingClientRect().top+window.scrollY,
             travel: isOld ? Math.max(1,c.offsetHeight-window.innerHeight) : c.offsetHeight,
             isOld };});
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.travel+40), {g});
  await p.waitForTimeout(3500);
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(900);
  console.log(`\n════ ${label} ════   at y=0: ${await p.evaluate(()=>document.querySelector('header')?.className)}`);
  for (const y of [20, 40, 60, 120, 300, 600, 900, 1200, 1500]) {
    await p.evaluate((yy)=>window.scrollTo(0,yy), y);
    await p.waitForTimeout(320);
    const r = await p.evaluate(()=>{
      const h=document.querySelector('header');
      const bs=getComputedStyle(h,'::before'), as=getComputedStyle(h,'::after');
      return { cls:h.className, before:bs.opacity, after:as.opacity+' '+as.transform.slice(0,18) };
    });
    console.log(`  y=${String(y).padStart(5)}  ${r.cls.padEnd(22)} ::before ${r.before}  ::after ${r.after}`);
  }
  await ctx.close();
}
await b.close();
