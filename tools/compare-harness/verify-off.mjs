import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
console.log('════ the film-off states — the still must BE the hero ════');
for (const [q,label,rm] of [['?film=off','film=off',false],['','reduced-motion',true]]) {
  const ctx = await b.newContext({ viewport:{width:1440,height:900},
    reducedMotion: rm ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,90)));
  await p.goto('http://localhost:3000/'+q,{waitUntil:'load',timeout:60000});
  await p.waitForTimeout(3500);
  console.log(' ', label, await p.evaluate(()=>{
    const st=document.querySelector('[class*="stage"]'), hr=document.querySelector('#hero');
    const cs=getComputedStyle(st);
    const still=document.querySelector('[class*="_still"]');
    return JSON.stringify({ film:st?.getAttribute('data-film'), pos:cs.position,
      vis:cs.visibility, stillOp:still?getComputedStyle(still).opacity:null,
      ink:hr?.hasAttribute('data-ink'), heroOp:hr?getComputedStyle(hr).opacity:null,
      runway:getComputedStyle(document.querySelector('#filmRunway')).height,
      doc:document.documentElement.scrollHeight,
      h1:document.querySelector('main h1')?.textContent?.trim().slice(0,30) });
  }), errs.length?('ERRORS '+errs):'');
  await p.screenshot({path:`out/h2/off-${label}.png`});
  await ctx.close();
}
await b.close();
