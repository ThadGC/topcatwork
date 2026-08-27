/* Any <img> that failed to decode, and any CSS background that 404s. */
import { chromium } from 'playwright';
const PAGES=['/','/services','/projects','/stones','/stone-selector','/estimate','/about',
  '/contact','/trade','/guides','/materials','/worktops','/sitemap',
  '/stones/almond-beige.html','/services/kitchen-worktops.html','/materials/quartz-worktops.html',
  '/guides/20mm-vs-30mm-quartz-worktops.html','/worktops/hertfordshire','/stones/compare.html'];
const b=await chromium.launch({channel:'chrome'});
let totalImgs=0, broken=[], net404=[];
for (const path of PAGES){
  const p=await b.newPage({viewport:{width:1440,height:900}});
  p.on('response',r=>{ if(r.status()>=400 && /\.(webp|jpg|jpeg|png|svg|avif|mp4|woff2?)(\?|$)/i.test(r.url()))
    net404.push(`${path}  ${r.status()}  ${r.url().replace('http://localhost:3000','')}`); });
  await p.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded'});
  await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
  await p.waitForTimeout(1200);
  const skip=p.locator('button',{hasText:/skip intro/i}).first();
  if(await skip.count()){await skip.click().catch(()=>{});await p.waitForTimeout(700);}
  // step-scroll so lazy images actually load (an instant jump leaves them stalled)
  for(let i=0;i<12;i++){ await p.mouse.wheel(0,700); await p.waitForTimeout(230); }
  await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{
    const imgs=[...document.querySelectorAll('img')];
    return {n:imgs.length, bad:imgs.filter(i=>i.complete && i.naturalWidth===0)
      .map(i=>(i.currentSrc||i.src||i.getAttribute('src')||'(no src)').slice(-70))};
  });
  totalImgs+=r.n;
  r.bad.forEach(s=>broken.push(`${path}  ${s}`));
  await p.close(); process.stdout.write('.');
}
console.log(`\n\nimages checked: ${totalImgs}`);
console.log('BROKEN <img>:', broken.length); broken.slice(0,15).forEach(x=>console.log('  '+x));
console.log('ASSET 4xx/5xx:', net404.length); [...new Set(net404)].slice(0,15).forEach(x=>console.log('  '+x));
await b.close();
