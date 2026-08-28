import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w,h,label] of [[1440,900,'desktop'],[390,844,'phone']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  const p = await ctx.newPage();
  const sel = 'header .brand-logo, header a[class*=brand]';
  const state = () => p.evaluate(()=>({y:Math.round(window.scrollY),
    heroTop:Math.round(document.querySelector('#hero').getBoundingClientRect().top),
    runway:getComputedStyle(document.querySelector('#filmRunway')).height,
    t:+(document.querySelector('video')?.currentTime??-1).toFixed(1)}));
  console.log(`\n════ ${label} ════`);

  // 1. mid-film
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
  await p.waitForTimeout(1200);
  const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h*0.4), {g});
  await p.waitForTimeout(900);
  console.log('  mid-film  before:', JSON.stringify(await state()));
  await p.click(sel); await p.waitForTimeout(2200);
  console.log('  mid-film  after :', JSON.stringify(await state()));

  // 2. locked, then deep in the page
  await p.evaluate(()=>window.scrollTo(0, Math.round(document.documentElement.scrollHeight*0.62)));
  await p.waitForTimeout(1200);
  console.log('  deep      before:', JSON.stringify(await state()));
  await p.click(sel); await p.waitForTimeout(2200);
  console.log('  deep      after :', JSON.stringify(await state()));
  await ctx.close();
}
await b.close();
