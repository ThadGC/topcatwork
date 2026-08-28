/* After the film strip: does the home page still render, is the hero copy
   visible, is the bar formed, and is there any trace of the film left? */
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
fs.mkdirSync('out', { recursive: true });
for (const [w, h, dsf, label] of [[390,844,3,'phone'],[900,900,2,'tablet'],[1440,900,2,'desktop']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,120)); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0,120)));
  await p.goto('http://localhost:3000/', { waitUntil:'load', timeout:45000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => {
    const h1 = document.querySelector('#hero h1');
    const cs = h1 ? getComputedStyle(h1) : null;
    const el = document.querySelector('#hero .hero-el');
    const img = document.querySelector('#hero img');
    return {
      rootClass: document.documentElement.className,
      heroClass: document.querySelector('#hero')?.className || null,
      barClass: document.querySelector('header')?.className || null,
      h1: h1?.textContent?.trim().slice(0,48) || null,
      h1Opacity: cs?.opacity ?? null,
      heroElOpacity: el ? getComputedStyle(el).opacity : null,
      heroElTransform: el ? getComputedStyle(el).transform : null,
      img: img ? { src: (img.currentSrc||'').split('/').pop(), w: img.naturalWidth, h: img.naturalHeight } : null,
      videos: document.querySelectorAll('video').length,
      docHeight: document.documentElement.scrollHeight,
      viewportH: window.innerHeight,
      skip: !!document.querySelector('button,a') && [...document.querySelectorAll('button,a')].some(e=>/skip intro/i.test(e.textContent||'')),
      fabs: [...document.querySelectorAll('.wa-fab,.call-fab')].map(e=>getComputedStyle(e).display),
    };
  });
  // scroll down a little to confirm nothing jumps
  await p.mouse.move(w/2, h/2); await p.mouse.wheel(0, 600); await p.waitForTimeout(600);
  const afterScroll = await p.evaluate(() => ({ y: Math.round(window.scrollY), bar: document.querySelector('header')?.className }));
  await p.screenshot({ path:`out/strip-${label}.png` });
  console.log(`\n=== ${label} ${w}x${h} ===`);
  console.log(JSON.stringify(r, null, 1));
  console.log(' after 600px scroll:', JSON.stringify(afterScroll));
  console.log(' console errors:', errs.length ? errs : 'none');
  await ctx.close();
}
await b.close();
