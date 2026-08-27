/* Real Chrome (channel:'chrome' — Playwright's Chromium has no H.264, so it
   cannot decode the film; see README). Loads the intro at a given viewport,
   waits for a decoded frame, then samples the PAINTED page across a
   horizontal line to find any dead black column — the client's 27 Aug
   "video is not in it correctly" report. */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const W = Number(process.argv[2] || 1000);
const H = Number(process.argv[3] || 850);
const OUT = process.argv[4] || 'film';

const b = await chromium.launch({ channel: 'chrome' });
for (const [base, label] of [['http://localhost:3000', 'NEW'], ['http://localhost:8099', 'OLD']]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H } });
  const p = await ctx.newPage();
  await p.goto(base + '/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await p.waitForTimeout(5000);
  const info = await p.evaluate(() => {
    const v = document.querySelector('video');
    if (!v) return { none: true };
    const r = v.getBoundingClientRect();
    const cs = getComputedStyle(v);
    return {
      readyState: v.readyState, intrinsic: [v.videoWidth, v.videoHeight],
      box: [+r.width.toFixed(1), +r.height.toFixed(1), +r.left.toFixed(1)],
      css: { w: cs.width, h: cs.height, of: cs.objectFit, pos: cs.position, disp: cs.display },
      cls: document.documentElement.className, t: v.currentTime, src: (v.currentSrc||'').split('/').pop(),
    };
  });
  const buf = await p.screenshot();
  const png = PNG.sync.read(buf);
  const row = Math.floor(png.height * 0.45);
  // walk the row, report the runs that are essentially pure black
  const dark = [];
  for (let x = 0; x < png.width; x++) {
    const i = (png.width * row + x) << 2;
    const lum = (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
    dark.push(lum < 8);
  }
  let runs = [], start = null;
  dark.forEach((d, x) => { if (d && start === null) start = x; if (!d && start !== null) { if (x - start > 30) runs.push([start, x]); start = null; } });
  if (start !== null && png.width - start > 30) runs.push([start, png.width]);
  console.log(`\n=== ${label} ${W}x${H} (png ${png.width}x${png.height}, row ${row}) ===`);
  console.log('  ', JSON.stringify(info));
  console.log('   black runs >30px on that row:', runs.length ? JSON.stringify(runs) : 'none');
  const fs = await import('node:fs');
  fs.mkdirSync('out', { recursive: true });
  fs.writeFileSync(`out/${OUT}-${label}-${W}x${H}.png`, buf);
  await ctx.close();
}
await b.close();
