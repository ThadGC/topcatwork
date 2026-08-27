/* ONE real submission through the real form, to prove the whole chain. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const tmp='/private/tmp/claude-501/-Users-thadeusgous-Documents-TOPCAT-WORKTOPS/ee5779c9-86c2-48ff-a444-f466d784f38e/scratchpad/test-plan.pdf';
fs.writeFileSync(tmp,'%PDF-1.4\n% Topcat delivery check\n%%EOF\n');
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:900}});
const posts=[];
p.on('response',async r=>{if(r.url().includes('/api/enquiry'))posts.push({status:r.status(),body:(await r.text().catch(()=>'')).slice(0,300)});});

// a real trail: land on home, move around, use the estimator, then enquire
await p.goto('http://localhost:3000/',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(1500);
const skip=p.locator('button',{hasText:/skip intro/i}).first();
if(await skip.count()){await skip.click().catch(()=>{});await p.waitForTimeout(900);}
await p.goto('http://localhost:3000/estimate',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1600);
await p.locator('.est-tabs .mat-tab',{hasText:/marble/i}).first().click(); await p.waitForTimeout(900);
await p.goto('http://localhost:3000/projects',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1200);
await p.goto('http://localhost:3000/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1500);
const skip2=p.locator('button',{hasText:/skip intro/i}).first();
if(await skip2.count()){await skip2.click().catch(()=>{});await p.waitForTimeout(900);}

await p.locator('#ctaForm').scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
await p.locator('#ctaStonePick').click(); await p.waitForTimeout(700);
await p.locator('.sp-modal .est-msearch input').fill('calacatta'); await p.waitForTimeout(600);
const tile=p.locator('.sp-modal .sp-tile').first();
console.log('stone picked   :', (await tile.locator('b').textContent())?.trim());
await tile.click(); await p.waitForTimeout(600);

await p.locator('#ctaForm input[name=name]').fill('TEST 2 — full-chain check (please ignore)');
await p.locator('#ctaForm input[name=email]').fill('thadeusgous@gmail.com');
await p.locator('#ctaForm input[name=phone]').fill('0800 098 2812');
await p.locator('#ctaForm input[name=postcode]').fill('HP1 2AB');
await p.locator('#ctaForm textarea').first().fill('Automated end-to-end test of the live enquiry path.\nThis email should carry: the stone, the estimate, the visit trail (home > estimate > projects > home), the device, and one PDF attachment.');
const up=p.locator('#ctaForm input[type=file]').first();
if(await up.count()) await up.setInputFiles(tmp).catch(()=>{});
await p.waitForTimeout(500);
await p.locator('#ctaForm button[type=submit]').click();
await p.waitForTimeout(6000);

console.log('POST responses :', JSON.stringify(posts));
const done=await p.evaluate(()=>{
  const f=document.querySelector('#ctaForm');
  const note=document.querySelector('.cta-reply, .tc-formnote, #ctaForm ~ *');
  return {formSent:f?.classList.contains('sent')||f?.closest('.sent')!==null,
    visibleNote:(document.querySelector('.cta-reply')||{}).textContent?.trim()?.slice(0,90)||null};
});
console.log('form state     :', JSON.stringify(done));
await p.screenshot({path:'out/live-submit.png'});
await b.close();
