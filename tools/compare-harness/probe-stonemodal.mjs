/* The home enquiry card's stone popup: open it, pick a stone, assert the chip
   and the payload. Clicks are Playwright's — the pane mis-maps coordinates. */
import { chromium } from 'playwright';
const W=+(process.argv[2]||1440), H=+(process.argv[3]||900);
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:W,height:H}});
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160));});
await p.goto('http://localhost:3000/',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(1200);
// the cine intro hijacks scroll — skip it by TEXT, never class
const skip=p.locator('button',{hasText:/skip intro/i}).first();
if(await skip.count()){await skip.click().catch(()=>{});await p.waitForTimeout(900);}
await p.locator('#ctaForm').scrollIntoViewIfNeeded();
await p.waitForTimeout(600);

const trigger=p.locator('#ctaStonePick');
console.log('trigger present :', await trigger.count());
const box=await trigger.boundingBox();
console.log('trigger height  :', box? +box.height.toFixed(1):null);
await trigger.click();
await p.waitForTimeout(700);

// is the panel actually PAINTED, not merely in the DOM?
const paint=await p.evaluate(()=>{
  const m=document.querySelector('.sp-modal'); if(!m) return {no:true};
  const card=m.querySelector('.est-mcard'); const r=card.getBoundingClientRect();
  const cx=r.left+r.width/2, cy=r.top+40;
  const hit=document.elementFromPoint(cx,cy);
  return {open:m.classList.contains('open'), hidden:m.hasAttribute('hidden'),
    parentIsBody:m.parentElement===document.body,
    cardW:+r.width.toFixed(0), cardH:+r.height.toFixed(0),
    hitInsideCard: !!(hit&&card.contains(hit)), hitTag:hit?hit.tagName+'.'+String(hit.className).slice(0,24):null,
    tiles:m.querySelectorAll('.sp-tile').length, tabs:m.querySelectorAll('.mat-tab').length};
});
console.log('panel           :', JSON.stringify(paint));
await p.screenshot({path:'out/stonemodal-open.png'});

// search narrows
await p.locator('.sp-modal .est-msearch input').fill('white');
await p.waitForTimeout(500);
console.log('after "white"   :', await p.evaluate(()=>({tiles:document.querySelectorAll('.sp-modal .sp-tile').length,
  count:document.querySelector('.sp-modal .est-mcount')?.textContent})));

// pick the first tile and assert the chip
await p.locator('.sp-modal .est-msearch input').fill('');
await p.waitForTimeout(400);
const first=p.locator('.sp-modal .sp-tile').first();
const picked=(await first.locator('b').textContent())?.trim();
await first.click();
await p.waitForTimeout(700);
const after=await p.evaluate(()=>{
  const chip=document.querySelector('#ctaStone');
  const m=document.querySelector('.sp-modal');
  return {chipHidden:chip?chip.hasAttribute('hidden'):null,
    chipName:document.querySelector('#ctaStoneName')?.textContent?.trim(),
    modalHidden:m?m.hasAttribute('hidden'):null,
    triggerGone:!document.querySelector('#ctaStonePick'),
    bodyOverflow:document.body.style.overflow};
});
console.log('picked          :', picked);
console.log('after pick      :', JSON.stringify(after));
console.log('ERRORS          :', errs.length?errs.slice(0,3):'none');
await p.screenshot({path:'out/stonemodal-picked.png'});
await b.close();
