import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://localhost:3000/contact',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(1200);
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(900);
const r=await p.evaluate(()=>{
  const row=document.querySelector('.foot-social'); if(!row) return {no:true};
  return [...row.querySelectorAll('a')].map(a=>{
    const b=a.getBoundingClientRect();
    const svg=a.querySelector('svg');
    const sb=svg?svg.getBoundingClientRect():null;
    // is the glyph actually painted where the link is?
    const hit=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
    return {label:a.getAttribute('aria-label'), href:a.getAttribute('href'),
      w:+b.width.toFixed(0), h:+b.height.toFixed(0),
      svg:sb?`${sb.width.toFixed(0)}x${sb.height.toFixed(0)}`:null,
      hit: hit? (a.contains(hit)?'inside link':hit.tagName+'.'+String(hit.className).slice(0,20)) : null};
  });
});
console.log(JSON.stringify(r,null,1));
const row=await p.locator('.foot-social').first();
await row.screenshot({path:'out/foot-social.png'});
console.log('shot -> out/foot-social.png');
await b.close();
