import { chromium } from 'playwright';
const W=+(process.argv[2]||1440), H=+(process.argv[3]||900);
const b=await chromium.launch({channel:'chrome'});
for (const MAT of ['Porcelain','Marble']) {
  const p=await b.newPage({viewport:{width:W,height:H}});
  await p.goto('http://localhost:3000/estimate',{waitUntil:'domcontentloaded'});
  await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
  await p.waitForTimeout(1100);
  const t=p.locator('.est-tabs .mat-tab',{hasText:new RegExp(MAT.split(' ')[0],'i')}).first();
  if (await t.count()){await t.click();await p.waitForTimeout(650);}
  const r=await p.evaluate(()=>{
    const g=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();
      const cs=getComputedStyle(e);return {h:+b.height.toFixed(1),top:+b.top.toFixed(1),
      mt:cs.marginTop,pt:cs.paddingTop,hidden:e.hasAttribute('hidden')};};
    const chip=g('#estStoneBtn');
    const L=document.querySelector('.est-poa h3'), R=document.querySelector('.est-preview .est-price');
    return {head:g('.est-panel > .est-block:first-child'), chip, poa:g('.est-poa'),
      delta:(L&&R)?+(L.getBoundingClientRect().top-R.getBoundingClientRect().top).toFixed(1):null};
  });
  console.log(MAT.padEnd(10), JSON.stringify(r));
  await p.close();
}
await b.close();
