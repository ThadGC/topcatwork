import { chromium } from 'playwright';
const W=+(process.argv[2]||1440), H=+(process.argv[3]||900);
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:W,height:H}});
const errs=[];
p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160));});
p.on('pageerror',e=>errs.push('PAGEERROR '+String(e).slice(0,160)));
await p.goto('http://localhost:3000/contact',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(900);
for(let i=0;i<14;i++){await p.mouse.wheel(0,420);await p.waitForTimeout(210);}
await p.waitForTimeout(700);
const info=await p.evaluate(()=>{
  const r=document.querySelector('#reviews'); if(!r) return {no:true};
  const b=r.getBoundingClientRect(); const cs=getComputedStyle(r);
  const hd=document.querySelector('#reviews .section-head');
  const st=document.querySelector('#reviews .rev-stage');
  return {h:+b.height.toFixed(1), pt:cs.paddingTop, pb:cs.paddingBottom, mh:cs.minHeight,
    cls:r.className,
    headH:hd?+hd.getBoundingClientRect().height.toFixed(1):null,
    stageH:st?+st.getBoundingClientRect().height.toFixed(1):null};
});
console.log(JSON.stringify(info));
console.log('ERRORS:',errs.length?errs.slice(0,4):'none');
await p.locator('#reviews').scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
await p.screenshot({path:'out/contact-reviews.png'});
console.log('shot -> out/contact-reviews.png');
await b.close();
