import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
for (const [W,H] of [[1440,900],[900,900],[390,844]]) {
  const p=await b.newPage({viewport:{width:W,height:H}});
  await p.goto('http://localhost:3000/services',{waitUntil:'domcontentloaded'});
  await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
  await p.waitForTimeout(1400);
  await p.locator('#procFlow').scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
  await p.locator('#procFlow .ptile').nth(1).click(); await p.waitForTimeout(900);
  const r=await p.evaluate(()=>{
    const vs=[...document.querySelectorAll('.pm-points .pv')].map(v=>+v.getBoundingClientRect().left.toFixed(1));
    const wrap=[...document.querySelectorAll('.pm-points .pk')].map(k=>k.getBoundingClientRect().height>26);
    return {valueLefts:vs, allAligned:new Set(vs).size===1, labelWrapped:wrap.some(Boolean)};
  });
  console.log(`${W}x${H}`, JSON.stringify(r));
  await p.close();
}
await b.close();
