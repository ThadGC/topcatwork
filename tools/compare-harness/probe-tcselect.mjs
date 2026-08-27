/* The custom dropdown: opens, keyboard-navigates, and puts the SAME value in
   the payload the native <select> did. */
import { chromium } from 'playwright';
const W=+(process.argv[2]||1440), H=+(process.argv[3]||900);
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:W,height:H}});
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,140)));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,140));});
await p.goto('http://localhost:3000/trade',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(1100);
console.log('native <select> left on page:', await p.locator('select').count());
const t=p.locator('#qfService');
await t.scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
console.log('trigger text (default):', (await t.textContent())?.trim());
console.log('payload before        :', await p.evaluate(()=>document.querySelector('input[name="service"]')?.value));

await t.click(); await p.waitForTimeout(350);
const open=await p.evaluate(()=>{
  const l=document.querySelector('.tc-sel-list');
  const r=l.getBoundingClientRect();
  const hit=document.elementFromPoint(r.left+r.width/2, r.top+16);
  return {hidden:l.hasAttribute('hidden'), opts:l.querySelectorAll('.tc-sel-o').length,
    w:+r.width.toFixed(0), h:+r.height.toFixed(0),
    paintedByUs: !!(hit && l.contains(hit)), hitTag:hit?hit.className:null};
});
console.log('list open             :', JSON.stringify(open));
await p.screenshot({path:'out/tcselect-open.png'});

// keyboard: down twice, Enter
await p.keyboard.press('ArrowDown'); await p.waitForTimeout(120);
await p.keyboard.press('ArrowDown'); await p.waitForTimeout(120);
await p.keyboard.press('Enter'); await p.waitForTimeout(300);
console.log('after kbd pick        :', (await t.textContent())?.trim(),
  '| payload =', await p.evaluate(()=>document.querySelector('input[name="service"]')?.value));

// mouse: reopen, pick the last
await t.click(); await p.waitForTimeout(300);
const last=p.locator('.tc-sel-o').last();
const lastTxt=(await last.textContent())?.trim();
await last.click(); await p.waitForTimeout(300);
console.log('after mouse pick      :', (await t.textContent())?.trim(), '(expected', lastTxt+')',
  '| payload =', await p.evaluate(()=>document.querySelector('input[name="service"]')?.value));

// escape closes; outside click closes
await t.click(); await p.waitForTimeout(250);
await p.keyboard.press('Escape'); await p.waitForTimeout(250);
console.log('escape closes         :', await p.evaluate(()=>document.querySelector('.tc-sel-list').hasAttribute('hidden')));
await t.click(); await p.waitForTimeout(250);
await p.mouse.click(20,20); await p.waitForTimeout(300);
console.log('outside click closes  :', await p.evaluate(()=>document.querySelector('.tc-sel-list').hasAttribute('hidden')));

// what FormData actually carries
console.log('FormData service      :', await p.evaluate(()=>{
  const f=document.querySelector('#qform form')||document.querySelector('form');
  return f? new FormData(f).get('service') : 'no form';
}));
console.log('ERRORS                :', errs.length?errs.slice(0,3):'none');
await b.close();
