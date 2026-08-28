/* Slow-scroll smoothness: step the scroll by small amounts and count how many
   DISTINCT pictures come back. Hashing the decoded frame, not currentTime —
   currentTime can advance while the same picture stays on screen. */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
await p.waitForTimeout(1500);

const g = await p.evaluate(() => {
  const r = document.querySelector('#filmRunway');
  return { top: r.getBoundingClientRect().top+window.scrollY, h: r.offsetHeight, vh: window.innerHeight };
});
// park in the middle of the film, then creep forward in 12px steps
const start = Math.round(g.top + (g.h - g.vh) * 0.35);
await p.evaluate((y)=>window.scrollTo(0,y), start);
await p.waitForTimeout(1500);

const rows = [];
for (let i = 0; i < 40; i++) {
  await p.evaluate((y)=>window.scrollTo(0,y), start + i*4);
  await p.waitForTimeout(230);
  rows.push(await p.evaluate(() => {
    const v = document.querySelector('video');
    const c = document.createElement('canvas'); c.width=32; c.height=18;
    const x = c.getContext('2d'); x.drawImage(v,0,0,32,18);
    const d = x.getImageData(0,0,32,18).data;
    let hsh = 0; for (let i=0;i<d.length;i+=4) hsh = (hsh*31 + d[i]) >>> 0;
    return { t:+v.currentTime.toFixed(3), h:hsh };
  }));
}
const distinct = new Set(rows.map(r=>r.h)).size;
const times = rows.map(r=>r.t);
const spanT = (times[times.length-1]-times[0]).toFixed(3);
console.log(`  40 scroll steps of 4px each`);
console.log(`  film time advanced: ${times[0]} -> ${times[times.length-1]}  (${spanT}s)`);
console.log(`  distinct pictures : ${distinct} / 40`);
console.log(`  frames available in ${spanT}s at 24fps: ${(spanT*24).toFixed(1)}`);
let runs=1, longest=1, cur=1;
for(let i=1;i<rows.length;i++){ if(rows[i].h===rows[i-1].h){cur++;longest=Math.max(longest,cur);} else {cur=1;runs++;} }
console.log(`  longest run of one repeated picture: ${longest} steps`);
await b.close();
