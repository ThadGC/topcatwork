/* Open a process tile's detail panel and photograph it. */
import { chromium } from 'playwright';
const W=+(process.argv[2]||390), H=+(process.argv[3]||844), TAG=process.argv[4]||'x';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:W,height:H}});
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
await p.goto('http://localhost:3000/services',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(1500);
await p.locator('#procFlow').scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
// tile 2 = "Design & quote"
const tile=p.locator('#procFlow .ptile').nth(1);
console.log('tiles:', await p.locator('#procFlow .ptile').count());
await tile.click(); await p.waitForTimeout(1000);
const info=await p.evaluate(()=>{
  const m=document.querySelector('#procModal'); if(!m) return {no:true};
  const card=m.querySelector('.pmodal-card'); const r=card.getBoundingClientRect();
  const li=[...m.querySelectorAll('.pm-points li')].map(x=>{
    const k=x.querySelector('.pk'), v=x.querySelector('.pv');
    const kr=k.getBoundingClientRect(), vr=v.getBoundingClientRect();
    return {label:k.textContent.trim(), stacked: vr.top > kr.bottom - 2,
      kw:+kr.width.toFixed(0), vw:+vr.width.toFixed(0)};
  });
  return {hidden:m.hasAttribute('hidden'), title:m.querySelector('.pm-title')?.textContent?.trim(),
    cardW:+r.width.toFixed(0), cardH:+r.height.toFixed(0),
    footPresent: !!m.querySelector('.pm-foot'),
    ctaLinks: m.querySelectorAll('.pmodal-card a').length,
    points: li};
});
console.log(JSON.stringify(info,null,1));
console.log('errors:', errs.length?errs:'none');
await p.locator('.pmodal-card').screenshot({path:`out/proccard-${TAG}.png`});
console.log('shot -> out/proccard-'+TAG+'.png');
await b.close();
