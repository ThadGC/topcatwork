import { chromium } from 'playwright';
import fs from 'node:fs';
const W = Number(process.argv[2]||1440), H = Number(process.argv[3]||900);
const COMBOS = [['one',[['tone','light'],['hue','blue'],['vein','calm']]],
                ['three',[['hue','green']]],
                ['all',[]]];
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:W,height:H} });
const p = await ctx.newPage();
await p.addInitScript(()=>{try{document.documentElement.style.scrollBehavior='auto';}catch{}});
await p.goto('http://localhost:3000/',{waitUntil:'domcontentloaded'}).catch(()=>{});
await p.waitForTimeout(1200);
await p.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(e=>/skip intro/i.test(e.textContent||''));if(b)b.click();});
await p.waitForTimeout(1500);
await p.evaluate(()=>{document.querySelector('#stones')?.scrollIntoView();});
await p.waitForTimeout(2600);
fs.mkdirSync('out',{recursive:true});
for (const [name,chips] of COMBOS) {
  await p.evaluate(async (chips)=>{
    document.querySelector('#sfClear')?.click();
    await new Promise(r=>setTimeout(r,700));
    for (const [f,v] of chips){ document.querySelector(`.sf-chips[data-f="${f}"] .sf-chip[data-v="${v}"]`)?.click(); await new Promise(r=>setTimeout(r,450)); }
  }, chips);
  await p.waitForTimeout(1400);
  const el = await p.$('#stones');
  await el.screenshot({ path: `out/wheel-${name}-${W}.png` });
  console.log('shot', name);
}
await ctx.close(); await b.close();
