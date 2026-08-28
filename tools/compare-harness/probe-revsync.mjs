/* Is the reveal edge locked to the frame actually on screen, or to the scroll
   target? Sample both at a series of scroll positions through the sweep. */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
await p.waitForTimeout(1500);
const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
  return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
await p.evaluate(({g})=>window.scrollTo(0, Math.round(g.top+g.h*(14.2/44.25))), {g});
await p.waitForTimeout(1500);
console.log('  scrollT   videoT   drift(frames@24)   wedge matrix e');
for (let i=0;i<14;i++) {
  await p.evaluate(()=>window.scrollBy(0,26));
  await p.waitForTimeout(150);
  const r = await p.evaluate(()=>{
    const rw=document.querySelector('#filmRunway');
    const top=rw.getBoundingClientRect().top+window.scrollY;
    const v=document.querySelector('video');
    const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
    const scrollT=((window.scrollY-top)/rw.offsetHeight)*dur;
    const w=document.querySelector('[data-rv="wedge"]');
    return { scrollT:+scrollT.toFixed(3), videoT:+v.currentTime.toFixed(3),
      e:(getComputedStyle(w).transform.match(/,\s*(-?[\d.]+),\s*[\d.-]+\)$/)||[])[1] };
  });
  console.log(`  ${String(r.scrollT).padStart(7)} ${String(r.videoT).padStart(8)}   ${((r.scrollT-r.videoT)*24).toFixed(2).padStart(6)}          ${r.e}`);
}
await b.close();
