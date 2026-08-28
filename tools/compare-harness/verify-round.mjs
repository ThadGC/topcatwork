import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:1600,height:1000} });
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,90)));
await p.goto('http://localhost:3000/',{waitUntil:'load',timeout:60000});
await p.waitForFunction(()=>document.querySelector('[class*="stage"]')?.getAttribute('data-film')==='on',{timeout:40000}).catch(()=>{});
await p.waitForTimeout(1500);

console.log('════ the arrow glare ════');
console.log(' ', await p.evaluate(()=>{
  const i=document.querySelector('[class*="heroCue"] i');
  const sp=i?.querySelector('b span');
  const cs=i?getComputedStyle(i):null, ss=sp?getComputedStyle(sp):null;
  const bs=i?getComputedStyle(i.querySelector('b')):null;
  return JSON.stringify({ arrow:!!i, dip:cs?.animationName, dipDur:cs?.animationDuration,
    sheen:ss?.animationName, sheenDur:ss?.animationDuration, sheenH:ss?.height,
    mask:(bs?.maskImage||bs?.webkitMaskImage||'').slice(0,26)+'...' });
}));

console.log('\n════ the gold ════');
console.log(' ', await p.evaluate(()=>{
  const em=document.querySelector('[class*="heroCopy"] em');
  const cs=em?getComputedStyle(em):null;
  return JSON.stringify({ textShadow:cs?.textShadow, filter:cs?.filter,
    fill:cs?.webkitTextFillColor });
}));

console.log('\n════ trust chips + edge, mid-wipe ════');
const g = await p.evaluate(()=>{const r=document.querySelector('#filmRunway');
  return {top:r.getBoundingClientRect().top+window.scrollY, h:r.offsetHeight};});
for (const t of [0.4, 1.2, 3.0, 5.5]) {
  await p.evaluate(({g,t})=>{const v=document.querySelector('video');
    const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
    window.scrollTo(0, Math.round(g.top+g.h*(t/dur)));},{g,t});
  await p.waitForTimeout(950);
  console.log(' ', await p.evaluate(()=>{
    const st=document.querySelector('[class*="stage"]');
    const tr=document.querySelector('[class*="film-module"][class*="trust"]')||document.querySelector('[class*="_trust"]');
    const hc=document.querySelector('[class*="heroCopy"]');
    const edge=document.querySelector('[class*="_edge"]');
    return JSON.stringify({ t:+(document.querySelector('video')?.currentTime??0).toFixed(2),
      edgeOpacity:edge?getComputedStyle(edge).opacity:null,
      heroOpacity:hc?getComputedStyle(hc).opacity:null,
      heroX:Math.round(hc.getBoundingClientRect().x),
      trustVis:tr?getComputedStyle(tr).visibility:null,
      trustX:tr?Math.round(tr.getBoundingClientRect().x):null,
      bar:document.querySelector('header')?.className });
  }));
}

console.log('\n════ the dead scroll + logo ════');
await p.evaluate(({g})=>window.scrollTo(0,g.top+g.h+40),{g});
await p.waitForTimeout(2400);
console.log(' ', await p.evaluate(()=>{
  const hero=document.querySelector('#hero');
  const rev=document.querySelector('#reviews')||document.querySelector('[id*=review]');
  const hb=hero.getBoundingClientRect();
  return JSON.stringify({ y:Math.round(window.scrollY), heroTop:Math.round(hb.top),
    heroBottom:Math.round(hb.bottom), reviewsTop:rev?Math.round(rev.getBoundingClientRect().top):null,
    deadScroll: rev?Math.round(rev.getBoundingClientRect().top-hb.bottom):null,
    bar:document.querySelector('header')?.className });
}));
// scroll past the hero -> the bar should form
await p.evaluate(()=>window.scrollTo(0, window.innerHeight+200)); await p.waitForTimeout(600);
console.log('  past the hero, bar:', await p.evaluate(()=>document.querySelector('header')?.className));
// logo from there
await p.click('header .brand-logo, header a[class*=brand]'); await p.waitForTimeout(1500);
console.log('  after logo:', await p.evaluate(()=>JSON.stringify({y:Math.round(window.scrollY),
  heroTop:Math.round(document.querySelector('#hero').getBoundingClientRect().top),
  bar:document.querySelector('header')?.className})));
console.log('\n  errors:', errs.length?errs:'none');
await b.close();
