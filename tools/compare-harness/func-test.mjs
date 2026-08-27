/**
 * FUNCTIONAL test, not a layout test. Clicks things and asserts they did
 * something. Layout diffs kept coming back clean on pages the client called
 * broken, because "the markup is identical" says nothing about whether the
 * page WORKS.
 *
 *   node func-test.mjs <oldPath> [width]
 */
import { chromium } from 'playwright';
import { prepare } from './probe.mjs';

const OLDP = process.argv[2] || '/trade/';
const W = Number(process.argv[3] || 1440);
const NEWP = OLDP.replace(/index\.html$/,'').replace(/\.html$/,'');

async function run(origin, path, label) {
  const ctx = await browser.newContext({ viewport:{width:W,height:W<720?812:900} });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0,140)));
  page.on('console', m => { if (m.type()==='error') errs.push('console ' + m.text().slice(0,140)); });
  await page.goto(origin+path, { waitUntil:'domcontentloaded', timeout:40000 });
  await page.waitForTimeout(2000);
  await prepare(page);

  const out = { label, errs: [], accordions: [], form: null, links: null, buttons: [] };

  // ---- accordions / details-style toggles -------------------------------
  out.accordions = await page.evaluate(async () => {
    const res = [];
    const toggles = [...document.querySelectorAll('[aria-expanded], details > summary, .faq-q, .tq-q')];
    for (const t of toggles.slice(0, 12)) {
      const panelId = t.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId)
                  : (t.parentElement && t.parentElement.querySelector('[class*=a],[class*=panel]'));
      const before = { exp: t.getAttribute('aria-expanded'), h: panel ? panel.offsetHeight : null };
      t.click();
      await new Promise(r => setTimeout(r, 620));           // let the transition run
      const after = { exp: t.getAttribute('aria-expanded'), h: panel ? panel.offsetHeight : null };
      res.push({ label: (t.textContent||'').replace(/\s+/g,' ').trim().slice(0,34),
                 before, after,
                 changed: before.exp !== after.exp || before.h !== after.h });
      t.click(); await new Promise(r => setTimeout(r, 320));
    }
    return res;
  });

  // ---- the enquiry form: does it validate and does it POST? -------------
  const form = await page.$('form');
  if (form) {
    const posted = [];
    page.on('request', r => { if (r.method()==='POST') posted.push(r.url()); });
    out.form = await page.evaluate(() => {
      const f = document.querySelector('form');
      const fields = [...f.querySelectorAll('input,select,textarea')].map(e => ({
        name: e.name || e.id || '(unnamed)', type: e.type || e.tagName.toLowerCase(),
        required: e.required, disabled: e.disabled,
      }));
      return { action: f.getAttribute('action'), method: f.getAttribute('method'),
               fieldCount: fields.length, fields,
               submitBtns: [...f.querySelectorAll('button,input[type=submit]')]
                 .map(b => (b.textContent||b.value||'').trim().slice(0,26)) };
    });
    // fill and submit
    await page.evaluate(() => {
      const f = document.querySelector('form');
      for (const e of f.querySelectorAll('input,textarea')) {
        if (e.type === 'email') e.value = 'test@example.com';
        else if (e.type === 'tel') e.value = '07000000000';
        else if (e.type !== 'hidden' && e.type !== 'submit') e.value = 'Test';
        e.dispatchEvent(new Event('input', {bubbles:true}));
        e.dispatchEvent(new Event('change', {bubbles:true}));
      }
    });
    await page.waitForTimeout(300);
    const btn = await page.$('form button[type=submit], form button:not([type]), form input[type=submit]');
    if (btn) { await btn.click({ force:true }).catch(()=>{}); await page.waitForTimeout(2200); }
    out.form.postedTo = posted.slice(0,3);
    out.form.afterSubmit = await page.evaluate(() => {
      const f = document.querySelector('form');
      const reply = document.querySelector('[id*=eply],[class*=eply],[class*=thank],[role=status]');
      return { formStillVisible: !!f && f.offsetHeight > 0,
               replyText: reply ? (reply.textContent||'').replace(/\s+/g,' ').trim().slice(0,80) : null,
               invalid: [...document.querySelectorAll(':invalid')].map(e=>e.name||e.id).slice(0,5) };
    });
  }

  // ---- every in-page link resolves --------------------------------------
  const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')]
    .map(a => a.getAttribute('href'))
    .filter(h => h && !h.startsWith('#') && !h.startsWith('tel:') && !h.startsWith('mailto:') && !h.startsWith('http')))]);
  const bad = [];
  for (const h of hrefs.slice(0, 40)) {
    const u = new URL(h, origin).toString();
    const r = await page.request.get(u, { maxRedirects: 3 }).catch(() => null);
    const s = r ? r.status() : 'ERR';
    if (s !== 200) bad.push(`${h} -> ${s}`);
  }
  out.links = { checked: Math.min(hrefs.length,40), total: hrefs.length, bad };
  out.errs = [...new Set(errs)].slice(0,5);
  await ctx.close();
  return out;
}

const browser = await chromium.launch();
const o = await run('http://localhost:8099', OLDP, 'OLD');
const n = await run('http://localhost:3000', NEWP, 'NEW');
await browser.close();

const show = (r) => {
  console.log(`\n===== ${r.label}  ${OLDP} @${W} =====`);
  console.log(' ACCORDIONS:');
  if (!r.accordions.length) console.log('   (none found)');
  for (const a of r.accordions) console.log(`   ${a.changed ? 'WORKS  ' : 'DEAD   '} "${a.label}"  exp ${a.before.exp}->${a.after.exp}  h ${a.before.h}->${a.after.h}`);
  console.log(' FORM:', r.form ? JSON.stringify({action:r.form.action, fields:r.form.fieldCount, submit:r.form.submitBtns,
      postedTo:r.form.postedTo, after:r.form.afterSubmit}) : '(no form)');
  console.log(` LINKS: checked ${r.links.checked}/${r.links.total}  broken=${r.links.bad.length}`);
  r.links.bad.forEach(b => console.log('   BAD ' + b));
  if (r.errs.length) { console.log(' JS ERRORS:'); r.errs.forEach(e => console.log('   ' + e)); }
};
show(o); show(n);
