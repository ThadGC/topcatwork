/* Back must return the visitor to the part of the page they left, not to the
   top of the film. Walks: home -> skip intro -> scroll to a section -> open a
   link -> browser Back -> where did we land? Both builds. */
import { chromium } from 'playwright';
const W = Number(process.argv[2]||1440), H = Number(process.argv[3]||900);
const b = await chromium.launch({ channel: 'chrome' });
for (const [base,label,ext] of [['http://localhost:3000','NEW',''],['http://localhost:8099','OLD','/']]) {
  const ctx = await b.newContext({ viewport:{width:W,height:H} });
  const p = await ctx.newPage();
  await p.addInitScript(()=>{try{document.documentElement.style.scrollBehavior='auto';}catch{}});
  console.log(`\n=== ${label} @${W}x${H} ===`);

  // 1. the stone wheel -> a stone page -> back
  await p.goto(base+'/',{waitUntil:'domcontentloaded'}).catch(()=>{});
  await p.waitForTimeout(1400);
  await p.evaluate(()=>{const x=[...document.querySelectorAll('button,a')].find(e=>/skip intro/i.test(e.textContent||''));if(x)x.click();});
  await p.waitForTimeout(1600);
  await p.evaluate(()=>document.querySelector('#stones')?.scrollIntoView());
  await p.waitForTimeout(2600);
  const before = await p.evaluate(()=>({
    y: Math.round(window.scrollY),
    docH: Math.round(document.documentElement.scrollHeight),
    stones: Math.round((document.querySelector('#stones')?.getBoundingClientRect().top ?? 0) + window.scrollY),
    cls: document.documentElement.className,
  }));
  console.log('  before click :', JSON.stringify(before));
  // "View this stone" — the anchor the wheel keeps pointed at the centred slab
  const href = await p.evaluate(()=>document.querySelector('#stoneView')?.getAttribute('href'));
  console.log('  stoneView    :', href);
  await Promise.all([
    p.waitForNavigation({ waitUntil:'domcontentloaded' }).catch(()=>{}),
    p.evaluate(()=>document.querySelector('#stoneView')?.click()),
  ]);
  await p.waitForTimeout(2500);
  console.log('  landed on    :', p.url().replace(base,''));
  await p.goBack({ waitUntil: 'domcontentloaded' }).catch(()=>{});
  await p.waitForTimeout(3000);
  const after = await p.evaluate(()=>({
    y: Math.round(window.scrollY),
    docH: Math.round(document.documentElement.scrollHeight),
    stones: Math.round((document.querySelector('#stones')?.getBoundingClientRect().top ?? 0) + window.scrollY),
    cls: document.documentElement.className,
    filmT: +(document.querySelector('video')?.currentTime ?? -1).toFixed(2),
  }));
  console.log('  after Back   :', JSON.stringify(after));
  const ok = Math.abs(after.y - after.stones) < 400 && after.y > 200;
  console.log('  -> back to the stone section?', ok ? 'YES' : 'NO  <<<');
  await ctx.close();
}
await b.close();
