import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w,h,label] of [[900,1000,'tablet'],[1600,1000,'desktop'],[390,844,'phone']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.documentElement.classList.contains('film-running'),{timeout:45000}).catch(()=>{});
  await p.waitForTimeout(1200);
  const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h-500), {g});
  await p.waitForTimeout(900);
  await p.mouse.move(w/2,h/2);
  // keep scrolling continuously, never pausing — the case that used to stick
  let lockedAt = null;
  for (let i=0;i<25;i++) {
    await p.mouse.wheel(0, 200);
    await p.waitForTimeout(45);
    const st = await p.evaluate(()=>({runway:document.querySelector('#filmRunway').offsetHeight,
      film:document.querySelector('[class*="stage"]').getAttribute('data-film')}));
    if (st.film === 'done' && lockedAt === null) lockedAt = i;
  }
  await p.waitForTimeout(600);
  const end = await p.evaluate(()=>({y:Math.round(window.scrollY),
    runway:document.querySelector('#filmRunway').offsetHeight,
    heroTop:Math.round(document.querySelector('#hero').getBoundingClientRect().top),
    film:document.querySelector('[class*="stage"]').getAttribute('data-film')}));
  console.log(`  ${label.padEnd(8)} locked after ${lockedAt===null?'NEVER (stuck)':lockedAt+' wheel ticks'};  end: ${JSON.stringify(end)}`);
  await ctx.close();
}
await b.close();
