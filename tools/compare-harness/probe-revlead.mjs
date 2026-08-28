/* Scroll FAST through the reveal and measure how far the clip edge is from the
   frame on screen. This is the case the client photographed. */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:1600,height:1000} });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await p.waitForFunction(()=>document.documentElement.classList.contains('film-running'),{timeout:45000}).catch(()=>{});
await p.waitForTimeout(1500);
await p.evaluate(() => {
  const v = document.querySelector('video');
  window.__shown = 0;
  const cb = (_n, m) => { window.__shown = m.mediaTime; v.requestVideoFrameCallback(cb); };
  if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(cb);
});
const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
  return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
await p.evaluate(({g})=>window.scrollTo(0, Math.round(g.top+g.h*(10.2/44.25))), {g});
await p.waitForTimeout(1500);
await p.mouse.move(800,500);
console.log('  requested  presented   lead(frames@24)   clip edge x');
for (let i=0;i<10;i++) {
  await p.mouse.wheel(0, 260);
  await p.waitForTimeout(90);
  console.log(' ', await p.evaluate(()=>{
    const v=document.querySelector('video');
    const line=document.querySelector('[class*="rvLine"]');
    const w=document.querySelector('[data-rv="wedge"]');
    const m=getComputedStyle(w).transform.match(/matrix\(([^)]+)\)/);
    const cw=parseFloat(getComputedStyle(line).width);
    const edge = m ? (Number(m[1].split(',')[4]) + cw + 120 + line.getBoundingClientRect().left) : null;
    return `${v.currentTime.toFixed(3).padStart(9)}  ${(window.__shown||0).toFixed(3).padStart(9)}   ${(((v.currentTime)-(window.__shown||0))*24).toFixed(2).padStart(6)}          ${edge===null?'-':Math.round(edge)}`;
  }));
}
await b.close();
