import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
for (const [base,dir] of [['http://localhost:8099','wr-old'],['http://localhost:3000','wr-new']]) {
  fs.mkdirSync('out/'+dir, { recursive: true });
  const ctx = await b.newContext({ viewport:{width:1600,height:1000} });
  const p = await ctx.newPage();
  await p.goto(base+'/',{waitUntil:'load',timeout:60000});
  await p.waitForTimeout(7000);
  const g = await p.evaluate(()=>{const old=document.querySelector('#cine');
    if(old){const cs=getComputedStyle(old);return {top:old.getBoundingClientRect().top+window.scrollY,
      travel:Math.max(1,old.offsetHeight-window.innerHeight),hold:parseFloat(cs.getPropertyValue('--cineHold'))||0};}
    const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY,travel:r.offsetHeight,hold:0};});
  for (const t of [12.5, 13.5, 14.5, 15.5]) {
    await p.evaluate(({g,t})=>{const v=document.querySelector('video');
      const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
      window.scrollTo(0, Math.round(g.top+g.travel*((t/dur)*(1-g.hold))));},{g,t});
    for(let i=0;i<18;i++){await p.waitForTimeout(180);
      const n=await p.evaluate(()=>document.querySelector('video')?.currentTime??0);
      if(Math.abs(n-t)<0.2)break;}
    await p.waitForTimeout(800);
    await p.screenshot({path:`out/${dir}/t${String(t).replace('.','_')}.png`});
  }
  console.log(dir,'done');
  await ctx.close();
}
await b.close();
