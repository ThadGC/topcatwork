import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/four', { recursive: true });
const ctx = await b.newContext({ viewport:{width:1600,height:1000}, deviceScaleFactor:1.25 });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
await p.waitForTimeout(1500);
const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
  return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
const at = async (t, name) => {
  await p.evaluate(({g,t})=>{
    const v=document.querySelector('video');
    const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
    window.scrollTo(0, Math.round(g.top + g.h*(t/dur)));
  },{g,t});
  await p.waitForTimeout(1100);
  await p.screenshot({path:`out/four/${name}.png`});
  console.log(`  ${name}: t=${await p.evaluate(()=>+(document.querySelector('video')?.currentTime??0).toFixed(1))}`);
};
await at(1.2, '4-opening');       // "Your worktop starts here"
await at(21.0, '3-slab');         // "The slab you choose is unique"
await at(31.0, '2-stone');        // "The stone sets the tone of the room"
// the final hero, after the lock
await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h+20), {g});
await p.waitForTimeout(2800);
await p.screenshot({path:'out/four/1-hero.png'});
console.log('  1-hero: locked');
await b.close();
