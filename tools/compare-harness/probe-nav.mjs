import { chromium } from 'playwright';
const W = Number(process.argv[2] || 1440);
const PAGES = [
  ['OLD landing ', 'http://localhost:8099/'],
  ['OLD inner   ', 'http://localhost:8099/services/kitchen-worktops.html'],
  ['OLD location', 'http://localhost:8099/worktops/hertfordshire/st-albans/'],
  ['NEW landing ', 'http://localhost:3000/'],
  ['NEW inner   ', 'http://localhost:3000/services/kitchen-worktops'],
  ['NEW location', 'http://localhost:3000/worktops/hertfordshire/st-albans'],
];
const b = await chromium.launch();
for (const [name, url] of PAGES) {
  const ctx = await b.newContext({ viewport: { width: W, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' }).catch(()=>{});
  await p.waitForTimeout(1800);
  const r = await p.evaluate(() => {
    const bar = document.querySelector('header.bar') || document.querySelector('header');
    const top = bar ? [...bar.querySelectorAll('a,button')].map(e => ({
      t: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,14),
      tag: e.tagName, cls: (e.className||'').toString().slice(0,26),
      pop: e.getAttribute('aria-haspopup'), exp: e.getAttribute('aria-expanded'),
      ctrl: e.getAttribute('aria-controls'),
    })) : [];
    // any desktop dropdown panel in the header?
    const panels = [...document.querySelectorAll('header [class*=drop],header [class*=mega],header [class*=sub],header [class*=panel],header ul ul,.nav-drop,.top-sub')]
      .map(e => e.className.toString().slice(0,34) + ' kids=' + e.children.length);
    return { barCls: bar ? bar.className : 'NO BAR', triggers: top.filter(x=>x.pop||x.exp||x.ctrl), all: top.map(x=>x.t).filter(Boolean), panels };
  });
  console.log(`\n=== ${name} @${W} ===`);
  console.log('  items   :', r.all.join(' | '));
  console.log('  triggers:', r.triggers.length ? JSON.stringify(r.triggers) : 'NONE');
  console.log('  panels  :', r.panels.length ? r.panels.join(' ;; ') : 'none');
  await ctx.close();
}
await b.close();
