/* Nothing should scroll sideways on a phone. */
import { chromium } from 'playwright';
const PAGES=['/','/services','/projects','/stones','/stone-selector','/estimate','/about',
  '/contact','/trade','/guides','/materials','/worktops','/sitemap',
  '/stones/almond-beige.html','/services/kitchen-worktops.html','/materials/quartz-worktops.html',
  '/guides/20mm-vs-30mm-quartz-worktops.html','/worktops/hertfordshire','/stones/compare.html','/privacy','/terms'];
const b=await chromium.launch({channel:'chrome'});
const bad=[];
for (const path of PAGES){
  const p=await b.newPage({viewport:{width:390,height:844}});
  await p.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded'});
  await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
  await p.waitForTimeout(1200);
  const skip=p.locator('button',{hasText:/skip intro/i}).first();
  if(await skip.count()){await skip.click().catch(()=>{});await p.waitForTimeout(700);}
  for(let i=0;i<8;i++){await p.mouse.wheel(0,800);await p.waitForTimeout(180);}
  const r=await p.evaluate(()=>{
    const de=document.documentElement;
    const over=de.scrollWidth-de.clientWidth;
    let widest=null;
    if(over>1){
      const all=[...document.querySelectorAll('body *')];
      let max=0;
      for(const e of all){ const b=e.getBoundingClientRect();
        if(b.right>max && b.width>0 && getComputedStyle(e).position!=='fixed'){max=b.right;
          widest=e.tagName.toLowerCase()+'.'+String(e.className).slice(0,34)+' right='+b.right.toFixed(0);} }
    }
    return {over, widest, vw:de.clientWidth};
  });
  if(r.over>1) bad.push(`${path}  overflow ${r.over}px  ${r.widest||''}`);
  await p.close(); process.stdout.write('.');
}
console.log('\n\nHORIZONTAL OVERFLOW at 390px:', bad.length);
bad.forEach(x=>console.log('  '+x));
await b.close();
