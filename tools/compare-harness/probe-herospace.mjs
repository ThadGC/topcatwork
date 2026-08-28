import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w,h,label] of [[1600,1000,'desktop'],[900,1000,'tablet'],[390,844,'phone']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:45000}).catch(()=>{});
  await p.waitForTimeout(1200);
  const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h+30), {g});
  await p.waitForTimeout(2600);
  console.log(`\n════ ${label} ════`);
  console.log(' ', await p.evaluate(()=>{
    const q=(s)=>document.querySelector(s);
    const box=(e)=>{if(!e)return null;const b=e.getBoundingClientRect();
      return {t:Math.round(b.top),b:Math.round(b.bottom),h:Math.round(b.height)};};
    const h1=box(q('#hero h1')), sub=box(q('#hero .hero-sub')||q('#hero p.hero-el')), 
          ctas=box(q('#hero .hero-ctas')), chips=box(q('#hero .hero-chips'));
    const subEl=q('#hero .hero-sub')||q('#hero p.hero-el');
    return JSON.stringify({ h1, sub, ctas, chips,
      subMargin: subEl?getComputedStyle(subEl).margin:null,
      gapH1toSub: sub&&h1?sub.t-h1.b:null,
      gapSubToCtas: ctas&&sub?ctas.t-sub.b:null,
      gapCtasToChips: chips&&ctas?chips.t-ctas.b:null });
  }));
  await ctx.close();
}
await b.close();
