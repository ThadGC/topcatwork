/* The phone reveal, close up, on both builds. Table PREV_F0=170 -> 14.17s, 32
   frames on a 12fps grid, so it runs to about 16.8s. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
const TIMES = [14.3, 14.8, 15.3, 15.8, 16.3, 16.8];
for (const [base,dir] of [['http://localhost:3000','rv-new']]) {
  fs.mkdirSync('out/'+dir, { recursive: true });
  const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:3 });
  const p = await ctx.newPage();
  await p.goto(base+'/',{waitUntil:'load',timeout:60000});
  await p.waitForTimeout(7000);
  const g = await p.evaluate(()=>{const old=document.querySelector('#cine');
    if(old){const cs=getComputedStyle(old);return {top:old.getBoundingClientRect().top+window.scrollY,
      travel:Math.max(1,old.offsetHeight-window.innerHeight),hold:parseFloat(cs.getPropertyValue('--cineHold'))||0};}
    const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY,travel:r.offsetHeight,hold:0};});
  console.log(`\n════ ${dir} ════`);
  for (const t of TIMES) {
    await p.evaluate(({g,t})=>{const v=document.querySelector('video');
      const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
      window.scrollTo(0, Math.round(g.top+g.travel*((t/dur)*(1-g.hold))));},{g,t});
    for(let i=0;i<18;i++){await p.waitForTimeout(180);
      const n=await p.evaluate(()=>document.querySelector('video')?.currentTime??0);
      if(Math.abs(n-t)<0.2)break;}
    await p.waitForTimeout(800);
    // crop to the headline region only
    await p.screenshot({path:`out/${dir}/t${String(t).replace('.','_')}.png`, clip:{x:0,y:60,width:390,height:280}});
    console.log(`  t=${t} got ${await p.evaluate(()=>+(document.querySelector('video')?.currentTime??0).toFixed(2))}`);
  }
  await ctx.close();
}
await b.close();
