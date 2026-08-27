/* What each form ACTUALLY puts on the wire. The fetch to /api/enquiry is
   intercepted in the page, so nothing is emailed. */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });

async function capture(path, prep) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:3000' + path, { waitUntil: 'domcontentloaded' });
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' });
  await p.waitForTimeout(1400);
  const skip = p.locator('button', { hasText: /skip intro/i }).first();
  if (await skip.count()) { await skip.click().catch(()=>{}); await p.waitForTimeout(800); }

  // intercept BEFORE submitting; record the multipart, answer ok
  await p.evaluate(() => {
    window.__sent = null;
    const real = window.fetch;
    window.fetch = async (url, init) => {
      if (String(url).includes('/api/enquiry') && init?.body instanceof FormData) {
        const out = { fields: {}, files: [] };
        for (const [k, v] of init.body.entries()) {
          if (typeof v === 'string') out.fields[k] = v.length > 120 ? v.slice(0, 120) + `…(${v.length})` : v;
          else out.files.push({ field: k, name: v.name, size: v.size, type: v.type });
        }
        window.__sent = out;
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
      return real(url, init);
    };
  });

  await prep(p);
  await p.waitForTimeout(1600);
  const sent = await p.evaluate(() => window.__sent);
  await p.close();
  return sent;
}

const tmp = '/private/tmp/claude-501/-Users-thadeusgous-Documents-TOPCAT-WORKTOPS/ee5779c9-86c2-48ff-a444-f466d784f38e/scratchpad/test-plan.pdf';
import fs from 'node:fs';
fs.writeFileSync(tmp, '%PDF-1.4\n% probe\n%%EOF\n');

// ---- 1. the home enquiry card, WITH a stone picked and a file attached ----
const home = await capture('/', async (p) => {
  await p.locator('#ctaForm').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  await p.locator('#ctaStonePick').click(); await p.waitForTimeout(700);
  await p.locator('.sp-modal .sp-tile').first().click(); await p.waitForTimeout(600);
  await p.locator('#ctaForm input[name=name]').fill('Probe Person');
  await p.locator('#ctaForm input[name=email]').fill('probe@example.com');
  await p.locator('#ctaForm input[name=phone]').fill('07700 900123');
  await p.locator('#ctaForm input[name=postcode]').fill('HP1 2AB');
  await p.locator('#ctaForm textarea').first().fill('Probe message');
  const up = p.locator('#ctaForm input[type=file]').first();
  if (await up.count()) await up.setInputFiles(tmp).catch(()=>{});
  await p.waitForTimeout(400);
  await p.locator('#ctaForm button[type=submit]').click();
});
console.log('=== HOME #ctaForm ===');
console.log('fields:', Object.keys(home?.fields || {}).sort().join(', '));
console.log('stone :', home?.fields?.stone);
console.log('form  :', home?.fields?.form_name);
console.log('files :', JSON.stringify(home?.files));
console.log('journey?', !!home?.fields?.journey, '| device:', home?.fields?.device, '| screen:', home?.fields?.screen);

// ---- 2. the trade quick form, with the custom dropdown ----
const trade = await capture('/trade', async (p) => {
  await p.locator('#qform').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  await p.locator('#qfService').click(); await p.waitForTimeout(300);
  await p.locator('.tc-sel-o', { hasText: /Splashbacks/i }).first().click(); await p.waitForTimeout(300);
  await p.locator('#qform input[name=name], #qfName').first().fill('Probe Trade');
  await p.locator('#qform input[name=email], #qfEmail').first().fill('trade@example.com');
  await p.locator('#qform input[name=phone], #qfPhone').first().fill('07700 900999');
  await p.locator('#qform button[type=submit]').first().click();
});
console.log('\n=== TRADE #qform ===');
console.log('fields:', Object.keys(trade?.fields || {}).sort().join(', '));
console.log('service:', trade?.fields?.service, '| form:', trade?.fields?.form_name);

// ---- 3. the estimator's priced-by-hand form ----
const poa = await capture('/estimate', async (p) => {
  const tab = p.locator('.est-tabs .mat-tab', { hasText: /porcelain/i }).first();
  if (await tab.count()) { await tab.click(); await p.waitForTimeout(800); }
  await p.locator('#estPoaForm').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  await p.locator('#estPoaForm input[name=name]').fill('Probe POA');
  await p.locator('#estPoaForm input[name=email]').fill('poa@example.com');
  await p.locator('#estPoaForm input[name=phone]').fill('07700 900777');
  await p.locator('#estPoaForm input[name=postcode]').fill('HP1 2AB');
  const up = p.locator('#estPoaForm input[type=file]').first();
  if (await up.count()) await up.setInputFiles(tmp).catch(()=>{});
  await p.waitForTimeout(400);
  await p.locator('#estPoaForm button[type=submit]').click();
});
console.log('\n=== ESTIMATE #estPoaForm ===');
console.log('fields:', Object.keys(poa?.fields || {}).sort().join(', '));
console.log('stone :', poa?.fields?.stone, '| form:', poa?.fields?.form_name);
console.log('files :', JSON.stringify(poa?.files));
console.log('estimate?', !!poa?.fields?.estimate);

await b.close();
