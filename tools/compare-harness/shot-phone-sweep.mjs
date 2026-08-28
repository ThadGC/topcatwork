/* The phone band, old vs new, across the whole film. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
const TIMES = [0.5, 3.0, 8.0, 14.5, 16.0, 18.0, 21.0, 23.5, 30.0, 33.0, 36.0, 41.0];
for (const [base,dir] of [['http://localhost:3000','ph-new']]) {
  fs.mkdirSync('out/'+dir, { recursive: true });
  const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  await p.goto(base+'/',{waitUntil:'load',timeout:60000});
  await p.waitForTimeout(7000);
  const g = await p.evaluate(()=>{
    const old=document.querySelector('#cine');
    if (old){const cs=getComputedStyle(old);
      return {top:old.getBoundingClientRect().top+window.scrollY,
        travel:Math.max(1,old.offsetHeight-window.innerHeight),
        hold:parseFloat(cs.getPropertyValue('--cineHold'))||0, isOld:true};}
    const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, travel:r.offsetHeight, hold:0, isOld:false};});
  console.log(`\n════ ${dir} ════`);
  for (const t of TIMES) {
    await p.evaluate(({g,t})=>{const v=document.querySelector('video');
      const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
      const frac=(t/dur)*(1-g.hold);
      window.scrollTo(0, Math.round(g.top+g.travel*frac));},{g,t});
    for (let i=0;i<18;i++){ await p.waitForTimeout(180);
      const now=await p.evaluate(()=>document.querySelector('video')?.currentTime??0);
      if (Math.abs(now-t)<0.3) break; }
    await p.waitForTimeout(700);
    await p.screenshot({path:`out/${dir}/t${String(t).replace('.','_')}.png`});
    console.log(`  t=${String(t).padStart(5)} got ${await p.evaluate(()=>+(document.querySelector('video')?.currentTime??0).toFixed(1))}`);
  }
  await ctx.close();
}
await b.close();
