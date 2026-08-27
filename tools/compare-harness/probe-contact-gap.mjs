import { chromium } from 'playwright';
const W=+(process.argv[2]||1440), H=+(process.argv[3]||900);
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:W,height:H}});
await p.goto('http://localhost:3000/contact',{waitUntil:'domcontentloaded'});
await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
await p.waitForTimeout(900);
// step-scroll so .rise fires (fullPage/instant scroll leaves sections parked)
for (let y=0;y<6;y++){await p.mouse.wheel(0,700);await p.waitForTimeout(260);}
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(400);
for (let y=0;y<12;y++){await p.mouse.wheel(0,500);await p.waitForTimeout(200);}
await p.waitForTimeout(500);
const r=await p.evaluate(()=>{
  const abs=e=>{const b=e.getBoundingClientRect();return{top:+(b.top+scrollY).toFixed(1),bottom:+(b.bottom+scrollY).toFixed(1),h:+b.height.toFixed(1)};};
  const divs=[...document.querySelectorAll('.section-divider')].map(abs);
  const g=s=>{const e=document.querySelector(s);return e?{...abs(e),cs:(()=>{const c=getComputedStyle(e);return{pt:c.paddingTop,mt:c.marginTop};})()}:null;};
  return {
    dividers:divs,
    cta:      g('#cta'),
    ctaHead:  g('#cta .cta-title, #cta h2'),
    reviews:  g('#reviews'),
    revHead:  g('#reviews .section-head'),
    revTitle: g('#reviews .section-title'),
    faq:      g('#faq'),
    faqHead:  g('#faq .section-head'),
    faqTitle: g('#faq .section-title'),
    extra: (()=>{
      const rv=document.querySelector('#reviews'), hd=document.querySelector('#reviews .section-head');
      const ct=document.querySelector('#cta'), cth=document.querySelector('#cta .section-head, #cta h2');
      const cs=e=>e?getComputedStyle(e):null;
      return {
        reviewsPadTop: cs(rv)?.paddingTop, reviewsHeadMt: cs(hd)?.marginTop,
        reviewsHeadMb: cs(hd)?.marginBottom,
        ctaPadTop: cs(ct)?.paddingTop, ctaHeadMt: cs(cth)?.marginTop,
        ctaTitleOffsetInCta: (ct&&cth)? +(cth.getBoundingClientRect().top-ct.getBoundingClientRect().top).toFixed(1):null,
        revTitleOffsetInSec: (rv&&hd)? +(hd.getBoundingClientRect().top-rv.getBoundingClientRect().top).toFixed(1):null,
      };
    })(),
  };
});
const pick=(k)=>r[k]?`${k}: top=${r[k].top} pt=${r[k].cs.pt} mt=${r[k].cs.mt}`:`${k}: null`;
console.log(['cta','ctaHead','reviews','revHead','revTitle','faq'].map(pick).join('\n'));
console.log('dividers:',JSON.stringify(r.dividers));
console.log('EXTRA', JSON.stringify(r.extra));
const d=r.dividers;
if(d[0]&&r.revTitle) console.log('\ndivider1.bottom -> reviews TITLE top :', +(r.revTitle.top-d[0].bottom).toFixed(1));
if(d[1]&&r.faqTitle) console.log('divider2.bottom -> faq     TITLE top :', +(r.faqTitle.top-d[1].bottom).toFixed(1));
if(d[0]&&r.reviews)  console.log('divider1.bottom -> #reviews  top     :', +(r.reviews.top-d[0].bottom).toFixed(1));
await b.close();
