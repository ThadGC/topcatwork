/* Where is the reveal's clip edge, in VIEWPORT pixels, on each build?
   OLD draws a clip-path polygon; NEW uses a pane transform. Both reduce to a
   line, so both can be reported as "x at the top of the line". */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [base,label] of [['http://localhost:8099','OLD'],['http://localhost:3000','NEW']]) {
  const ctx = await b.newContext({ viewport:{width:1600,height:1000} });
  const p = await ctx.newPage();
  await p.goto(base+'/',{waitUntil:'load',timeout:60000});
  await p.waitForTimeout(7000);
  const g = await p.evaluate(()=>{const old=document.querySelector('#cine');
    if(old){const cs=getComputedStyle(old);return {top:old.getBoundingClientRect().top+window.scrollY,
      travel:Math.max(1,old.offsetHeight-window.innerHeight),hold:parseFloat(cs.getPropertyValue('--cineHold'))||0};}
    const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY,travel:r.offsetHeight,hold:0};});
  console.log(`\n════ ${label} ════   t     clip edge x (viewport)   line box`);
  for (const t of [10.5, 11.5, 12.5, 13.5, 15.0, 16.5]) {
    await p.evaluate(({g,t})=>{const v=document.querySelector('video');
      const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
      window.scrollTo(0, Math.round(g.top+g.travel*((t/dur)*(1-g.hold))));},{g,t});
    for(let i=0;i<18;i++){await p.waitForTimeout(180);
      const n=await p.evaluate(()=>document.querySelector('video')?.currentTime??0);
      if(Math.abs(n-t)<0.2)break;}
    await p.waitForTimeout(700);
    console.log(' ', await p.evaluate(()=>{
      const v=document.querySelector('video');
      const line=document.querySelector('.cine-line[data-vpos-wide="hero"]')||document.querySelector('[class*="rvLine"]');
      const lr=line.getBoundingClientRect();
      // OLD: read the polygon's second point (top edge x, in element px)
      const cp=getComputedStyle(line).clipPath;
      let edge=null;
      if (cp && cp.startsWith('polygon')) {
        const pts=cp.slice(8,-1).split(',').map(s=>s.trim().split(/\s+/));
        edge = parseFloat(pts[1][0]) + lr.left;
      } else {
        const w=document.querySelector('[data-rv="wedge"]');
        if (w) { const cs=getComputedStyle(w);
          const m=cs.transform.match(/matrix\(([^)]+)\)/);
          if (m) { const a=m[1].split(',').map(Number);
            const cw=parseFloat(getComputedStyle(line).width);
            // pane right edge in pane space = e + cw + bleed.r(120)
            edge = a[4] + cw + 120 + lr.left; } }
      }
      return `${(+v.currentTime).toFixed(2).padStart(6)}   ${edge===null?'-':Math.round(edge)}            ${Math.round(lr.x)},${Math.round(lr.y)} ${Math.round(lr.width)}x${Math.round(lr.height)}`;
    }));
  }
  await ctx.close();
}
await b.close();
