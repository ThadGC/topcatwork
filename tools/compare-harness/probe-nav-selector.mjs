import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://localhost:3000/estimate',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1400);
const stones=p.locator('nav .nav-item', {hasText:/^Stones/}).first();
console.log('Stones nav-item :', await stones.count());
await stones.hover(); await p.waitForTimeout(700);
const link=p.locator('a', {hasText:/^Stone selector$/}).first();
const vis=await link.isVisible();
const box=await link.boundingBox();
console.log('link visible    :', vis, '| box =', box? `${box.width.toFixed(0)}x${box.height.toFixed(0)} @${box.x.toFixed(0)},${box.y.toFixed(0)}`:null);
// what is actually on top at the link's centre?
if(box) console.log('elementFromPoint:', await p.evaluate(([x,y])=>{
  const e=document.elementFromPoint(x,y); return e? e.tagName+'.'+String(e.className).slice(0,30)+' "'+(e.textContent||'').trim().slice(0,20)+'"':null;
},[box.x+box.width/2, box.y+box.height/2]));
await link.click();
await p.waitForTimeout(1800);
console.log('navigated to    :', new URL(p.url()).pathname);
await p.screenshot({path:'out/nav-stones-open.png'});
await b.close();
