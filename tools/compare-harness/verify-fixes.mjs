import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out/fix', { recursive: true });
for (const [w,h,dsf,label] of [[390,844,3,'phone'],[1440,900,2,'desktop']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,100)));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,100));});
  await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
  await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
  await p.waitForTimeout(1500);

  // 1. the hero at the END of the film — over the kitchen, arriving in place
  const geom = await p.evaluate(() => {
    const r = document.querySelector('#filmRunway');
    return { top: r.getBoundingClientRect().top+window.scrollY, h: r.offsetHeight, vh: window.innerHeight };
  });
  for (const [frac,name] of [[0.985,'end'],[0.6,'mid']]) {
    await p.evaluate(({g,f}) => window.scrollTo(0, Math.round(g.top + (g.h-g.vh)*f)), {g:geom,f:frac});
    await p.waitForTimeout(1400);
    const st = await p.evaluate(() => {
      const ph = document.querySelector('#hero');
      const cs = ph?getComputedStyle(ph):null;
      const stage = document.querySelector('[class*="stage"]');
      return { ink: ph?.hasAttribute('data-ink'), loaded: ph?.classList.contains('loaded'),
               heroOpacity: cs?.opacity, heroTransform: cs?.transform,
               heroPosition: cs?.position, film: stage?.getAttribute('data-film'),
               t: +(document.querySelector('video')?.currentTime??-1).toFixed(2) };
    });
    console.log(`  ${label} @${frac}: t=${st.t} film=${st.film} ink=${st.ink} heroOpacity=${st.heroOpacity} pos=${st.heroPosition}`);
    await p.screenshot({ path:`out/fix/${label}-${name}.png` });
  }

  // 2. the marble floor below the film
  await p.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight*0.55)));
  await p.waitForTimeout(1200);
  const floor = await p.evaluate(() => {
    const before = getComputedStyle(document.body,'::before');
    const over = document.querySelector('[class*="overFilm"]');
    const oc = over?getComputedStyle(over):null;
    return { bodyBeforeBg: (before.backgroundImage.match(/stone-floor\.webp/)?.[0]) ?? 'MISSING',
             bodyBeforePos: before.position,
             overFilmBg: oc?.backgroundColor, overFilmImage: oc?.backgroundImage,
             stageVisible: getComputedStyle(document.querySelector('[class*="stage"]')).visibility };
  });
  console.log(`  ${label} below the film: marble=${floor.bodyBeforeBg} (${floor.bodyBeforePos}), overFilm bg=${floor.overFilmBg}/${floor.overFilmImage}, stage=${floor.stageVisible}`);
  await p.screenshot({ path:`out/fix/${label}-below.png` });
  console.log(`  ${label} errors: ${errs.length?errs:'none'}`);
  await ctx.close();
}
await b.close();
