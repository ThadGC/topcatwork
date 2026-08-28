import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/', { waitUntil:'load', timeout:60000 });
await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
await p.evaluate(() => {
  const r = document.querySelector('[class*="runway"]');
  const top = r.getBoundingClientRect().top + window.scrollY;
  const filmPx = r.offsetHeight - window.innerHeight*2;
  window.scrollTo(0, Math.round(top + filmPx * (11.5/44.25)));
});
await p.waitForTimeout(1000);
const r = await p.evaluate(() => {
  const at = (x,y) => {
    const e = document.elementFromPoint(x,y);
    if (!e) return null;
    const cs = getComputedStyle(e);
    return { tag:e.tagName.toLowerCase(), cls:String(e.className).slice(0,50),
             bg:cs.backgroundImage.slice(0,60), op:cs.opacity, radius:cs.borderTopLeftRadius };
  };
  // walk the stage's children and report anything with a border radius or a
  // radial-gradient background that is currently painting
  const stage = document.querySelector('[class*="stage"]');
  const painted = [...stage.querySelectorAll('*')].map(e=>{
    const cs = getComputedStyle(e); const b = e.getBoundingClientRect();
    return { cls:String(e.className).slice(0,46), op:cs.opacity,
             radius:cs.borderRadius, bg:cs.backgroundImage.slice(0,40),
             rect:`${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}` };
  }).filter(x=>x.op!=='0');
  // and the ::before of each line
  const lines = [...document.querySelectorAll('[class*="film_line"]')].map(e=>{
    const bs = getComputedStyle(e,'::before');
    return { cls:String(e.className).slice(0,40), lineOp:getComputedStyle(e).opacity,
             beforeOp:bs.opacity, beforeInset:`${bs.top} ${bs.right} ${bs.bottom} ${bs.left}` };
  });
  return { topLeft: at(60,40), topMid: at(500,40), overMid: at(500,300), painted, lines,
           mainRadius: getComputedStyle(document.querySelector('main')).borderTopLeftRadius,
           overFilm: (()=>{const o=document.querySelector('[class*="overFilm"]');
             if(!o) return null; const b=o.getBoundingClientRect();
             return `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)} radius ${getComputedStyle(o).borderTopLeftRadius}`;})() };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
