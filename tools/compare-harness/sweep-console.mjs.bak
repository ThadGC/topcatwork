import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
for (const path of ['/','/contact','/estimate','/about','/services','/projects','/trade']){
  const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[],hyd=[];
  p.on('console',m=>{const t=m.text();
    if(/hydrat|didn't match|server rendered/i.test(t)) hyd.push(t.slice(0,60));
    else if(m.type()==='error') errs.push(t.slice(0,90));});
  p.on('pageerror',e=>errs.push('PAGEERROR '+String(e).slice(0,90)));
  await p.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(2200);
  console.log(path.padEnd(11),'errors=',errs.length,'hydration=',hyd.length, errs.length?errs[0]:'');
  await p.close();
}
await b.close();
