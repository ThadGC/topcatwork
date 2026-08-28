import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w,h,label] of [[900,1000,'tablet'],[390,844,'phone']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.documentElement.classList.contains('film-running'),{timeout:45000}).catch(()=>{});
  await p.waitForTimeout(1500);
  console.log(`\n════ ${label} ════`);
  console.log(' ', await p.evaluate(()=>{
    const r=(s)=>{const e=document.querySelector(s);if(!e)return 'absent';
      const b=e.getBoundingClientRect(),cs=getComputedStyle(e);
      return `x ${Math.round(b.x)}..${Math.round(b.right)}  y ${Math.round(b.y)}..${Math.round(b.bottom)}  ${Math.round(b.width)}x${Math.round(b.height)} op=${cs.opacity}`;};
    return `wa   ${r('.wa-fab')}\n  call ${r('.call-fab')}\n  skip ${r('[class*="film-module"][class*="skip"]')}\n  mbar ${document.querySelector('.mbar')?.className} op=${getComputedStyle(document.querySelector('.mbar')).opacity}`;
  }));
  await ctx.close();
}
await b.close();
