/* Both panes through the phone sweep: are they tiling, and is the seam right? */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [base,label] of [['http://localhost:8099','OLD'],['http://localhost:3000','NEW']]) {
  const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  await p.goto(base+'/',{waitUntil:'load',timeout:60000});
  await p.waitForTimeout(7000);
  const g = await p.evaluate(()=>{const old=document.querySelector('#cine');
    if(old){const cs=getComputedStyle(old);return {top:old.getBoundingClientRect().top+window.scrollY,
      travel:Math.max(1,old.offsetHeight-window.innerHeight),hold:parseFloat(cs.getPropertyValue('--cineHold'))||0};}
    const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY,travel:r.offsetHeight,hold:0};});
  console.log(`\n════ ${label} ════`);
  console.log('    t     wedge(a,b,c,d,e,f)                         strip');
  for (const t of [14.3,14.7,15.1,15.5,15.9,16.3,16.7]) {
    await p.evaluate(({g,t})=>{const v=document.querySelector('video');
      const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
      window.scrollTo(0, Math.round(g.top+g.travel*((t/dur)*(1-g.hold))));},{g,t});
    for(let i=0;i<16;i++){await p.waitForTimeout(180);
      const n=await p.evaluate(()=>document.querySelector('video')?.currentTime??0);
      if(Math.abs(n-t)<0.2)break;}
    await p.waitForTimeout(600);
    console.log(' ', await p.evaluate(()=>{
      const f=(sel)=>{const e=document.querySelector(sel);if(!e)return 'absent';
        const cs=getComputedStyle(e);
        return cs.visibility==='hidden' ? 'parked' : cs.transform.replace('matrix(','').replace(')','').split(',').map(x=>(+x).toFixed(2)).join(',');};
      return `${(+(document.querySelector('video')?.currentTime??0)).toFixed(2).padStart(6)}  ${f('[data-rv="wedge"]').padEnd(42)} ${f('[data-rv="strip"]')}`;
    }));
  }
  await ctx.close();
}
await b.close();
