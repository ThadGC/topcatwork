import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [base,label] of [['http://localhost:8099','OLD'],['http://localhost:3000','NEW']]) {
  const ctx = await b.newContext({ viewport:{width:900,height:1000}, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  await p.goto(base+'/',{waitUntil:'load',timeout:60000});
  await p.waitForTimeout(7000);
  console.log(`\n════ ${label} tablet ════`);
  console.log(' ', await p.evaluate(()=>{
    const r=(s)=>{const e=document.querySelector(s);if(!e)return 'absent';
      const b=e.getBoundingClientRect();
      return `x ${Math.round(b.x)}..${Math.round(b.right)}  y ${Math.round(b.y)}..${Math.round(b.bottom)}  ${Math.round(b.width)}x${Math.round(b.height)}`;};
    return `wa   ${r('.wa-fab')}\n  call ${r('.call-fab')}\n  skip ${r('.cine-skip, [class*="film-module"][class*="skip"]')}`;
  }));
  console.log(' cue:', await p.evaluate(()=>{
    const cue=document.querySelector('.cine-hero-cue, [class*="heroCue"]');
    if(!cue) return 'absent';
    const sp=cue.querySelector('span'), ar=cue.querySelector('i')||cue.querySelector('svg');
    const cs=getComputedStyle(cue);
    const sb=sp?sp.getBoundingClientRect():null, ab=ar?ar.getBoundingClientRect():null;
    return `gap=${cs.gap} margin=${cs.margin}  label y ${sb?Math.round(sb.y)+'..'+Math.round(sb.bottom):'-'}  arrow y ${ab?Math.round(ab.y)+'..'+Math.round(ab.bottom):'-'}  spacing=${sb&&ab?Math.round(ab.y-sb.bottom):'-'}`;
  }));
  await ctx.close();
}
await b.close();
