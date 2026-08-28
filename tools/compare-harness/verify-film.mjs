/* The rebuilt film: does it mount, is the pin structurally what it must be,
   does the scrub track the scroll, and is the loop clean? */
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out', { recursive: true });

for (const [w,h,dsf,label] of [[390,844,3,'phone'],[900,900,2,'tablet'],[1440,900,2,'desktop']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,160)); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0,160)));
  await p.goto('http://localhost:3000/', { waitUntil:'load', timeout:60000 });
  await p.waitForFunction(() => {
    const s = document.querySelector('[class*="stage"]');
    return s && s.getAttribute('data-film') === 'on';
  }, { timeout: 40000 }).catch(()=>{});
  await p.waitForTimeout(1500);

  const structure = await p.evaluate(() => {
    const stage = document.querySelector('[class*="film_stage"],[class*="stage"]');
    const chain = [];
    let n = stage?.parentElement;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      chain.push({ tag:n.tagName.toLowerCase(), position:cs.position,
        overflow:cs.overflow, transform:cs.transform==='none'?'-':'YES',
        filter:cs.filter==='none'?'-':'YES', willChange:cs.willChange,
        perspective:cs.perspective==='none'?'-':'YES', contain:cs.contain });
      n = n.parentElement;
    }
    const cs = stage ? getComputedStyle(stage) : null;
    const runway = document.querySelector('[class*="runway"]');
    return {
      stageParent: stage?.parentElement?.tagName?.toLowerCase() ?? null,
      stagePosition: cs?.position, stageHeight: cs?.height, stageZ: cs?.zIndex,
      dataFilm: stage?.getAttribute('data-film'),
      ancestors: chain,
      runwayHeight: runway ? getComputedStyle(runway).height : null,
      docHeight: document.documentElement.scrollHeight,
      videoSrcIsBlob: (document.querySelector('video')?.src || '').startsWith('blob:'),
      videoDims: (() => { const v=document.querySelector('video'); return v?`${v.videoWidth}x${v.videoHeight}`:null; })(),
      hasPerspective: !!document.querySelector('[class*="story"]') &&
        getComputedStyle(document.querySelector('[class*="story"]')).perspective !== 'none',
      h1InMain: !!document.querySelector('main h1'),
      heroInMain: !!document.querySelector('main #hero'),
    };
  });

  // scrub: does film time track scroll?
  const track = [];
  for (const frac of [0, 0.15, 0.35, 0.55, 0.75, 0.95]) {
    await p.evaluate((f) => {
      const r = document.querySelector('[class*="runway"]');
      const top = r.getBoundingClientRect().top + window.scrollY;
      const filmPx = r.offsetHeight - window.innerHeight * 2; // film + tail
      window.scrollTo(0, Math.round(top + filmPx * f));
    }, frac);
    await p.waitForTimeout(700);
    track.push(await p.evaluate(() => ({
      y: Math.round(window.scrollY),
      t: +(document.querySelector('video')?.currentTime ?? -1).toFixed(2),
      film: document.querySelector('[class*="stage"]')?.getAttribute('data-film'),
    })));
  }

  console.log(`\n════ ${label} ${w}x${h} ════`);
  console.log('  stage parent    :', structure.stageParent, '| position', structure.stagePosition,
              '| height', structure.stageHeight, '| z', structure.stageZ, '| data-film', structure.dataFilm);
  console.log('  ancestors       :', structure.ancestors.map(a=>`${a.tag}(pos=${a.position},ovf=${a.overflow},tf=${a.transform})`).join(' <- '));
  console.log('  runway height   :', structure.runwayHeight, '| doc', structure.docHeight);
  console.log('  video           :', structure.videoDims, '| blob src:', structure.videoSrcIsBlob);
  console.log('  perspective     :', structure.hasPerspective ? 'PRESENT (BAD)' : 'none (good)');
  console.log('  h1 in <main>    :', structure.h1InMain, '| #hero in <main>:', structure.heroInMain);
  console.log('  scrub           :', track.map(x=>`y${x.y}->t${x.t}`).join('  '));
  console.log('  console errors  :', errs.length ? errs : 'none');
  await p.screenshot({ path:`out/film-${label}.png` });
  await ctx.close();
}
await b.close();
