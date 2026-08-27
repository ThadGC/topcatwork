/* The estimator's priced-by-hand form: does it validate, and does it POST the
   right body? fetch is STUBBED — nothing leaves the browser. Also checks the
   CTA card's own extras still survive with both forms mounted (TC_FORM_EXTRA
   is a single global and both install into it). */
import { chromium } from 'playwright';
const W = Number(process.argv[2]||1440), H = Number(process.argv[3]||900);
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:W,height:H} });
const p = await ctx.newPage();
await p.addInitScript(() => {
  try { document.documentElement.style.scrollBehavior='auto'; } catch {}
  window.__SENT = [];
  const real = window.fetch;
  window.fetch = async (url, init) => {
    if (init && init.body instanceof FormData) {
      const rows = [];
      init.body.forEach((v, k) => rows.push(k + '=' + (v && v.name ? '[file ' + v.name + ']' : String(v).slice(0,70))));
      window.__SENT.push({ url: String(url), rows });
      return new Response(JSON.stringify({ ok: true, via: 'stub' }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return real(url, init);
  };
});
await p.goto('http://localhost:3000/estimate',{waitUntil:'domcontentloaded'}).catch(()=>{});
await p.waitForTimeout(1300);
for (let y=0;y<10;y++){ await p.evaluate(()=>window.scrollBy(0, window.innerHeight*0.7)); await p.waitForTimeout(200); }
await p.evaluate(()=>{document.querySelector('#estimator')?.scrollIntoView();});
await p.waitForTimeout(900);
await p.evaluate(()=>document.querySelector('[data-mat="Marble"]')?.click());
await p.waitForTimeout(1200);

console.log('form present:', await p.evaluate(()=>!!document.querySelector('#estPoaForm')));

// 1. empty submit must be refused
const bad = await p.evaluate(async () => {
  document.querySelector('#estPoaForm').requestSubmit();
  await new Promise(r=>setTimeout(r,400));
  return { note: document.querySelector('#estPoaForm .cta-reply')?.textContent?.trim(), sent: window.__SENT.length };
});
console.log('empty submit  ->', JSON.stringify(bad));

// 2. a real submit
const good = await p.evaluate(async () => {
  const f = document.querySelector('#estPoaForm');
  const set = (n,v) => { const e = f.querySelector(`[name="${n}"]`); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value')?.set || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set; s.call(e, v); e.dispatchEvent(new Event('input',{bubbles:true})); };
  set('name','Test Person'); set('email','test@example.com'); set('phone','07000000000'); set('postcode','AL1 1AA');
  const ta = f.querySelector('[name="message"]');
  Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set.call(ta,'Two runs and an island');
  ta.dispatchEvent(new Event('input',{bubbles:true}));
  f.requestSubmit();
  await new Promise(r=>setTimeout(r,900));
  return { note: f.querySelector('.cta-reply')?.textContent?.trim(), sent: window.__SENT.slice(-1)[0] };
});
console.log('\nfilled submit ->', good.note);
console.log('  POST', good.sent?.url);
for (const r of (good.sent?.rows||[])) console.log('   ', r);

// 3. the CTA card on the same page must still carry its own extras
const cta = await p.evaluate(async () => {
  document.dispatchEvent(new CustomEvent('topcat:stone', { detail: { name:'Azul Shimmer', mat:'Quartz', kind:'Quartz', slug:'azul-shimmer' } }));
  await new Promise(r=>setTimeout(r,400));
  const f = document.querySelector('#ctaForm');
  const set = (n,v) => { const e = f.querySelector(`[name="${n}"]`); Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(e,v); e.dispatchEvent(new Event('input',{bubbles:true})); };
  set('name','Second Person'); set('email','two@example.com'); set('phone','07111111111'); set('postcode','AL1 2BB');
  f.requestSubmit();
  await new Promise(r=>setTimeout(r,900));
  return window.__SENT.slice(-1)[0];
});
console.log('\nCTA card after both mounted ->');
for (const r of (cta?.rows||[])) if (/stone|form_name|name=/.test(r)) console.log('   ', r);
await ctx.close(); await b.close();
