import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/lock', { recursive: true });
for (const [w,h,dsf,label] of [[390,844,3,'phone'],[1440,900,2,'desktop']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,110)));
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
  await p.waitForTimeout(1200);
  const snap = () => p.evaluate(() => {
    const st=document.querySelector('[class*="stage"]'), hr=document.querySelector('#hero');
    const rw=document.querySelector('#filmRunway');
    return { y:Math.round(window.scrollY), doc:document.documentElement.scrollHeight,
      runway:rw?getComputedStyle(rw).height:null, film:st?.getAttribute('data-film'),
      ink:hr?.hasAttribute('data-ink'),
      heroTop:Math.round(hr.getBoundingClientRect().top),
      t:+(document.querySelector('video')?.currentTime??-1).toFixed(2),
      running: document.documentElement.classList.contains('film-running') };
  });
  console.log(`\n════ ${label} ════`);
  const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
  for (const f of [0.5, 0.92, 1.0, 1.02]) {
    await p.evaluate(({g,f})=>window.scrollTo(0, Math.round(g.top+g.h*f)), {g,f});
    await p.waitForTimeout(f>=1?1800:900);
    const s = await snap();
    console.log(`  @${f}: y=${s.y} t=${s.t} film=${s.film} ink=${s.ink} heroTop=${s.heroTop} runway=${s.runway} doc=${s.doc}`);
    await p.screenshot({path:`out/lock/${label}-${String(f).replace('.','_')}.png`});
  }
  // after the lock: can we get back into the film?
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(700);
  const top = await snap();
  console.log(`  after lock, scrolled to top: y=${top.y} runway=${top.runway} film=${top.film} heroTop=${top.heroTop} doc=${top.doc} running=${top.running}`);
  await p.screenshot({path:`out/lock/${label}-locked-top.png`});
  console.log(`  errors: ${errs.length?errs:'none'}`);
  await ctx.close();
}
await b.close();
