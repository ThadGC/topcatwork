'use client';

import { useEffect, type RefObject } from 'react';

/**
 * The procedural marble engine — assets/site.js:735-830.
 *
 * Four functions, ported verbatim:
 *
 *   rng(seed)                 site.js:735-741   seeded PRNG
 *   veinPath(rand,w,h,y0)     site.js:742-756   one cubic-bezier vein
 *   marbleRasterOn()          site.js:757-759   inline-SVG vs data-URI decision
 *   marbleFill(el,seed)       site.js:760-771   paints one element
 *   marbleSVG(seed)           site.js:772-826   emits the <svg class="marble">
 *
 * WHY THE RNG IS THE POINT
 * ------------------------
 * `rng` is a bare Lehmer / MINSTD generator (multiplier 16807, modulus
 * 2^31-1). Every vein in a tile is drawn from ONE stream, in order, so the
 * seed alone fixes the whole pattern — that is what makes the veining
 * reproducible between the legacy page and this one. Two consequences:
 *
 *   1. THE CONSTANTS ARE NOT NEGOTIABLE. 16807 / 2147483647 / 2147483646 are
 *      the source's. Changing any of them changes every tile on the site.
 *   2. CALL ORDER IS PART OF THE ALGORITHM. Each `rand()` consumes the stream,
 *      so inserting, removing or reordering a single call re-rolls every vein
 *      after it. The bodies below therefore keep the source's exact sequence
 *      of `rand()` calls, including ones that look re-orderable — e.g. inside
 *      `marbleSVG` the grey pass reads y, width, op, draws, then reads the
 *      offset for its highlight twin. Do not "tidy" that.
 *
 * The arithmetic is exact in double precision: the largest intermediate is
 * (2^31-2) * 16807 ≈ 3.6e13, comfortably under 2^53, so `%` never loses a
 * bit and TypeScript reproduces the legacy sequence number-for-number. Do NOT
 * add `| 0` or `Math.imul` — those would truncate and diverge.
 *
 * Verified character-for-character against the original `marbleSVG` for seeds
 * 5200 / 5213 / 5226 / 5239 / 5252 (the #whyMosaic run), 7400 / 7417, and the
 * 4100 + i*7 review run — see marble.test.ts.
 */

/**
 * `rng` — site.js:735-741. Lehmer PRNG, returns a generator of floats in
 * [0,1). Seed 0 is degenerate (the stream sticks at 0, giving -1/2147483646
 * forever); the source never passes 0 and neither does any call site here.
 */
export function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * `veinPath` — site.js:742-756.
 *
 * One vein, as a run of cubic beziers from x = -40 to x = w + 80. It starts
 * and ends OUTSIDE the box on purpose: a vein that began at the left edge
 * would read as a drawn line rather than as stone running through the slab.
 *
 * Consumes 3 + 3 * steps randoms, where steps = 6 + floor(rand()*3).
 *
 * Coordinates are fixed to 1dp except the opening `M`, which prints `y0` raw
 * — the source does not round it, and the emitted string has to match.
 */
export function veinPath(
  rand: () => number,
  w: number,
  h: number,
  y0: number,
): string {
  let d = `M ${-40} ${y0}`;
  let x = -40,
    y = y0;
  const steps = 6 + Math.floor(rand() * 3);
  const stepX = (w + 120) / steps;
  for (let i = 0; i < steps; i++) {
    const nx = x + stepX;
    const ny = y + (rand() - 0.5) * h * 0.34;
    const cx1 = x + stepX * 0.35,
      cy1 = y + (rand() - 0.5) * h * 0.22;
    const cx2 = x + stepX * 0.7,
      cy2 = ny + (rand() - 0.5) * h * 0.22;
    d += ` C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${nx.toFixed(1)} ${ny.toFixed(1)}`;
    x = nx;
    y = ny;
  }
  return d;
}

/**
 * `marbleSVG` — site.js:772-826.
 *
 * Emits a complete standalone <svg class="marble">: base gradient, a mottle
 * wash, then grey / hair / gold veins. Every filter id is namespaced with
 * `f<seed>` because several of these SVGs share one document — un-namespaced
 * ids would make every tile adopt the first tile's turbulence.
 *
 * NOTE the paint order in the markup (greys, hairs, golds) is NOT the order
 * the strings are BUILT in (greys, golds, hairs). The build order drives the
 * RNG; the markup order drives what sits on top. Both are the source's.
 */
export function marbleSVG(seed: number): string {
  const rand = rng(seed);
  const W = 900,
    H = 480;
  const fid = 'f' + seed;
  let greys = '';
  const nGrey = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < nGrey; i++) {
    const y = H * (0.18 + rand() * 0.64);
    const width = 5 + rand() * 9;
    const op = 0.16 + rand() * 0.16;
    greys += `<path d="${veinPath(rand, W, H, y)}" fill="none" stroke="#8f8b82" stroke-width="${width.toFixed(1)}" opacity="${op.toFixed(2)}" filter="url(#${fid}b)"/>`;
    greys += `<path d="${veinPath(rand, W, H, y + (rand() - 0.5) * 18)}" fill="none" stroke="#cbc6ba" stroke-width="${(width * 0.26).toFixed(1)}" opacity="${(op * 1.5).toFixed(2)}" filter="url(#${fid}d)"/>`;
  }
  let golds = '';
  const nGold = 1 + Math.floor(rand() * 2);
  for (let i = 0; i < nGold; i++) {
    const y = H * (0.15 + rand() * 0.7);
    golds += `<path d="${veinPath(rand, W, H, y)}" fill="none" stroke="#EFC24E" stroke-width="${(1.2 + rand() * 1.3).toFixed(1)}" opacity="${(0.5 + rand() * 0.25).toFixed(2)}" filter="url(#${fid}d)"/>`;
  }
  let hairs = '';
  for (let i = 0; i < 3; i++) {
    const y = H * rand();
    hairs += `<path d="${veinPath(rand, W, H, y)}" fill="none" stroke="#7d7a72" stroke-width="0.8" opacity="${(0.14 + rand() * 0.12).toFixed(2)}" filter="url(#${fid}d)"/>`;
  }
  return `
  <svg class="marble" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <filter id="${fid}b" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="${seed}" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="46"/>
        <feGaussianBlur stdDeviation="4"/>
      </filter>
      <filter id="${fid}d" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.014 0.024" numOctaves="3" seed="${seed + 3}" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="34"/>
        <feGaussianBlur stdDeviation="0.5"/>
      </filter>
      <filter id="${fid}m">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.008" numOctaves="4" seed="${seed + 9}"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.15  0 0 0 0 0.155  0 0 0 0 0.16  0 0 0 0.06 0"/>
        <feComposite operator="over" in2="SourceGraphic"/>
      </filter>
      <linearGradient id="${fid}base" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#131414"/>
        <stop offset="0.5" stop-color="#0e0f0f"/>
        <stop offset="1" stop-color="#141515"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${fid}base)"/>
    <rect width="${W}" height="${H}" fill="#34363a" opacity="0.10" filter="url(#${fid}m)"/>
    ${greys}
    ${hairs}
    ${golds}
  </svg>`;
}

/**
 * `marbleRasterOn` — site.js:757-759.
 *
 * The phone/desktop switch, and it is expressed in CSS, not in JS: site.css
 * sets `body{--stoneRaster:on}` inside `@media(max-width:720px)` (site.css:3201,
 * ported to globals.css:664). Below 720px the marble is flattened to a
 * background-image data-URI; above it, live inline SVG.
 *
 * WHY IT IS A CSS VARIABLE AND NOT `matchMedia` HERE: the source owns the
 * breakpoint in exactly one place. Reading it back out of the cascade means
 * the phone band can never drift between the stylesheet and the script.
 *
 * WHY RASTER AT ALL: five tiles' worth of live feTurbulence + feDisplacementMap
 * is a real per-frame cost on a phone GPU. A data-URI background is decoded
 * once. The seeded pattern is identical either way — same `marbleSVG(seed)`
 * string, only the delivery differs.
 */
export function marbleRasterOn(): boolean {
  if (typeof document === 'undefined') return false;
  return (
    getComputedStyle(document.body).getPropertyValue('--stoneRaster').trim() ===
    'on'
  );
}

/**
 * `marbleFill` — site.js:760-771. Paints one element with the marble for
 * `seed`, choosing inline SVG or a rasterised data-URI per `marbleRasterOn()`.
 *
 * The raster branch clears `innerHTML` first: an element can be filled twice
 * (React strict-mode double effects, a re-render) and the source's own
 * `el.innerHTML=''` is what keeps a stale <svg> from sitting under the new
 * background.
 */
export function marbleFill(el: HTMLElement | null, seed: number): void {
  if (!el) return;
  if (marbleRasterOn()) {
    el.innerHTML = '';
    el.style.backgroundImage =
      'url("data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(marbleSVG(seed)) +
      '")';
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
  } else {
    el.innerHTML = marbleSVG(seed);
  }
}

/**
 * React adoption of the two document-order call sites:
 *
 *   site.js:4317  m.querySelectorAll('.wy-stone').forEach((el,i) => marbleFill(el, 5200 + i*13))
 *   site.js:4327  cards.forEach((el,i) => marbleFill(el, 7400 + i*17))
 *
 * Both are "walk the matching descendants in document order, seed = base +
 * index * step", so one hook covers them.
 *
 * SCOPED TO A REF, NOT `document` — the legacy page queries once at parse time
 * because its markup is static; React commits sections over time, so a
 * document-wide sweep would race the mount. Same reasoning as useReveal.
 *
 * NO RESIZE LISTENER, deliberately. The source paints once and never repaints,
 * so a phone rotated into the tablet band keeps its rasterised fill on the
 * legacy page too. Adding a listener would be an improvement, and an
 * improvement is a divergence.
 *
 * @param root      the container to search within (the mosaic / the card grid)
 * @param selector  '.wy-stone', '.trade-stone', …
 * @param seedBase  first seed
 * @param seedStep  added per element, in document order
 *
 * @example
 *   useMarbleFill(mosaic, '.wy-stone', 5200, 13);
 */
export function useMarbleFill(
  root: RefObject<HTMLElement | null>,
  selector: string,
  seedBase: number,
  seedStep: number,
): void {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    host
      .querySelectorAll<HTMLElement>(selector)
      .forEach((el, i) => marbleFill(el, seedBase + i * seedStep));
  }, [root, selector, seedBase, seedStep]);
}

/**
 * The per-element variant, for the one call site whose seed is carried in
 * markup rather than derived from an index:
 *
 *   site.js:1500  marbleFill(el.querySelector('.rev-stone'), +el.querySelector('.rev-stone').dataset.marble)
 *
 * Reviews.tsx already renders `data-marble={4100 + i * 7}` on `.rev-stone`,
 * so this reads the attribute exactly as the source does — `+dataset.marble`,
 * a unary plus on a string. An element without the attribute yields NaN, and
 * `marbleSVG(NaN)` would emit `id="fNaN"` on every tile; the guard below skips
 * those instead, which is the only place this departs from the source and it
 * only fires on markup the source never produced.
 */
export function useMarbleDataFill(
  root: RefObject<HTMLElement | null>,
  selector: string,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    host.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      const seed = Number(el.dataset.marble);
      if (!Number.isFinite(seed)) return;
      marbleFill(el, seed);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, selector, ...deps]);
}
