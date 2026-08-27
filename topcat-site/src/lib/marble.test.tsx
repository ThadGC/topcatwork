import { existsSync, readFileSync } from 'node:fs';
import { render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';

import {
  marbleFill,
  marbleRasterOn,
  marbleSVG,
  rng,
  useMarbleFill,
  veinPath,
} from './marble';

/*
  THE POINT OF THIS FILE

  The marble is procedural, so there is no reference image to diff. What makes
  a tile "the signed-off tile" is the RNG stream: seed 5200 must produce the
  same 9 veins in the same places as it does on the legacy page. So the tests
  below are, in order of strength:

    1. A DIFFERENTIAL TEST against the real assets/site.js — the original
       `marbleSVG` is sliced out of the legacy file, evaluated, and compared
       character-for-character. This is the test that actually proves the port.
    2. GOLDEN VALUES captured from that same differential run, so the suite
       still catches a regression on a machine that does not have the legacy
       checkout mounted.
    3. LIVE-PAGE COUNTS. The legacy home page paints 42 vein paths across
       `.wy-stone` and 129 across `.rev-stone` (measured in Chromium at 1440).
       Those two numbers are a end-to-end fingerprint of the seed runs.
*/

const LEGACY_SITE_JS =
  '/Users/thadeusgous/Documents/TOPCAT WORKTOPS/assets/site.js';

/** Every `d="…"` in an emitted SVG, in document order. */
const veins = (svg: string) =>
  [...svg.matchAll(/ d="([^"]*)"/g)].map((m) => m[1]);

/** Slice `rng` … end of `marbleSVG` out of the legacy file and evaluate it. */
function loadLegacy(): { marbleSVG: (s: number) => string; rng: (s: number) => () => number } {
  const src = readFileSync(LEGACY_SITE_JS, 'utf8');
  const start = src.indexOf('function rng(seed){');
  const endMark = '  </svg>`;\n}';
  const end = src.indexOf(endMark, start) + endMark.length;
  if (start < 0 || end < endMark.length) throw new Error('legacy region not found');
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  return new Function(src.slice(start, end) + '\nreturn {rng, veinPath, marbleSVG};')();
}

describe('rng — site.js:735', () => {
  it('reproduces the legacy Lehmer stream for seed 5200', () => {
    const r = rng(5200);
    expect(Array.from({ length: 6 }, () => r())).toEqual([
      0.04069711970230296, 0.996498344462829, 0.1476754137758868,
      0.9806860019272994, 0.3896345429957235, 0.5877689058778518,
    ]);
  });

  it('is a pure function of the seed — two generators never diverge', () => {
    const a = rng(7400);
    const b = rng(7400);
    for (let i = 0; i < 50; i++) expect(a()).toBe(b());
  });

  it('stays exact in double precision (no 32-bit truncation)', () => {
    // Every state must land in [1, 2^31-2]; a `|0` anywhere would push it
    // negative within a few steps and silently re-roll the whole site.
    const r = rng(5200);
    for (let i = 0; i < 5000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('veinPath — site.js:742', () => {
  it('matches the legacy path string for a known stream position', () => {
    expect(veinPath(rng(7400), 900, 480, 120)).toBe(
      'M -40 120 C 19.5 117.8, 79.0 48.7, 130.0 100.4 C 189.5 79.0, 249.0 57.6, 300.0 96.7 C 359.5 127.7, 419.0 136.9, 470.0 112.8 C 529.5 132.0, 589.0 143.0, 640.0 180.6 C 699.5 192.9, 759.0 264.8, 810.0 235.1 C 869.5 284.3, 929.0 212.3, 980.0 236.0',
    );
  });

  it('starts at x=-40 and ends past the right edge', () => {
    // The vein is meant to run through the slab, not to start at its border.
    const d = veinPath(rng(5200), 900, 480, 200);
    expect(d.startsWith('M -40 ')).toBe(true);
    expect(d.endsWith(' 980.0 ' + d.split(' ').at(-1))).toBe(true);
  });

  it('leaves y0 unrounded in the opening M, as the source does', () => {
    expect(veinPath(rng(5200), 900, 480, 392.52429141898114)).toContain(
      'M -40 392.52429141898114',
    );
  });
});

describe('marbleSVG — site.js:772', () => {
  it('namespaces every filter id with the seed', () => {
    const svg = marbleSVG(5200);
    for (const id of ['f5200b', 'f5200d', 'f5200m', 'f5200base']) {
      expect(svg).toContain(`id="${id}"`);
    }
    // Two tiles in one document must not share turbulence.
    expect(marbleSVG(5213)).not.toContain('f5200');
  });

  it('keys the three turbulence seeds to seed, seed+3, seed+9', () => {
    const svg = marbleSVG(7400);
    expect(svg).toContain('seed="7400"');
    expect(svg).toContain('seed="7403"');
    expect(svg).toContain('seed="7409"');
  });

  it('emits the base plate and the mottle wash, in that order', () => {
    const rects = [...marbleSVG(5200).matchAll(/<rect [^>]*>/g)].map((m) => m[0]);
    expect(rects).toHaveLength(2);
    expect(rects[0]).toContain('fill="url(#f5200base)"');
    expect(rects[1]).toContain('opacity="0.10"');
  });

  it('paints greys, then hairs, then golds', () => {
    const svg = marbleSVG(5200);
    const first = (s: string) => svg.indexOf(s);
    expect(first('#8f8b82')).toBeLessThan(first('#7d7a72'));
    expect(first('#7d7a72')).toBeLessThan(first('#EFC24E'));
  });

  it('reproduces the exact vein geometry for seed 5200', () => {
    const d = veins(marbleSVG(5200));
    expect(d).toHaveLength(9);
    expect(d[0]).toBe(
      'M -40 392.52429141898114 C 11.0 406.5, 62.0 364.2, 105.7 406.8 C 156.7 396.6, 207.7 350.4, 251.4 381.0 C 302.4 330.2, 353.4 485.9, 397.1 456.9 C 448.1 450.6, 499.1 425.7, 542.9 375.3 C 593.9 402.9, 644.9 307.1, 688.6 298.7 C 739.6 269.0, 790.6 387.3, 834.3 368.4 C 885.3 322.8, 936.3 281.2, 980.0 330.9',
    );
    expect(d[8]).toBe(
      'M -40 181.189638455575 C 4.6 135.4, 49.3 113.5, 87.5 109.7 C 132.1 78.6, 176.8 119.9, 215.0 135.6 C 259.6 161.2, 304.3 116.3, 342.5 169.1 C 387.1 134.4, 431.8 142.3, 470.0 126.1 C 514.6 112.4, 559.3 124.6, 597.5 72.5 C 642.1 33.0, 686.8 131.6, 725.0 83.0 C 769.6 49.9, 814.3 74.0, 852.5 64.8 C 897.1 62.0, 941.8 12.0, 980.0 58.7',
    );
  });

  it('matches the live legacy page: 42 vein paths across the 5 #whyMosaic tiles', () => {
    const total = Array.from({ length: 5 }, (_, i) => 5200 + i * 13)
      .reduce((n, s) => n + veins(marbleSVG(s)).length, 0);
    expect(total).toBe(42);
  });

  it('matches the live legacy page: 129 vein paths across the 15 review cards', () => {
    const total = Array.from({ length: 15 }, (_, i) => 4100 + i * 7)
      .reduce((n, s) => n + veins(marbleSVG(s)).length, 0);
    expect(total).toBe(129);
  });
});

describe.skipIf(!existsSync(LEGACY_SITE_JS))(
  'differential vs the legacy assets/site.js',
  () => {
    const seeds = [
      5200, 5213, 5226, 5239, 5252, // .wy-stone
      7400, 7417, 7434, 7451, // .trade-stone
      ...Array.from({ length: 15 }, (_, i) => 4100 + i * 7), // .rev-stone
    ];

    it('emits a byte-identical SVG for every production seed', () => {
      const legacy = loadLegacy();
      for (const seed of seeds) {
        expect(marbleSVG(seed), `seed ${seed}`).toBe(legacy.marbleSVG(seed));
      }
    });

    it('drives an identical RNG stream', () => {
      const legacy = loadLegacy();
      const a = rng(4100);
      const b = legacy.rng(4100);
      for (let i = 0; i < 200; i++) expect(a()).toBe(b());
    });
  },
);

describe('marbleFill / marbleRasterOn — site.js:757-771', () => {
  const setRaster = (v: string) =>
    document.body.style.setProperty('--stoneRaster', v);

  it('inlines the SVG when --stoneRaster is not "on" (tablet + desktop)', () => {
    setRaster('off');
    const el = document.createElement('div');
    expect(marbleRasterOn()).toBe(false);
    marbleFill(el, 5200);
    expect(el.querySelector('svg.marble')).not.toBeNull();
    expect(el.querySelectorAll('path')).toHaveLength(9);
    expect(el.style.backgroundImage).toBe('');
  });

  it('rasterises to a data-URI background when --stoneRaster is "on" (phone)', () => {
    setRaster('on');
    const el = document.createElement('div');
    expect(marbleRasterOn()).toBe(true);
    marbleFill(el, 5200);
    expect(el.innerHTML).toBe('');
    expect(el.style.backgroundImage).toContain('data:image/svg+xml;charset=utf-8,');
    expect(el.style.backgroundSize).toBe('cover');
    // jsdom normalises the shorthand to a two-value form; the source sets 'center'.
    expect(el.style.backgroundPosition.split(' ')[0]).toBe('center');
    expect(el.style.backgroundRepeat).toBe('no-repeat');
  });

  it('carries the same pattern through both branches', () => {
    const el = document.createElement('div');
    setRaster('on');
    marbleFill(el, 7400);
    const decoded = decodeURIComponent(
      el.style.backgroundImage.replace(/^url\("data:image\/svg\+xml;charset=utf-8,/, '').replace(/"\)$/, ''),
    );
    expect(veins(decoded)).toEqual(veins(marbleSVG(7400)));
  });

  it('clears a previous inline SVG when re-filled in raster mode', () => {
    const el = document.createElement('div');
    setRaster('off');
    marbleFill(el, 5200);
    expect(el.children.length).toBeGreaterThan(0);
    setRaster('on');
    marbleFill(el, 5200);
    expect(el.innerHTML).toBe('');
  });

  it('is a no-op on a null element', () => {
    expect(() => marbleFill(null, 5200)).not.toThrow();
  });
});

describe('useMarbleFill — the React adoption of site.js:4317 / 4327', () => {
  it('seeds matching descendants by document order, base + i*step', () => {
    document.body.style.setProperty('--stoneRaster', 'off');

    function Mosaic() {
      const mosaic = useRef<HTMLDivElement>(null);
      // THE ONE-LINE ADOPTION — this is exactly what Why.tsx needs.
      useMarbleFill(mosaic, '.wy-stone', 5200, 13);
      return (
        <div ref={mosaic}>
          {[0, 1, 2, 3, 4].map((i) => (
            <article key={i}>
              <div className="wy-stone" aria-hidden="true" />
            </article>
          ))}
        </div>
      );
    }

    const { container } = render(<Mosaic />);
    const stones = [...container.querySelectorAll('.wy-stone')];
    expect(stones).toHaveLength(5);

    // Each tile carries the SVG its own seed produces — and only its own.
    stones.forEach((el, i) => {
      const seed = 5200 + i * 13;
      // Compare geometry, not innerHTML: the DOM re-serialises `<path/>` as
      // `<path></path>`, so a raw string equality would fail on markup that
      // is in fact identical. The differential test above already proves the
      // emitted string byte-for-byte.
      const got = [...el.querySelectorAll('path')].map((p) => p.getAttribute('d'));
      expect(got).toEqual(veins(marbleSVG(seed)));
      expect(el.querySelector('svg.marble')?.getAttribute('viewBox')).toBe('0 0 900 480');
    });

    // The end-to-end fingerprint from the legacy page, measured in the DOM.
    expect(container.querySelectorAll('svg.marble path')).toHaveLength(42);
    expect(container.querySelectorAll('svg.marble rect')).toHaveLength(10);
  });

  it('does nothing when the ref is empty', () => {
    function Empty() {
      const ref = useRef<HTMLDivElement>(null);
      useMarbleFill(ref, '.wy-stone', 5200, 13);
      return <div ref={ref} />;
    }
    const { container } = render(<Empty />);
    expect(container.querySelectorAll('svg.marble')).toHaveLength(0);
  });
});
