import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
for (const path of ['/','/contact']){
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(1400);
  console.log(path.padEnd(10), await p.evaluate(()=>{const r=document.getElementById('reviews');
    const c=getComputedStyle(r);return JSON.stringify({cls:r.className,pos:c.position,minH:c.minHeight,pt:c.paddingTop});}));
  await p.close();
}
await b.close();
