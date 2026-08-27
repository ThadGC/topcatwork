/* Back returns to the part of the page you were viewing — every page, and
   without replaying the intro. Also checks a FIRST visit still starts at the
   top with the film intact. */
import { chromium } from 'playwright';
const W = Number(process.argv[2]||1440), H = Number(process.argv[3]||900);
const BASE = 'http://localhost:3000';

const JOURNEYS = [
  ['home #stones  -> a stone',      '/',           '#stones',   '#stoneView'],
  ['home #cta     -> /contact/',    '/',           '#cta',      'a[href^="/contact"]'],
  ['home footer   -> /trade/',      '/',           '#cta',      'a[href^="/trade"]'],
  ['/stones/      -> a stone',      '/stones',     null,        'a[href*="/stones/"][href$=".html"]'],
  ['/services/    -> a service',    '/services',   null,        'a[href*="/services/"][href$=".html"]'],
  ['/guides/      -> a guide',      '/guides',     null,        'a[href*="/guides/"][href$=".html"]'],
  ['/worktops/    -> a town',       '/worktops',   null,        'a[href*="/worktops/"]'],
  ['/projects/    -> a link',       '/projects',   null,        'a[href*="/worktops/"], a[href*="/services/"]'],
  ['/estimate/    -> a link',       '/estimate',   null,        'a[href*="/materials/"], a[href*="/guides/"]'],
  ['/about/       -> a link',       '/about',      null,        'a[href*="/services/"], a[href*="/materials/"]'],
];

const b = await chromium.launch({ channel: 'chrome' });
console.log(`viewport ${W}x${H}`);
for (const [name, path, section, sel] of JOURNEYS) {
  const ctx = await b.newContext({ viewport:{width:W,height:H} });
  const p = await ctx.newPage();
  await p.addInitScript(()=>{try{document.documentElement.style.scrollBehavior='auto';}catch{}});
  await p.goto(BASE+path,{waitUntil:'domcontentloaded'}).catch(()=>{});
  await p.waitForTimeout(1300);
  await p.evaluate(()=>{const x=[...document.querySelectorAll('button,a')].find(e=>/skip intro/i.test(e.textContent||''));if(x)x.click();});
  await p.waitForTimeout(1500);
  if (section) { await p.evaluate((s)=>document.querySelector(s)?.scrollIntoView(), section); }
  else { for(let i=0;i<5;i++){await p.evaluate(()=>window.scrollBy(0,window.innerHeight*0.75));await p.waitForTimeout(160);} }
  await p.waitForTimeout(1800);
  const before = await p.evaluate(()=>Math.round(window.scrollY));
  if (before < 100) { console.log(`  ${name.padEnd(30)} SKIPPED (page too short to scroll)`); await ctx.close(); continue; }

  const target = sel
    ? await p.evaluate((s)=>{const a=[...document.querySelectorAll(s)].find(e=>e.getAttribute('href'));return a?a.getAttribute('href'):null;}, sel)
    : await p.evaluate(()=>{const a=[...document.querySelectorAll('a[href^="/"]')].filter(e=>{const r=e.getBoundingClientRect();return r.top>0&&r.top<window.innerHeight&&r.width>10;})[0];return a?a.getAttribute('href'):null;});
  if (!target) { console.log(`  ${name.padEnd(30)} SKIPPED (no link found)`); await ctx.close(); continue; }

  await Promise.all([
    p.waitForNavigation({waitUntil:'domcontentloaded'}).catch(()=>{}),
    p.evaluate((t)=>{const a=[...document.querySelectorAll('a')].find(e=>e.getAttribute('href')===t); if(a) a.click(); else location.href=t;}, target),
  ]);
  await p.waitForTimeout(1800);
  const landed = p.url().replace(BASE,'');
  if (landed === path || landed === path+'/' || landed.split('#')[0] === path) {
    console.log(`  ${name.padEnd(30)} SKIPPED (the link did not leave ${path})`);
    await ctx.close(); continue;
  }
  await p.goBack({waitUntil:'domcontentloaded'}).catch(()=>{});
  await p.waitForTimeout(3200);
  const after = await p.evaluate(()=>({y:Math.round(window.scrollY), cls:document.documentElement.className, t:+(document.querySelector('video')?.currentTime??-1).toFixed(1)}));
  const drift = Math.abs(after.y - before);
  console.log(`  ${name.padEnd(30)} ${String(before).padStart(6)} -> ${landed.slice(0,26).padEnd(26)} -> back ${String(after.y).padStart(6)}  drift ${String(drift).padStart(5)}  ${drift<=40?'OK':'<<< OFF'}${after.t>=0?'  film t='+after.t:''}`);
  await ctx.close();
}

// a FIRST visit must be untouched: top of the page, intro intact
const ctx = await b.newContext({ viewport:{width:W,height:H} });
const p = await ctx.newPage();
await p.goto(BASE+'/',{waitUntil:'domcontentloaded'}).catch(()=>{});
await p.waitForTimeout(3000);
const fresh = await p.evaluate(()=>({y:Math.round(window.scrollY), cls:document.documentElement.className, t:+(document.querySelector('video')?.currentTime??-1).toFixed(2)}));
console.log(`\n  first visit                    y=${fresh.y} cls="${fresh.cls}" film t=${fresh.t}  ${fresh.y===0 && !/cine-done|to-hero/.test(fresh.cls) ? 'OK' : '<<< CHANGED'}`);
await ctx.close();
await b.close();
