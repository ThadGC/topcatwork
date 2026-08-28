import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [base,label] of [['http://localhost:8099','OLD'],['http://localhost:3000','NEW']]) {
  const ctx = await b.newContext({ viewport:{width:900,height:1000}, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  await p.goto(base+'/',{waitUntil:'load',timeout:60000});
  await p.waitForTimeout(7000);
  const g = await p.evaluate(()=>{const old=document.querySelector('#cine');
    if(old){const cs=getComputedStyle(old);return {top:old.getBoundingClientRect().top+window.scrollY,
      travel:Math.max(1,old.offsetHeight-window.innerHeight),hold:parseFloat(cs.getPropertyValue('--cineHold'))||0};}
    const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY,travel:r.offsetHeight,hold:0};});
  console.log(`\n════ ${label} tablet 900x1000 ════`);
  for (const t of [0.5, 3.0, 5.0]) {
    await p.evaluate(({g,t})=>{const v=document.querySelector('video');
      const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
      window.scrollTo(0, Math.round(g.top+g.travel*((t/dur)*(1-g.hold))));},{g,t});
    await p.waitForTimeout(1400);
    console.log(' ', await p.evaluate(()=>{
      const f=(s)=>{const e=document.querySelector(s);if(!e)return 'absent';
        const cs=getComputedStyle(e),r=e.getBoundingClientRect();
        return `${cs.display}/${cs.opacity} @${Math.round(r.x)} ${Math.round(r.width)}px`;};
      const hc=document.querySelector('.cine-hero')||document.querySelector('[class*="heroCopy"]');
      const cs=hc?getComputedStyle(hc):null;
      return `t=${(+(document.querySelector('video')?.currentTime??0)).toFixed(1)}  wa ${f('.wa-fab')}  call ${f('.call-fab')}  skip ${f('.cine-skip')||f('[class*="_skip"]')}\n     hero op=${cs?.opacity} tf=${cs?.transform.slice(0,46)}`;
    }));
  }
  await ctx.close();
}
await b.close();
