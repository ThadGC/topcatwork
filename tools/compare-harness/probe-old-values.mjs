import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:1600,height:1000} });
const p = await ctx.newPage();
await p.goto('http://localhost:8099/',{waitUntil:'load',timeout:60000});
await p.waitForTimeout(6000);
const read = () => p.evaluate(() => {
  const q=(s)=>document.querySelector(s);
  const o=(s)=>{const e=q(s);return e?{op:getComputedStyle(e).opacity,disp:getComputedStyle(e).display}:null;};
  const root=getComputedStyle(document.documentElement);
  const cine=q('#cine')||q('.cine');
  const cs=cine?getComputedStyle(cine):null;
  const trust=q('#cineTrust')||q('.cine-trust');
  const heroCopy=q('.cine-hero');
  return {
    t:+(q('video')?.currentTime??-1).toFixed(2),
    rootCls:document.documentElement.className,
    bar:q('header')?.className,
    shade:o('.hero-shade'), navgrade:o('.hero-navgrade'), edge:o('.cine-edge, .hero-edge'),
    vars:{ veil:cs?.getPropertyValue('--cineVeil').trim(), nav:cs?.getPropertyValue('--navGrade').trim(),
           edge:cs?.getPropertyValue('--cineEdge').trim(), curve:cs?.getPropertyValue('--cineCurve').trim() },
    rootVars:{ veil:root.getPropertyValue('--cineVeil').trim(), nav:root.getPropertyValue('--navGrade').trim(),
               edge:root.getPropertyValue('--cineEdge').trim() },
    trust: trust?{op:getComputedStyle(trust).opacity,disp:getComputedStyle(trust).display,
      rect:(()=>{const r=trust.getBoundingClientRect();return `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`;})(),
      text:trust.textContent.replace(/\s+/g,' ').trim().slice(0,50)}:null,
    heroCopy: heroCopy?{op:getComputedStyle(heroCopy).opacity, tf:getComputedStyle(heroCopy).transform,
      rect:(()=>{const r=heroCopy.getBoundingClientRect();return `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`;})()}:null,
  };
});
const geom = await p.evaluate(() => { const c=document.querySelector('#cine')||document.querySelector('.cine');
  const cs=getComputedStyle(c);
  return { top:c.getBoundingClientRect().top+window.scrollY, travel:Math.max(1,c.offsetHeight-window.innerHeight),
           hold:parseFloat(cs.getPropertyValue('--cineHold'))||0 }; });
for (const t of [0.4, 1.2, 3.0, 5.5]) {
  await p.evaluate(({g,t})=>{const v=document.querySelector('video');
    const dur=v&&isFinite(v.duration)&&v.duration>1?v.duration:44.25;
    window.scrollTo(0, Math.round(g.top+g.travel*((t/dur)*(1-g.hold))));},{g:geom,t});
  await p.waitForTimeout(1400);
  const r = await read();
  console.log(`\n── t=${r.t} ──`);
  console.log('   bar:', r.bar, '| shade', JSON.stringify(r.shade), '| navgrade', JSON.stringify(r.navgrade), '| edge', JSON.stringify(r.edge));
  console.log('   vars:', JSON.stringify(r.vars), 'root:', JSON.stringify(r.rootVars));
  console.log('   trust:', JSON.stringify(r.trust));
  console.log('   heroCopy:', JSON.stringify(r.heroCopy));
}
await p.evaluate(({g})=>window.scrollTo(0,g.top+g.travel),{g:geom});
await p.waitForTimeout(3500);
await p.evaluate(()=>window.scrollTo(0,0));
await p.waitForTimeout(1200);
const end = await read();
console.log('\n── LOCKED (cine-done) ──');
console.log('   root:', end.rootCls, '| bar:', end.bar);
console.log('   shade', JSON.stringify(end.shade), '| navgrade', JSON.stringify(end.navgrade), '| edge', JSON.stringify(end.edge));
console.log('   vars:', JSON.stringify(end.vars), 'root:', JSON.stringify(end.rootVars));
await b.close();
