/* The wide reveal: where the pane's clip edge actually is, against where the
   measured table says it should be for the frame on screen. */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:1600,height:1000} });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
await p.waitForTimeout(1500);
const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
  return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
console.log('    t     videoT   wedge e      rightmost lit text px   line rect');
for (const t of [10.5, 11.5, 12.5, 13.5, 15.0, 17.0, 20.0]) {
  await p.evaluate(({g,t})=>{const v=document.querySelector('video');
    const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
    window.scrollTo(0, Math.round(g.top+g.h*(t/dur)));},{g,t});
  for(let i=0;i<16;i++){await p.waitForTimeout(180);
    const n=await p.evaluate(()=>document.querySelector('video')?.currentTime??0);
    if(Math.abs(n-t)<0.2)break;}
  await p.waitForTimeout(700);
  const r = await p.evaluate(()=>{
    const v=document.querySelector('video');
    const w=document.querySelector('[data-rv="wedge"]');
    const line=document.querySelector('[class*="rvLine"]');
    const lr=line.getBoundingClientRect();
    const cs=getComputedStyle(w);
    return { t:+v.currentTime.toFixed(3), tf:cs.transform,
      line:`${Math.round(lr.x)},${Math.round(lr.y)} ${Math.round(lr.width)}x${Math.round(lr.height)}`,
      open: line.hasAttribute('data-open') };
  });
  console.log(`  ${r.t.toFixed(2).padStart(6)}  ${r.tf.slice(0,46).padEnd(48)} ${r.line}  open=${r.open}`);
}
await b.close();
