import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OLD = 'http://localhost:8099';
const NEW = 'http://localhost:3000';
const OUT = 'out/projfix';
mkdirSync(OUT, { recursive: true });

const W = Number(process.argv[2] || 1440);
const H = W === 375 ? 812 : W === 900 ? 1000 : 900;

async function prep(page, base, path) {
  await page.goto(base + path, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = 'auto'));
  await page.waitForTimeout(1200);
  if (path === '/') {
    // OLD: #cineSkip. NEW: a <button> whose TEXT is "Skip intro".
    await page.evaluate(() => {
      const b =
        document.getElementById('cineSkip') ||
        [...document.querySelectorAll('button,a')].find((e) => /skip intro/i.test(e.textContent || ''));
      if (b) b.click();
    });
    await page.waitForTimeout(1800);
  }
  await page.waitForTimeout(600);
}

async function openProject(page, key) {
  await page.evaluate(() => document.getElementById('gallery')?.scrollIntoView({ block: 'start', behavior: 'auto' }));
  await page.waitForTimeout(700);
  await page.evaluate((k) => {
    const cs = [...document.querySelectorAll('.gal-card')];
    (cs.find((c) => c.dataset.key === k) || cs[0])?.click();
  }, key);
  await page.waitForTimeout(2000); // separate tick: rAF ragged-check + transitions
}

async function probe(base, label) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  const r = { label };

  // ---- 1. portal parents + stones bleed, from the HOME page ----
  await prep(page, base, '/');
  await openProject(page, 'harrow');
  r.parents = await page.evaluate(() => ({
    detail: document.getElementById('projDetail')?.parentElement?.tagName ?? null,
    lightbox: document.getElementById('projLightbox')?.parentElement?.tagName ?? null,
    grid: document.querySelector('.gal-grid-view')?.parentElement?.tagName ?? null,
  }));
  // scroll the page behind the open overlay down to #stones and see what paints
  await page.evaluate(() => window.scrollTo(0, (document.getElementById('stones')?.offsetTop ?? 7900) - 40));
  await page.waitForTimeout(1200);
  r.bleed = await page.evaluate(() => {
    const d = document.getElementById('projDetail');
    const pts = [];
    for (let gx = 1; gx <= 6; gx++)
      for (let gy = 1; gy <= 6; gy++)
        pts.push([Math.round((innerWidth * gx) / 7), Math.round((innerHeight * gy) / 7)]);
    const leaks = new Set();
    for (const [x, y] of pts) {
      const el = document.elementFromPoint(x, y);
      if (!el) continue;
      const b = el.getBoundingClientRect();
      if (b.width <= 40 || b.height <= 8) continue;
      if (!d?.contains(el) && !el.closest('header.bar')) {
        leaks.add(el.tagName + (el.id ? '#' + el.id : '') + '.' + String(el.className).trim().split(/\s+/)[0]);
      }
    }
    return [...leaks];
  });
  await page.screenshot({ path: `${OUT}/${label}-${W}-bleed.png` });

  // ---- 2. bar logo click closes the project ----
  await page.evaluate(() => document.querySelector('header.bar a.brand')?.click());
  await page.waitForTimeout(1500);
  r.afterLogo = await page.evaluate(() => ({
    detailOn: document.getElementById('projDetail')?.classList.contains('on') ?? null,
    projOpen: document.documentElement.classList.contains('proj-open'),
    scrollY: window.scrollY,
  }));
  await page.screenshot({ path: `${OUT}/${label}-${W}-afterlogo.png` });

  // ---- 3. .proj-brand plate, per project, on /projects/ ----
  await prep(page, base, '/projects/');
  r.plates = {};
  for (const k of ['wimbledon', 'central-london', 'harlow', 'harrow', 'hornchurch']) {
    await page.evaluate(() => {
      const d = document.getElementById('projDetail');
      const c = document.getElementById('projClose');
      if (d?.classList.contains('on')) c?.click();
    });
    await page.waitForTimeout(700);
    await openProject(page, k);
    r.plates[k] = await page.evaluate(() => {
      const wrap = document.getElementById('projMedia');
      const plate = wrap?.querySelector('.proj-brand');
      const pb = plate?.getBoundingClientRect();
      return {
        cells: wrap ? wrap.children.length : 0,
        plate: plate ? `${Math.round(pb.width)}x${Math.round(pb.height)}` : null,
        counterTotal: document.getElementById('plCounter')?.textContent ?? '',
      };
    });
  }
  await page.screenshot({ path: `${OUT}/${label}-${W}-plate.png` });

  // ---- 4. lightbox: is Minimise reachable? ----
  await page.evaluate(() => {
    const d = document.getElementById('projDetail');
    if (d?.classList.contains('on')) document.getElementById('projClose')?.click();
  });
  await page.waitForTimeout(600);
  await openProject(page, 'harrow');
  await page.evaluate(() => {
    const d = document.getElementById('projDetail');
    if (d) d.scrollTop = 1250;
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('.proj-ph')?.click());
  await page.waitForTimeout(1400);
  r.lightbox = await page.evaluate(() => {
    const btn = document.getElementById('plClose');
    if (!btn) return { present: false };
    const b = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return {
      present: true,
      rect: [b.left, b.top, b.width, b.height].map(Math.round),
      hits: hit ? hit.tagName + (hit.id ? '#' + hit.id : '') + '.' + String(hit.className).trim().split(/\s+/)[0] : null,
      reachable: hit ? btn.contains(hit) || hit === btn : false,
      counter: document.getElementById('plCounter')?.textContent ?? '',
    };
  });
  await page.screenshot({ path: `${OUT}/${label}-${W}-lightbox.png` });

  await browser.close();
  return r;
}

const oldR = await probe(OLD, 'old');
const newR = await probe(NEW, 'new');
console.log(JSON.stringify({ width: W, old: oldR, new: newR }, null, 1));
