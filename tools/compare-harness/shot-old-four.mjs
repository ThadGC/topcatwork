/* The OLD build at the same four moments. It is the signed-off reference and
   the client has asked for these exactly. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/four-old', { recursive: true });
const ctx = await b.newContext({ viewport:{width:1600,height:1000}, deviceScaleFactor:1.25 });
const p = await ctx.newPage();
await p.goto('http://localhost:8099/',{waitUntil:'load',timeout:60000});
await p.waitForTimeout(6000);
const geom = await p.evaluate(() => {
  const c = document.querySelector('#cine') || document.querySelector('.cine');
  const cs = getComputedStyle(c);
  return { top: c.getBoundingClientRect().top + window.scrollY,
           travel: Math.max(1, c.offsetHeight - window.innerHeight),
           hold: parseFloat(cs.getPropertyValue('--cineHold')) || 0 };
});
const at = async (t, name) => {
  await p.evaluate(({g,t})=>{
    const v=document.querySelector('video');
    const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
    window.scrollTo(0, Math.round(g.top + g.travel*((t/dur)*(1-g.hold))));
  },{g:geom,t});
  for (let i=0;i<20;i++){ await p.waitForTimeout(200);
    const now = await p.evaluate(()=>document.querySelector('video')?.currentTime??0);
    if (Math.abs(now-t)<0.25) break; }
  await p.waitForTimeout(900);
  await p.screenshot({path:`out/four-old/${name}.png`});
  console.log(`  ${name}: t=${await p.evaluate(()=>+(document.querySelector('video')?.currentTime??0).toFixed(1))}`);
};
await at(1.2, '4-opening');
await at(21.0, '3-slab');
await at(31.0, '2-stone');
// to the end + the lock
await p.evaluate(({g})=>window.scrollTo(0, g.top + g.travel), {geom, g:geom});
await p.waitForTimeout(3500);
await p.evaluate(()=>window.scrollTo(0,0));
await p.waitForTimeout(1500);
await p.screenshot({path:'out/four-old/1-hero.png'});
const st = await p.evaluate(()=>({ root:document.documentElement.className,
  bar:document.querySelector('header')?.className, y:Math.round(window.scrollY),
  cineH:getComputedStyle(document.querySelector('#cine')||document.querySelector('.cine')).height }));
console.log('  1-hero:', JSON.stringify(st));
await b.close();
