import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/h2', { recursive: true });
for (const [w,h,label] of [[1600,1000,'desktop'],[390,844,'phone']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,100)));
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
  await p.waitForTimeout(1500);
  const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
  const st = () => p.evaluate(() => {
    const stg=document.querySelector('[class*="stage"]'), hr=document.querySelector('#hero');
    const sp=document.querySelector('[class*="heroSpace"]');
    return { t:+(document.querySelector('video')?.currentTime??-1).toFixed(1),
      film:stg?.getAttribute('data-film'), pos:getComputedStyle(stg).position,
      ink:hr?.hasAttribute('data-ink'), heroOp:getComputedStyle(hr).opacity,
      innerOp:getComputedStyle(document.querySelector('[class*="heroInner"]')).opacity,
      runway:getComputedStyle(document.querySelector('#filmRunway')).height,
      spaceTop:sp?Math.round(sp.getBoundingClientRect().top):null,
      y:Math.round(window.scrollY) };
  });
  console.log(`\n════ ${label} ════`);
  for (const [frac,name] of [[0.90,'before'],[0.94,'inking'],[0.985,'nearly']]) {
    await p.evaluate(({g,f})=>window.scrollTo(0, Math.round(g.top+g.h*f)), {g,f:frac});
    await p.waitForTimeout(1200);
    console.log(`  @${frac}:`, JSON.stringify(await st()));
    await p.screenshot({path:`out/h2/${label}-${name}.png`});
  }
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h+30), {g});
  await p.waitForTimeout(2400);
  console.log('  locked  :', JSON.stringify(await st()));
  await p.screenshot({path:`out/h2/${label}-locked.png`});
  await p.evaluate(()=>window.scrollBy(0, Math.round(window.innerHeight*0.6)));
  await p.waitForTimeout(700);
  console.log('  scrolled:', JSON.stringify(await st()));
  await p.screenshot({path:`out/h2/${label}-after.png`});
  console.log('  errors:', errs.length?errs:'none');
  await ctx.close();
}
await b.close();
