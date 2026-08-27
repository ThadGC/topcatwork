import { chromium } from 'playwright';
import { prepare } from './probe.mjs';
import { mkdirSync } from 'node:fs';
const OLDP = process.argv[2], W = Number(process.argv[3]||1440), TAG = process.argv[4]||'page';
const NEWP = OLDP.replace(/index\.html$/,'').replace(/\.html$/,'');
mkdirSync('out',{recursive:true});
const b = await chromium.launch();
for (const [name, origin, path] of [['old','http://localhost:8099',OLDP],['new','http://localhost:3000',NEWP]]) {
  const ctx = await b.newContext({ viewport:{width:W,height:W<720?812:900} });
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
  p.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text().slice(0,200)); });
  const resp = await p.goto(origin+path,{waitUntil:'domcontentloaded',timeout:40000}).catch(e=>null);
  await p.waitForTimeout(2200);
  await prepare(p);
  // A fullPage screenshot does NOT fire the `.rise` IntersectionObservers, so
  // everything below the fold stays parked at opacity:0 and the capture comes
  // back as one long black void — on BOTH builds. Walk the page first, at an
  // identical cadence on each, then return to the top and capture.
  await p.evaluate(async () => {
    const step = Math.round(innerHeight * 0.8);
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 190));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(1400);
  await p.screenshot({ path:`out/${TAG}-${name}-${W}.png`, fullPage:true });
  const info = await p.evaluate(()=>({
    status: document.readyState, title: document.title,
    docH: document.documentElement.scrollHeight,
    h1: document.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim().slice(0,60) ?? 'NO H1',
    sections: [...document.querySelectorAll('section,main>div')].length,
    imgs: document.querySelectorAll('img').length,
    brokenImgs: [...document.querySelectorAll('img')].filter(i=>i.complete && i.naturalWidth===0).map(i=>i.getAttribute('src')).slice(0,8),
    forms: document.querySelectorAll('form').length,
    buttons: document.querySelectorAll('button').length,
    links: document.querySelectorAll('a[href]').length,
    bodyText: (document.body.innerText||'').replace(/\s+/g,' ').trim().length,
  }));
  console.log(`--- ${name} (${origin+path}) http=${resp?resp.status():'ERR'}`);
  console.log('   ', JSON.stringify(info));
  if (errs.length) console.log('    ERRORS:', errs.slice(0,4));
  await ctx.close();
}
await b.close();
console.log('saved out/'+TAG+'-old/new-'+W+'.png');
