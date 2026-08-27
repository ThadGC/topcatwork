/**
 * PLATE SHARPNESS — what the visitor actually looks at before the first scroll.
 *
 * `.plate` is background-size:cover on a box of 100vw+2*--curveOut by 100vh, so
 * the number that decides "is it blurry" is not the file's width, it is the
 * COVER-SCALED RENDER width against the file's intrinsic width. This prints it.
 *
 * System Chrome, always: the bundled Chromium has no H.264 and will not decode
 * the film at all. Usage: node probe-plate-sharpness.mjs [w] [h] [dpr]
 */
import { chromium } from 'playwright';

const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844), DPR = +(process.argv[4] || 3);

const b = await chromium.launch({ channel: 'chrome' });
const page = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
await page.goto('http://localhost:3000/', { waitUntil: 'load' });
await page.waitForTimeout(2500);

const r = await page.evaluate(() => {
  const el = [...document.querySelectorAll('div')].find((d) => {
    const bg = getComputedStyle(d).backgroundImage || '';
    return bg.includes('plate-f0');
  });
  if (!el) return { found: false };
  const cs = getComputedStyle(el), box = el.getBoundingClientRect();
  const url = (cs.backgroundImage.match(/url\(["']?([^"')]+)/) || [])[1];
  return { found: true, url, boxW: box.width, boxH: box.height,
           opacity: cs.opacity, bgSize: cs.backgroundSize, display: cs.display };
});

if (!r.found) { console.log('NO PLATE ELEMENT FOUND (is html.cine-on set?)'); await b.close(); process.exit(1); }

const nat = await page.evaluate((u) => new Promise((res) => {
  const i = new Image(); i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight });
  i.onerror = () => res({ w: 0, h: 0 }); i.src = u;
}), r.url);

// cover: scale = max(boxW/natW, boxH/natH), in DEVICE pixels
const bw = r.boxW * DPR, bh = r.boxH * DPR;
const scale = Math.max(bw / nat.w, bh / nat.h);

console.log(`viewport      ${W}x${H} @${DPR}x  (device ${W * DPR}x${H * DPR})`);
console.log(`plate url     ${r.url.split('/').pop()}`);
console.log(`opacity       ${r.opacity}   background-size: ${r.bgSize}`);
console.log(`box           ${r.boxW.toFixed(1)}x${r.boxH.toFixed(1)} css  =  ${bw.toFixed(0)}x${bh.toFixed(0)} device px`);
console.log(`intrinsic     ${nat.w}x${nat.h}`);
console.log(`rendered at   ${(nat.w * scale).toFixed(0)}x${(nat.h * scale).toFixed(0)} device px`);
console.log(`UPSCALE       ${scale.toFixed(2)}x   ${scale <= 1.01 ? 'PIXEL-PERFECT' : scale < 1.5 ? 'sharp' : scale < 2.2 ? 'SOFT' : 'BLURRY'}`);

await page.screenshot({ path: `out/plate-${W}x${H}@${DPR}x.png` });
await b.close();
