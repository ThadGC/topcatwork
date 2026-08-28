/* CAPTURE THE FILM SPEC.
   Drives the hero film to every moment that has text on screen, on all three
   device bands, on both builds, and records BOTH the picture and the exact
   geometry of every text element. This is the record the film is rebuilt from,
   so it is written outside the repo (~/Documents/TOPCAT-FILM-SPEC) and not
   into out/, which is gitignored and gets wiped. */
import { chromium } from 'playwright';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const OUT = path.join(os.homedir(), 'Documents/TOPCAT-FILM-SPEC/frames');
fs.mkdirSync(OUT, { recursive: true });

const BANDS = [
  { key: 'phone',   w: 390,  h: 844, dsf: 3 },
  { key: 'tablet',  w: 900,  h: 900, dsf: 2 },
  { key: 'desktop', w: 1440, h: 900, dsf: 2 },
];

/* Beat windows differ per band (lib/timeline.ts), so the capture list does too.
   Every entry is a film TIME in seconds with a note on why it is in the list. */
const TIMES = {
  phone:   [0, 0.6, 1.6, 3.0, 5.0, 6.2, 10.0, 13.0, 14.5, 15.0, 15.6, 16.2, 17.0, 18.0,
            19.5, 21.5, 23.0, 24.0, 26.0, 28.5, 30.3, 32.5, 35.0, 37.5, 39.5, 41.5, 44.0],
  tablet:  [0, 0.6, 1.6, 3.0, 5.0, 6.2, 10.0, 13.0, 13.6, 14.2, 15.0, 16.0, 17.5, 19.0,
            21.0, 23.0, 24.5, 26.0, 28.5, 30.3, 32.5, 35.0, 37.5, 39.5, 41.5, 44.0],
  desktop: [0, 0.6, 1.6, 3.0, 5.0, 6.2, 8.0, 10.3, 10.9, 11.5, 12.2, 13.2, 14.5, 16.0,
            18.0, 21.0, 23.0, 24.5, 27.0, 28.5, 30.2, 33.0, 35.3, 37.0, 38.5, 41.0, 44.0],
};

const BUILDS = [
  { key: 'NEW', base: 'http://localhost:3000' },
  { key: 'OLD', base: 'http://localhost:8099' },
];

/* Read every text element the film animates, by CONTENT not by class, so the
   same probe works on the old vanilla build and the React port. */
const READ = () => {
  const px = (n) => Math.round(n * 100) / 100;
  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: px(r.left), y: px(r.top), w: px(r.width), h: px(r.height),
             cx: px(r.left + r.width / 2), cy: px(r.top + r.height / 2) };
  };
  const find = (re) => [...document.querySelectorAll('p,div,span,button')]
    .filter((e) => re.test((e.textContent || '').trim()))
    .filter((e) => !e.querySelector('p,button'))
    .sort((a, b) => (a.textContent || '').length - (b.textContent || '').length)[0] || null;

  const grab = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const vars = {};
    for (const k of ['--lx', '--ly', '--lz', '--lsc', '--lg', '--hz', '--tx',
                     '--filmU', '--filmX', '--filmY', '--cineVeil', '--navGrade', '--cineEdge']) {
      const v = cs.getPropertyValue(k).trim();
      if (v) vars[k] = v;
    }
    const panes = [...el.querySelectorAll('[data-rv]')].map((p) => ({
      rv: p.getAttribute('data-rv'),
      transform: getComputedStyle(p).transform,
      origin: getComputedStyle(p).transformOrigin,
      visibility: getComputedStyle(p).visibility,
      overflow: getComputedStyle(p).overflow,
    }));
    return {
      rect: rectOf(el),
      opacity: +cs.opacity,
      visibility: cs.visibility,
      display: cs.display,
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      fontWeight: cs.fontWeight,
      textAlign: cs.textAlign,
      transform: cs.transform,
      filter: cs.filter,
      top: cs.top, left: cs.left, right: cs.right, bottom: cs.bottom,
      width: cs.width, padding: cs.padding,
      vars: Object.keys(vars).length ? vars : undefined,
      panes: panes.length ? panes : undefined,
    };
  };

  const v = document.querySelector('video');
  const root = document.documentElement;
  const cine = document.querySelector('#cine') || document.querySelector('.cine');
  const cineVars = {};
  if (cine) {
    const cs = getComputedStyle(cine);
    for (const k of ['--filmU', '--filmX', '--filmY', '--cineVeil', '--navGrade',
                     '--cineEdge', '--cineCurve', '--cineH', '--cineHold']) {
      const val = cs.getPropertyValue(k).trim();
      if (val) cineVars[k] = val;
    }
  }
  return {
    t: +(v?.currentTime ?? 0).toFixed(3),
    dur: +(v?.duration ?? 0).toFixed(3),
    videoW: v?.videoWidth ?? 0, videoH: v?.videoHeight ?? 0,
    videoSrc: v?.currentSrc ? v.currentSrc.split('/').pop() : null,
    scrollY: Math.round(window.scrollY),
    rootClass: root.className,
    cineVars,
    beat1: grab(find(/^It starts as a mountain\.?$/i)),
    beat2: grab(find(/slab you choose is\s*unique/i)),
    beat3: grab(find(/stone sets the tone of\s*the room/i)),
    heroCopy: grab(find(/^Your worktop\s*starts here\.?$/i)),
    skip: grab([...document.querySelectorAll('button,a')]
      .find((e) => /skip intro/i.test(e.textContent || '')) || null),
    videoBox: (() => {
      if (!v) return null;
      const r = v.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top),
               w: Math.round(r.width), h: Math.round(r.height) };
    })(),
  };
};

const browser = await chromium.launch({ channel: 'chrome' });

for (const build of BUILDS) {
  for (const band of BANDS) {
    const ctx = await browser.newContext({
      viewport: { width: band.w, height: band.h },
      deviceScaleFactor: band.dsf,
    });
    const page = await ctx.newPage();
    const rows = [];
    try {
      await page.goto(build.base + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch { await ctx.close(); continue; }
    await page.waitForTimeout(5000);
    // Kill smooth scroll; arm the visitor-gesture stand-down with a real wheel.
    await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' }).catch(() => {});
    await page.mouse.move(band.w / 2, band.h / 2);
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(500);

    const geom = await page.evaluate(() => {
      const c = document.querySelector('#cine') || document.querySelector('.cine');
      if (!c) return null;
      const cs = getComputedStyle(c);
      return {
        top: c.getBoundingClientRect().top + window.scrollY,
        travel: Math.max(1, c.offsetHeight - window.innerHeight),
        hold: parseFloat(cs.getPropertyValue('--cineHold')) || 0,
      };
    });
    if (!geom) { await ctx.close(); continue; }

    console.log(`\n=== ${build.key} ${band.key} ${band.w}x${band.h} travel=${Math.round(geom.travel)} hold=${geom.hold} ===`);

    for (const t of TIMES[band.key]) {
      // scrollY for a wanted film time: t/dur = film, film*(1-hold) = target
      await page.evaluate(({ t, geom }) => {
        const v = document.querySelector('video');
        const dur = v && isFinite(v.duration) && v.duration > 1 ? v.duration : 44.25;
        const target = Math.min(1, (t / dur) * (1 - geom.hold));
        window.scrollTo(0, Math.round(geom.top + geom.travel * target));
      }, { t, geom });

      // let the two-stage ease and the seek land
      let ok = false;
      for (let i = 0; i < 24; i++) {
        await page.waitForTimeout(180);
        const now = await page.evaluate(() => document.querySelector('video')?.currentTime ?? 0);
        if (Math.abs(now - t) < 0.2 || (t >= 43 && now >= 43)) { ok = true; break; }
      }
      await page.waitForTimeout(700);

      const info = await page.evaluate(READ);
      info.wanted = t; info.settled = ok; info.band = band.key; info.build = build.key;
      info.viewport = { w: band.w, h: band.h, dsf: band.dsf };
      rows.push(info);

      const name = `${build.key}-${band.key}-t${String(t).padStart(5, '0').replace('.', '_')}.png`;
      await page.screenshot({ path: path.join(OUT, name) });
      const b2 = info.beat2 ? `b2 op=${info.beat2.opacity} @${info.beat2.rect.x},${info.beat2.rect.y} ${info.beat2.rect.w}x${info.beat2.rect.h}` : 'b2 -';
      const b3 = info.beat3 ? `b3 op=${info.beat3.opacity}` : 'b3 -';
      console.log(`  want=${String(t).padStart(5)} got=${String(info.t).padStart(6)} ${ok ? ' ' : '!'} ${b2}  ${b3}`);
    }
    fs.writeFileSync(
      path.join(OUT, `../${build.key}-${band.key}.json`),
      JSON.stringify(rows, null, 2),
    );
    await ctx.close();
  }
}
await browser.close();
console.log('\nwrote ' + OUT);
