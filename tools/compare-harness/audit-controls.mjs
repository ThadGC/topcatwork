/* Every link target and every button on the pages a visitor actually uses.
   - a[href^="#"]        the element must EXIST on this page
   - a[href="x#y"]       the element must exist on THAT page
   - a[href=tel:/mailto:] well-formed
   - button              click it and assert the page changed somehow */
import { chromium } from 'playwright';
import crypto from 'node:crypto';
const PAGES = ['/', '/services', '/projects', '/stones', '/stone-selector', '/estimate',
  '/about', '/contact', '/trade', '/guides', '/materials', '/worktops', '/sitemap',
  '/stones/almond-beige.html', '/services/kitchen-worktops.html',
  '/materials/quartz-worktops.html', '/guides/20mm-vs-30mm-quartz-worktops.html',
  '/worktops/hertfordshire', '/stones/compare.html', '/privacy', '/terms'];

const b = await chromium.launch({ channel: 'chrome' });
const deadAnchors = [], badProto = [], deadButtons = [], externals = new Set();
const pageCache = new Map();

async function idsOf(ctx, path) {
  if (pageCache.has(path)) return pageCache.get(path);
  const p = await ctx.newPage();
  let ids = new Set();
  try {
    const r = await p.goto('http://localhost:3000' + path, { waitUntil: 'domcontentloaded' });
    if (r && r.ok()) {
      await p.waitForTimeout(900);
      ids = new Set(await p.evaluate(() => [...document.querySelectorAll('[id]')].map(e => e.id)));
    }
  } catch { /* recorded as dead below */ }
  await p.close();
  pageCache.set(path, ids);
  return ids;
}

const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
for (const path of PAGES) {
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000' + path, { waitUntil: 'domcontentloaded' });
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' });
  await p.waitForTimeout(1500);
  const skip = p.locator('button', { hasText: /skip intro/i }).first();
  if (await skip.count()) { await skip.click().catch(()=>{}); await p.waitForTimeout(700); }

  /* ONLY WHAT A VISITOR CAN CLICK. Collecting hidden anchors too reported
     `#estPoaForm` as dead on three pages: that button lives in the priced-by-
     hand panel, so it is invisible until a POA material is chosen, and the
     form it points at is rendered at the same moment. Verified at 390 and
     1440: when the button is visible, the target exists and is visible. */
  const links = await p.evaluate(() =>
    [...document.querySelectorAll('a[href]')]
      .filter(a => !!a.offsetParent || getComputedStyle(a).position === 'fixed')
      .map(a => ({
        href: a.getAttribute('href'),
        txt: (a.textContent || a.getAttribute('aria-label') || '').replace(/\s+/g,' ').trim().slice(0, 40),
      })));
  const localIds = new Set(await p.evaluate(() => [...document.querySelectorAll('[id]')].map(e => e.id)));

  for (const { href, txt } of links) {
    if (!href) continue;
    if (/^(https?:)?\/\//.test(href)) { externals.add(href); continue; }
    if (href.startsWith('tel:')) { if (!/^tel:\+?[0-9 ]{7,}$/.test(href)) badProto.push(`${path} ${href}`); continue; }
    if (href.startsWith('mailto:')) { if (!/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(href)) badProto.push(`${path} ${href}`); continue; }
    if (href.startsWith('#')) {
      const id = decodeURIComponent(href.slice(1));
      if (id && !localIds.has(id)) deadAnchors.push(`${path}  "${txt}" -> ${href}  (no #${id} on this page)`);
      continue;
    }
    if (href.includes('#')) {
      const [target, frag] = href.split('#');
      if (!frag) continue;
      /* NOT DEAD: /stones/ reads the hash as a MATERIAL FILTER (HASH_TO_MAT in
         StoneCollection.tsx), not as an element id. Verified: the grid goes
         132 -> 67 quartz / 45 marble / 20 granite. The first run of this
         script reported all three as dead anchors, wrongly. */
      if (/^\/stones\/?$/.test(target) && /^(quartz|marble|granite)$/i.test(frag)) continue;
      const ids = await idsOf(ctx, target || path);
      if (!ids.size) { deadAnchors.push(`${path}  "${txt}" -> ${href}  (target page unreachable)`); continue; }
      if (!ids.has(decodeURIComponent(frag))) deadAnchors.push(`${path}  "${txt}" -> ${href}  (no #${frag} on ${target})`);
    }
  }

  /* Buttons: click each and assert SOMETHING happened. */
  const btnCount = await p.locator('button:visible').count();
  for (let i = 0; i < Math.min(btnCount, 24); i++) {
    const btn = p.locator('button:visible').nth(i);
    let label = '';
    try { label = ((await btn.textContent()) || (await btn.getAttribute('aria-label')) || '').replace(/\s+/g,' ').trim().slice(0,34); } catch { continue; }
    if (/^(skip intro)$/i.test(label)) continue;
    /* PIXELS, not DOM length. The first version of this compared url/scroll/
       innerHTML.length and called 30 working controls dead: the services
       helix, the review "Read more", the carousel arrows and the FAQ rows all
       move by transform or class alone. Every one was re-tested by hashing a
       screenshot and every one changed. */
    const shot = async () => {
      try { return crypto.createHash('md5').update(await p.screenshot()).digest('hex'); }
      catch { return null; }
    };
    /* The screenshot is the VIEWPORT. A control whose effect lands off-screen
       reads as dead, which is how the estimator's own material tabs and the
       review "Read more" got flagged on the previous run. */
    try { await btn.scrollIntoViewIfNeeded({ timeout: 1500 }); } catch { continue; }
    await p.waitForTimeout(350);
    const urlBefore = p.url();
    const before = await shot();
    if (!before) continue;
    try { await btn.click({ timeout: 2500 }); } catch { continue; }
    await p.waitForTimeout(900);            // let transitions land
    const after = await shot();
    const urlAfter = p.url();
    if (after && before === after && urlAfter === urlBefore) {
      deadButtons.push(`${path}  "${label || '(no label)'}"`);
    }
    if (urlAfter !== urlBefore) { await p.goto('http://localhost:3000' + path, { waitUntil:'domcontentloaded' }); await p.waitForTimeout(1100); }
    else { await p.keyboard.press('Escape').catch(()=>{}); await p.waitForTimeout(150); }
  }
  await p.close();
  process.stdout.write('.');
}
console.log('\n\n=== DEAD IN-PAGE ANCHORS ===', deadAnchors.length);
deadAnchors.forEach(x => console.log('  ' + x));
console.log('\n=== MALFORMED tel:/mailto: ===', badProto.length);
badProto.forEach(x => console.log('  ' + x));
console.log('\n=== BUTTONS THAT DID NOTHING VISIBLE ===', deadButtons.length);
deadButtons.forEach(x => console.log('  ' + x));
console.log('\n=== EXTERNAL LINKS ===');
[...externals].sort().forEach(x => console.log('  ' + x));
await b.close();
