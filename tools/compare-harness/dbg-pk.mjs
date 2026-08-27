import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:900,height:900}});
await p.goto('http://localhost:3000/services',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(1400);
await p.locator('#procFlow').scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
await p.locator('#procFlow .ptile').nth(1).click(); await p.waitForTimeout(900);
console.log(await p.evaluate(()=>{
  return [...document.querySelectorAll('.pm-points .pk')].map(k=>{
    const r=k.getBoundingClientRect(); const cs=getComputedStyle(k);
    // width the text alone wants
    const span=document.createElement('span');
    span.style.cssText=`position:absolute;visibility:hidden;white-space:nowrap;font:${cs.font};letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform}`;
    span.textContent=k.textContent;
    document.body.appendChild(span);
    const need=span.getBoundingClientRect().width; span.remove();
    return {txt:k.textContent.trim(), h:+r.height.toFixed(1), w:+r.width.toFixed(1),
      cssWidth:cs.width, textNeeds:+need.toFixed(1), gapPlusDot:13};
  });
}));
await b.close();
