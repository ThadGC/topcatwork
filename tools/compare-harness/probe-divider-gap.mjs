/* Gap between a <SectionDivider /> and the heading of the section under it.
   The section is scrolled into view FIRST — measuring an off-screen section
   returned impossible negatives (the title reading above the divider). */
import { chromium } from 'playwright';
const W=+(process.argv[2]||1440), H=+(process.argv[3]||900);
const PAGES=(process.argv[4]||'/contact').split(',');
const b=await chromium.launch({channel:'chrome'});
for (const path of PAGES){
  const p=await b.newPage({viewport:{width:W,height:H}});
  await p.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded'});
  await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
  await p.waitForTimeout(900);
  for(let i=0;i<16;i++){await p.mouse.wheel(0,400);await p.waitForTimeout(160);}
  await p.waitForTimeout(500);
  const ids=await p.evaluate(()=>[...document.querySelectorAll('section.section')]
    .filter(s=>s.previousElementSibling?.classList.contains('section-divider')&&s.querySelector('.section-title,h2'))
    .map(s=>s.id||''));
  const out=[];
  for (const id of ids){
    if(!id) continue;
    await p.evaluate(i=>document.getElementById(i)?.scrollIntoView({block:'center'}),id);
    await p.waitForTimeout(420);
    out.push(await p.evaluate(i=>{
      const sec=document.getElementById(i), prev=sec.previousElementSibling;
      const t=sec.querySelector('.section-title,h2');
      return {id:i, gap:+(t.getBoundingClientRect().top-prev.getBoundingClientRect().bottom).toFixed(1),
        pt:getComputedStyle(sec).paddingTop};
    },id));
  }
  console.log(path.padEnd(11), JSON.stringify(out));
  await p.close();
}
await b.close();
