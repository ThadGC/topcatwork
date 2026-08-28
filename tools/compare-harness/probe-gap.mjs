import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:1600,height:1000} });
const p = await ctx.newPage();
await p.goto('http://localhost:8099/',{waitUntil:'load',timeout:60000});
await p.waitForTimeout(6000);
const g = await p.evaluate(()=>{const c=document.querySelector('#cine')||document.querySelector('.cine');
  return {top:c.getBoundingClientRect().top+window.scrollY, travel:Math.max(1,c.offsetHeight-window.innerHeight)};});
await p.evaluate(({g})=>window.scrollTo(0,g.top+g.travel),{g});
await p.waitForTimeout(3500);
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(1200);
console.log(await p.evaluate(() => {
  const hero=document.querySelector('#hero');
  const rev=document.querySelector('#reviews')||document.querySelector('.reviews');
  const hb=hero.getBoundingClientRect(), rb=rev?rev.getBoundingClientRect():null;
  return JSON.stringify({
    vh: window.innerHeight,
    heroHeight: Math.round(hb.height),
    heroBottom: Math.round(hb.bottom + window.scrollY),
    reviewsTop: rb ? Math.round(rb.top + window.scrollY) : null,
    gap: rb ? Math.round(rb.top - hb.bottom) : null,
    docHeight: document.documentElement.scrollHeight,
  }, null, 1).replace(/\n\s*/g,' ');
}));
await b.close();
