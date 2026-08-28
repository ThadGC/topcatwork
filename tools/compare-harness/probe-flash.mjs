/* Record every frame across the lock: scroll, document height, where the stage
   and the hero actually are, and how dark the viewport is. */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:1440,height:900} });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
await p.waitForTimeout(1500);

await p.evaluate(() => {
  window.__trace = [];
  const stg=document.querySelector('[class*="stage"]');
  const sp=document.querySelector('[class*="heroSpace"]');
  const tick = () => {
    const s=stg.getBoundingClientRect();
    window.__trace.push({
      t: Math.round(performance.now()),
      y: Math.round(window.scrollY),
      doc: document.documentElement.scrollHeight,
      max: document.documentElement.scrollHeight - window.innerHeight,
      film: stg.getAttribute('data-film'),
      pos: getComputedStyle(stg).position,
      stageTop: Math.round(s.top),
      spaceTop: Math.round(sp.getBoundingClientRect().top),
      runway: document.querySelector('#filmRunway').offsetHeight,
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
  return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
// park near the end, then keep scrolling THROUGH the lock like a real visitor
await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h-700), {g});
await p.waitForTimeout(1200);
await p.evaluate(()=>{ window.__trace.length = 0; });
await p.mouse.move(720,450);
for (let i=0;i<14;i++){ await p.mouse.wheel(0,160); await p.waitForTimeout(70); }
await p.waitForTimeout(2500);

const tr = await p.evaluate(()=>window.__trace);
console.log('  frames recorded:', tr.length);
console.log('   ms      y     doc    max   film  pos       stageTop  spaceTop  runway');
let prev=null;
for (const r of tr) {
  const jump = prev ? Math.abs(r.y-prev.y) : 0;
  const flag = (prev && (r.doc!==prev.doc || r.film!==prev.film || jump>400)) ? '  <<<' : '';
  if (flag || tr.indexOf(r)%6===0)
    console.log(`  ${String(r.t).padStart(5)} ${String(r.y).padStart(6)} ${String(r.doc).padStart(7)} ${String(r.max).padStart(6)}  ${String(r.film).padEnd(5)} ${r.pos.padEnd(9)} ${String(r.stageTop).padStart(8)} ${String(r.spaceTop).padStart(9)} ${String(r.runway).padStart(7)}${flag}`);
  prev=r;
}
await b.close();
