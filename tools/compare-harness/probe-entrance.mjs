import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
await p.waitForTimeout(1200);
const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
  return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h+30), {g});
const t0 = Date.now();
console.log('   ms   blockOpacity  blockScale   h1   sub  ctas chips');
for (let i=0;i<9;i++) {
  const r = await p.evaluate(() => {
    const inner=document.querySelector('[class*="heroInner"]');
    const cs=getComputedStyle(inner);
    const op=(sel)=>{const e=document.querySelector(sel);return e?(+getComputedStyle(e).opacity).toFixed(2):' - ';};
    return { o:(+cs.opacity).toFixed(2), tf:cs.transform,
      h1:op('#hero h1 .hero-el'), sub:op('#hero .hero-sub'),
      ctas:op('#hero .hero-ctas'), chips:op('#hero .hero-chips') };
  });
  const m=(r.tf.match(/matrix\(([\d.]+)/)||['','1'])[1];
  console.log(`  ${String(Date.now()-t0).padStart(4)}  ${r.o.padStart(12)}  ${String(m).padStart(10)}   ${r.h1} ${r.sub} ${r.ctas} ${r.chips}`);
  await p.waitForTimeout(130);
}
await b.close();
