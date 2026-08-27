import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});

// 1. the ESTIMATOR's own Granite tab (scoped — /estimate also has the wheel rail)
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://localhost:3000/estimate',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(1600);
console.log('buttons matching /^Granite$/ on the page:', await p.locator('button:visible',{hasText:/^Granite$/}).count());
const state=()=>p.evaluate(()=>({
  tab:[...document.querySelectorAll('.est-tabs .mat-tab')].find(t=>t.classList.contains('on'))?.textContent?.trim(),
  stone:document.querySelector('#estStoneName')?.textContent?.trim(),
  poaShown:!document.querySelector('#estPoa')?.hasAttribute('hidden'),
}));
console.log('before:', JSON.stringify(await state()));
await p.locator('.est-tabs .mat-tab',{hasText:/^Granite$/}).first().click();
await p.waitForTimeout(1000);
console.log('after :', JSON.stringify(await state()));
await p.close();

// 2. the "All tones" chip — is it a reset that is already the default?
const q=await b.newPage({viewport:{width:1440,height:900}});
await q.goto('http://localhost:3000/stones',{waitUntil:'domcontentloaded'});
await q.waitForTimeout(1600);
const count=()=>q.evaluate(()=>document.querySelector('#stCount,.st-count')?.textContent?.trim());
console.log('\nstones default    :', await count());
const dark=q.locator('button:visible',{hasText:/^Dark$/}).first();
if(await dark.count()){ await dark.click(); await q.waitForTimeout(900); }
console.log('after Dark        :', await count());
const all=q.locator('button:visible',{hasText:/^All tones$/}).first();
if(await all.count()){ await all.click(); await q.waitForTimeout(900); }
console.log('after "All tones" :', await count(), '<- it is a RESET, so it only does something when a tone is on');
await q.close();
await b.close();
