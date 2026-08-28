/* Reach the end of the film with a REAL wheel gesture that overshoots, the way
   a flick does, and see where the lock leaves you. */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w,h,dsf,label] of [[1440,900,1,'desktop'],[390,844,3,'phone']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
  await p.waitForTimeout(1200);
  const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
    return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight, doc:document.documentElement.scrollHeight};});

  // park just before the end, then flick past it
  await p.evaluate(({g})=>window.scrollTo(0, g.top+g.h-500), {g});
  await p.waitForTimeout(900);
  const before = await p.evaluate(() => ({ y:Math.round(window.scrollY),
    heroTop:Math.round(document.querySelector('#hero').getBoundingClientRect().top),
    doc:document.documentElement.scrollHeight }));
  await p.mouse.move(w/2,h/2);
  for (let i=0;i<10;i++) { await p.mouse.wheel(0, 320); await p.waitForTimeout(24); }
  await p.waitForTimeout(1600);   // let the settle + lock land
  const after = await p.evaluate(() => {
    const hr=document.querySelector('#hero');
    const secs=[...document.querySelectorAll('section[id], div[class*=est-], #reviews, #stones')]
      .map(e=>({id:e.id||String(e.className).slice(0,24), top:Math.round(e.getBoundingClientRect().top)}))
      .filter(s=>s.top>-400 && s.top<400);
    return { y:Math.round(window.scrollY), heroTop:Math.round(hr.getBoundingClientRect().top),
      runway:getComputedStyle(document.querySelector('#filmRunway')).height,
      doc:document.documentElement.scrollHeight, inView:secs.slice(0,3) };
  });
  console.log(`\n════ ${label} ════`);
  console.log('  runway height was', g.h, ' doc was', g.doc);
  console.log('  before flick :', JSON.stringify(before));
  console.log('  after  lock  :', JSON.stringify(after));
  console.log(`  >>> hero is ${after.heroTop === 0 ? 'AT THE TOP (correct)' : `${after.heroTop}px off the top  <<< JUMPED`}`);
  await ctx.close();
}
await b.close();
