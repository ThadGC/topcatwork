import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
for (const path of (process.argv[2]||'/contact').split(',')){
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(600);
  const early=await p.evaluate(()=>{const r=document.getElementById('reviews');
    return r?{inline:r.getAttribute('style')||'',pos:getComputedStyle(r).position}:null;});
  await p.waitForTimeout(1800);
  const late=await p.evaluate(()=>{const r=document.getElementById('reviews');
    return r?{inline:r.getAttribute('style')||'',pos:getComputedStyle(r).position}:null;});
  console.log(path.padEnd(11),'early=',JSON.stringify(early),'\n           late=',JSON.stringify(late));
  await p.close();
}
await b.close();
