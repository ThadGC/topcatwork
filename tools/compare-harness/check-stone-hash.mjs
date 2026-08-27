import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
for (const h of ['', '#quartz', '#marble', '#granite']) {
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('http://localhost:3000/stones'+h,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(1800);
  const r=await p.evaluate(()=>({
    tiles: document.querySelectorAll('.st-card, .stone-card, [data-slug]').length,
    activeChips: [...document.querySelectorAll('.rchip.on,.rchip[aria-pressed="true"],.mat-tab.on')].map(e=>e.textContent.trim()).slice(0,4),
    count: document.querySelector('#stCount,.st-count')?.textContent?.trim()?.slice(0,40),
  }));
  console.log((h||'(no hash)').padEnd(10), JSON.stringify(r));
  await p.close();
}
await b.close();
