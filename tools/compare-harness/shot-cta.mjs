import { chromium } from 'playwright';
const W=+(process.argv[2]||1440), H=+(process.argv[3]||900), TAG=process.argv[4]||'x';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:W,height:H}});
await p.goto('http://localhost:3000/',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(1200);
const skip=p.locator('button',{hasText:/skip intro/i}).first();
if(await skip.count()){await skip.click().catch(()=>{});await p.waitForTimeout(900);}
await p.locator('#cta').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
await p.locator('#cta .cta-card, #cta').first().screenshot({path:`out/cta-${TAG}.png`});
console.log('shot -> out/cta-'+TAG+'.png');
await b.close();
