/* /stone-selector: does the measured wheel actually build here, do the
   sections below it render, and does the nav item really navigate? */
import { chromium } from 'playwright';
const W=+(process.argv[2]||1440), H=+(process.argv[3]||900);
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:W,height:H}});
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,120));});

await p.goto('http://localhost:3000/stone-selector',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(1800);
console.log('h1              :', (await p.locator('h1').first().textContent())?.trim());
const wheel=await p.evaluate(()=>{
  const w=document.querySelector('#wheel');
  const slabs=w?w.children.length:0;
  const r=w?w.getBoundingClientRect():null;
  return {slabs, wheelH:r?+r.height.toFixed(0):null,
    tabs:document.querySelectorAll('#matTabs .mat-tab').length,
    readout:document.querySelector('#readout')?.textContent?.trim().slice(0,40),
    sections:[...document.querySelectorAll('main > section, main > div.section-divider')]
      .map(e=>e.id||e.className.split(' ')[0]).join(' | ')};
});
console.log('wheel           :', JSON.stringify(wheel));

// the belt must respond: click "next" and the readout should change
const before=await p.evaluate(()=>document.querySelector('#readout')?.textContent);
await p.locator('#next').click().catch(()=>{});
await p.waitForTimeout(900);
const after=await p.evaluate(()=>document.querySelector('#readout')?.textContent);
console.log('readout moves   :', before!==after, `(${before} -> ${after})`);

// material rail
await p.locator('#matTabs .mat-tab', {hasText:/granite/i}).first().click().catch(()=>{});
await p.waitForTimeout(900);
console.log('after Granite   :', await p.evaluate(()=>document.querySelector('#readout')?.textContent?.trim().slice(0,40)));

await p.locator('#stones').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
await p.screenshot({path:'out/selector-page.png'});

// and the nav actually goes there
await p.goto('http://localhost:3000/estimate',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1200);
const link=p.locator('a', {hasText:/^Stone selector$/}).first();
console.log('nav link count  :', await link.count(), '| href =', await link.getAttribute('href').catch(()=>null));
await link.click({force:true}).catch(e=>console.log('click err',String(e).slice(0,60)));
await p.waitForTimeout(1600);
console.log('navigated to    :', new URL(p.url()).pathname);
console.log('ERRORS          :', errs.length?errs.slice(0,3):'none');
await b.close();
