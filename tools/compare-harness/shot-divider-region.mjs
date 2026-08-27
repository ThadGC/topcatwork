import { chromium } from 'playwright';
const W=+(process.argv[2]||1440), H=+(process.argv[3]||900);
const path=process.argv[4]||'/contact', TAG=process.argv[5]||'x';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:W,height:H}});
await p.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(900);
for(let i=0;i<18;i++){await p.mouse.wheel(0,380);await p.waitForTimeout(160);}
await p.waitForTimeout(600);
// put the divider that precedes #reviews at the top of the viewport
await p.evaluate(()=>{
  const s=document.getElementById('reviews'); const d=s.previousElementSibling;
  const y=d.getBoundingClientRect().top+window.scrollY-40;
  window.scrollTo(0,y);
});
await p.waitForTimeout(700);
const m=await p.evaluate(()=>{
  const s=document.getElementById('reviews'); const d=s.previousElementSibling;
  const t=s.querySelector('.section-title,h2');
  const dr=d.getBoundingClientRect(), tr=t.getBoundingClientRect(), sr=s.getBoundingClientRect();
  return {dividerTop:+dr.top.toFixed(1), dividerBottom:+dr.bottom.toFixed(1),
    secTop:+sr.top.toFixed(1), titleTop:+tr.top.toFixed(1),
    gapDividerToTitle:+(tr.top-dr.bottom).toFixed(1),
    gapDividerToSection:+(sr.top-dr.bottom).toFixed(1),
    prevTag:d.tagName+'.'+d.className};
});
console.log(JSON.stringify(m,null,1));
await p.screenshot({path:`out/divgap-${TAG}.png`});
console.log('shot -> out/divgap-'+TAG+'.png');
await b.close();
