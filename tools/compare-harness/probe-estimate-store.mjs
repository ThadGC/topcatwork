import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://localhost:3000/estimate',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(1600);
const read=()=>p.evaluate(()=>{try{return JSON.parse(localStorage.getItem('tc_estimate')||'null')}catch{return 'PARSE FAIL'}});
console.log('calculator (Quartz default):', JSON.stringify(await read()));

await p.locator('.est-tabs .mat-tab',{hasText:/marble/i}).first().click();
await p.waitForTimeout(900);
console.log('POA (Marble)              :', JSON.stringify(await read()));

await p.locator('.est-tabs .mat-tab',{hasText:/granite/i}).first().click();
await p.waitForTimeout(1000);
console.log('back to calculator(Granite):', JSON.stringify(await read()));

const trail=await p.evaluate(()=>{try{const j=JSON.parse(localStorage.getItem('tc_journey')||'{}');
  return (j.ev||[]).filter(e=>String(e.k||'').startsWith('Estimator')).map(e=>e.k+': '+e.v)}catch{return []}});
console.log('estimator trail events    :', JSON.stringify(trail));
await b.close();
