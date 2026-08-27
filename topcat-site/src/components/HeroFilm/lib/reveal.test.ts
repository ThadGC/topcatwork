/**
 * HERO FILM — reveal tests.
 *
 * The reveal is the one part of the film that is measured data rather than
 * arithmetic: 82 (wide) / 49 (tablet) / 32 (phone) hand-measured frames of a
 * moving edge. A regression here does not throw, it just puts the mask a few
 * pixels off the edge in the footage and the line looks like it is fading in
 * badly. So the invariants get asserted.
 *
 * Two halves, matching the module. The first tests the clip-path polygons,
 * which no longer reach the DOM but are still the definition of the picture.
 * The second tests the composited panes that replaced them — against those
 * polygons, region for region.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';
import {
  at,
  phoneClip,
  wideClip,
  revealClip,
  affineCss,
  applyAffine,
  composeAffine,
  insidePane,
  invertAffine,
  isPaneOff,
  paneLevel,
  paneSlant,
  revealPanes,
  IDENTITY,
  PANE_OFF,
  PANE_SEAM,
  STRIP_BLEED,
  WEDGE_BLEED,
  PREV_F0,
  PREV_X,
  PREV_XREF,
  PREV_Y,
  PREV_YREF,
  PREV_SX,
  PREV_SY,
  REV_F0,
  REV_X,
  REV_S,
  REV_YREF,
  TREV_F0,
  TREV_X,
  TREV_S,
  TREV_YREF,
  type Affine,
  type RevealBox,
  type RevealMetrics,
  type RevealPanes,
} from './reveal';
import { FPS, REV_PAD, SRCFPS } from './constants';
import { STORY, beatWindow, type Band } from './timeline';

/** Identity frame: one element pixel per film pixel, origin at the element. */
const identity = (w = 900, h = 200): RevealBox => ({
  sc: 1,
  dx: 0,
  dy: 0,
  left: 0,
  top: 0,
  w,
  h,
});

/** Pull the "x y" pairs out of a `polygon(...)` string. */
function points(clip: string): Array<[number, number]> {
  const inner = clip.replace(/^polygon\(/, '').replace(/\)$/, '');
  return inner.split(',').map((pair) => {
    const [x, y] = pair.trim().split(/\s+/);
    return [parseFloat(x), parseFloat(y)] as [number, number];
  });
}

/**
 * Where the wide/tablet slant crosses the polygon's top edge, computed
 * straight from the tables. In an identity frame `yT` is `top − 60 = −60`, and
 * the slant is `x = x0 + s·(y − YREF)` — so the expected intercept carries the
 * slope term, which is exactly the part a naive assertion forgets.
 */
function expectedTopX(table: readonly number[], slopes: readonly number[], yref: number) {
  return table[0] - REV_PAD + slopes[0] * (-60 - yref);
}

/* ── the two files the panes are only half of ───────────────────────────────
   The geometry in ./reveal.ts is a pure function and the tests below are the
   better for it, but two of its guarantees are not expressible in it alone: how
   far the type paints outside its own boxes (the stylesheet's business) and
   whether the clip is ever released (the engine's). Both are read here, so that
   moving one without the other breaks a test rather than a phone.
   -------------------------------------------------------------------------- */

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(HERE, '..', 'HeroFilm.module.css'), 'utf8');
const ENGINE = readFileSync(join(HERE, '..', 'useHeroFilm.ts'), 'utf8');

/**
 * How far past its own glyph boxes the type in a stylesheet actually paints.
 *
 * A `text-shadow` or a `drop-shadow` reaches `max(|dx|, |dy|) + blur` beyond
 * the glyph; a text-stroke reaches its own width. Those are the three ways to
 * put ink outside a glyph box in this module, and all three are the reason a
 * pane's bleed is what it is.
 *
 * It scans the whole file rather than only the reveal line's own rules. That
 * over-counts — the hero copy's shadows are in there too — and over-counting is
 * the direction a guard is allowed to be wrong in.
 */
function inkReach(css: string): number {
  const bare = (s: string) =>
    s
      .replace(/rgba?\([^)]*\)/g, ' ')
      .replace(/var\([^)]*\)/g, ' ')
      .replace(/#[0-9a-f]{3,8}/gi, ' ');
  const lens = (s: string): number[] => (bare(s).match(/-?\d*\.?\d+/g) ?? []).map(Number);

  let reach = 0;
  const shadow = (value: string) => {
    // Split the list on its own commas, not on the ones inside `rgba(...)`.
    for (const part of value.split(/,(?![^(]*\))/)) {
      const [dx, dy, blur] = lens(part);
      if (blur === undefined) continue; // `none`, or a shadow with no blur
      reach = Math.max(reach, Math.max(Math.abs(dx), Math.abs(dy)) + blur);
    }
  };

  for (const m of css.matchAll(/text-shadow:\s*([^;]+);/g)) shadow(m[1]);
  for (const m of css.matchAll(/drop-shadow\(([^)]*)\)/g)) shadow(m[1]);
  for (const m of css.matchAll(/(?:-webkit-)?text-stroke(?:-width)?:\s*([^;]+);/g)) {
    for (const n of lens(m[1])) reach = Math.max(reach, Math.abs(n));
  }
  return reach;
}

const INK = inkReach(CSS);

describe('at()', () => {
  it('clamps at both ends instead of extrapolating', () => {
    const a = [10, 20, 30];
    expect(at(a, -99)).toBe(10);
    expect(at(a, 0)).toBe(10);
    expect(at(a, 2)).toBe(30);
    expect(at(a, 99)).toBe(30);
  });

  it('interpolates between measured frames', () => {
    // The presented frame's mediaTime is not quantised, so the edge has to be
    // interpolated — otherwise it steps at 12fps regardless of playback rate.
    expect(at([0, 100], 0.5)).toBeCloseTo(50, 10);
    expect(at([0, 100, 300], 1.25)).toBeCloseTo(150, 10);
  });
});

describe('the tables themselves', () => {
  it('pair x-intercepts with slopes, one per source frame', () => {
    expect(REV_S).toHaveLength(REV_X.length);
    expect(PREV_SX).toHaveLength(PREV_X.length);
    expect(PREV_Y).toHaveLength(PREV_X.length);
    expect(PREV_SY).toHaveLength(PREV_X.length);
  });

  it('sweeps the wide edge strictly left to right', () => {
    for (let i = 1; i < REV_X.length; i++) {
      expect(REV_X[i]).toBeGreaterThan(REV_X[i - 1]);
    }
    for (let i = 1; i < TREV_X.length; i++) {
      expect(TREV_X[i]).toBeGreaterThan(TREV_X[i - 1]);
    }
  });

  it('leans the wide edge left as it descends', () => {
    // Every slope is <= 0. A positive one would tilt the mask the wrong way
    // and cut the line's descenders off before its capitals.
    for (const s of REV_S) expect(s).toBeLessThanOrEqual(0);
  });

  it('marks the phone reveal frames where the horizontal edge is out of shot', () => {
    for (let i = 0; i < 8; i++) expect(PREV_Y[i]).toBeLessThan(-5000);
    for (let i = 8; i < PREV_Y.length; i++) expect(PREV_Y[i]).toBeGreaterThan(-5000);
  });
});

describe('wideClip', () => {
  it('starts hiding almost the whole line', () => {
    const clip = wideClip(REV_F0, identity(), false);
    const p = points(clip);
    expect(p).toHaveLength(4);
    // Frame 0 of the table: the edge sits at x=2 in film space, less the pad.
    expect(p[1][0]).toBeCloseTo(REV_X[0] - REV_PAD, 1);
  });

  it('sweeps the edge rightwards frame by frame', () => {
    let prev = -Infinity;
    for (let f = REV_F0; f < REV_F0 + 40; f++) {
      const p = points(wideClip(f, identity(2000, 200), false));
      expect(p[1][0]).toBeGreaterThan(prev);
      prev = p[1][0];
    }
  });

  it('returns "" once the sweep has cleared the line', () => {
    // '' is the signal the rest of the engine keys off: it is what tells the
    // reveal branch it may finally turn the line's scrim on.
    expect(wideClip(REV_F0 + REV_X.length, identity(), false)).toBe('');
    // Narrow element: the edge clears it long before the table runs out.
    expect(wideClip(REV_F0 + 30, identity(20, 40), false)).toBe('');
  });

  it('holds the edge before the reveal has started', () => {
    // Frames before F0 clamp to entry 0 rather than extrapolating backwards
    // into negative film space.
    const before = points(wideClip(REV_F0 - 50, identity(), false));
    const first = points(wideClip(REV_F0, identity(), false));
    expect(before[1][0]).toBeCloseTo(first[1][0], 5);
  });

  it('uses the tablet table, and its own F0 and YREF, on the tablet band', () => {
    const w = points(wideClip(REV_F0, identity(), false))[1][0];
    const t = points(wideClip(TREV_F0, identity(), true))[1][0];
    expect(t).toBeCloseTo(expectedTopX(TREV_X, TREV_S, TREV_YREF), 1);
    expect(w).toBeCloseTo(expectedTopX(REV_X, REV_S, REV_YREF), 1);
    expect(t).not.toBeCloseTo(w, 1);
  });

  it('slants: the top and bottom intercepts differ once the slope is non-zero', () => {
    const p = points(wideClip(REV_F0 + 20, identity(2000, 400), false));
    expect(Math.abs(p[1][0] - p[2][0])).toBeGreaterThan(1);
  });
});

describe('phoneClip', () => {
  const box = identity(400, 300);

  it('is a 4-point wedge while the horizontal edge is out of shot', () => {
    for (let i = 0; i < 8; i++) {
      expect(points(phoneClip(PREV_F0 + i, box))).toHaveLength(4);
    }
  });

  it('becomes a 6-point wedge once the horizontal edge joins', () => {
    expect(points(phoneClip(PREV_F0 + 10, box))).toHaveLength(6);
  });

  it('solves the corner so it lies on BOTH edges', () => {
    // The two edges are both sloped. Approximating the corner as their naive
    // intersection leaves a visible notch in the mask; this is the closed-form
    // solve that removes it, checked against the two line equations it came
    // from.
    const i = 10;
    const p = points(phoneClip(PREV_F0 + i, box));
    const [cx, cy] = p[3];

    const x0 = PREV_X[i] - REV_PAD;
    const sx = PREV_SX[i];
    const yp = PREV_Y[i] - REV_PAD;
    const sy = PREV_SY[i];

    // x = x0 + sx·(y − 240)   and   y = yp + sy·(x − 304)
    // Tolerance is 0.5: the polygon is emitted at 1dp, so both coordinates
    // carry a rounding step before they get back here.
    expect(x0 + sx * (cy - 240)).toBeCloseTo(cx, 0);
    expect(yp + sy * (cx - 304)).toBeCloseTo(cy, 0);
  });

  it('returns "" once the table runs out', () => {
    expect(phoneClip(PREV_F0 + PREV_X.length, box)).toBe('');
  });

  it('sweeps rightwards, like the other bands', () => {
    let prev = -Infinity;
    for (let i = 0; i < 8; i++) {
      const p = points(phoneClip(PREV_F0 + i, box));
      expect(p[1][0]).toBeGreaterThan(prev);
      prev = p[1][0];
    }
  });
});

describe('revealClip dispatch', () => {
  const box = identity(500, 200);

  it('routes phone, tablet and wide to their own tables', () => {
    const phone = revealClip(PREV_F0, box, { phone: true, tablet: false });
    const tablet = revealClip(TREV_F0, box, { phone: false, tablet: true });
    const wide = revealClip(REV_F0, box, { phone: false, tablet: false });

    // Phone: point 1 is the slant at the polygon's top edge, y = −200 in an
    // identity frame, and the slant is quoted at film y = 240.
    expect(points(phone)[1][0]).toBeCloseTo(
      PREV_X[0] - REV_PAD + PREV_SX[0] * (-200 - 240),
      1,
    );
    expect(points(tablet)[1][0]).toBeCloseTo(expectedTopX(TREV_X, TREV_S, TREV_YREF), 1);
    expect(points(wide)[1][0]).toBeCloseTo(expectedTopX(REV_X, REV_S, REV_YREF), 1);
  });
});

describe('the table grid is SRCFPS, and SRCFPS is half the source rate', () => {
  /**
   * `REV_F0` and friends are frame INDICES, and an index means nothing without
   * the grid it counts on. The masters are 24fps; the tables were measured on
   * every second frame, so the grid is 12fps and `SRCFPS` is 12 — not 24, and
   * not the seek lattice.
   *
   * Nothing about getting this wrong throws. Read the same indices as 24fps
   * and the wide reveal simply starts at 5.2s instead of 10.3s — half a film
   * early, uncovering the line against a shot it was never traced on. So the
   * check is that each band's first table frame lands on that band's beat.
   */
  const band = (over: Partial<Band>): Band => ({
    wide: true,
    narrow: false,
    phone: false,
    tablet: false,
    mode: 'wide',
    ...over,
  });

  const reveal = STORY.find((b) => b.id === 'reveal')!;

  it('is half the source frame rate, exactly', () => {
    expect(FPS).toBe(24);
    expect(SRCFPS).toBe(12);
    expect(FPS / SRCFPS).toBe(2);
  });

  /* The tablet is NOT in this list any more. It plays the wide cut since
     27 Aug, so it starts at the WIDE beat against the WIDE table — see the
     two assertions below this one, and lib/timeline.ts `filmBand`. */
  it.each([
    ['wide', REV_F0, band({}), 0.1],
    ['phone', PREV_F0, band({ wide: false, narrow: true, phone: true, mode: 'nr' }), 0.4],
  ] as const)('starts %s at its own beat when read at 12fps', (_name, f0, b, slop) => {
    const startsAt = f0 / SRCFPS;
    const { at: beatAt, out } = beatWindow(reveal, b);
    expect(Math.abs(startsAt - beatAt)).toBeLessThanOrEqual(slop);
    // And it finishes inside the beat's window rather than running past it.
    expect(startsAt).toBeLessThan(out);
  });

  it('gives the tablet the wide beat, because it plays the wide cut', () => {
    const tablet = band({ wide: false, narrow: true, tablet: true, mode: 'nr' });
    expect(beatWindow(reveal, tablet).at).toBe(beatWindow(reveal, band({})).at);
    expect(beatWindow(reveal, tablet).out).toBe(beatWindow(reveal, band({})).out);
  });

  it('no longer pairs the tablet with TREV_F0 — that table is retired', () => {
    // The 584-wide crop it was measured against does not ship. If this ever
    // starts passing again, something has wired the old table back in without
    // re-measuring it.
    const tablet = band({ wide: false, narrow: true, tablet: true, mode: 'nr' });
    expect(Math.abs(TREV_F0 / SRCFPS - beatWindow(reveal, tablet).at)).toBeGreaterThan(2);
  });

  it('would land nowhere near the beats if read as 24fps', () => {
    // The counter-example. Kept because "12 is consistent with a 24fps master"
    // is only half an argument; the other half is that 24 is not.
    const wideAt = beatWindow(reveal, band({})).at;
    expect(Math.abs(REV_F0 / FPS - wideAt)).toBeGreaterThan(5);
  });

  it('sweeps a duration that fits inside the beat it uncovers', () => {
    // 82 entries at 12fps is 6.8s of sweep against a 14.2s wide window.
    const { at: beatAt, out } = beatWindow(reveal, band({}));
    const sweep = (REV_X.length - 1) / SRCFPS;
    expect(REV_F0 / SRCFPS + sweep).toBeLessThan(out);
    expect(sweep).toBeLessThan(out - beatAt);
    expect(sweep).toBeGreaterThan(1);
  });
});

describe('the coordinate frame', () => {
  it('scales and offsets the polygon with the film', () => {
    // A film scaled 2x with its origin 100px left of the element must put the
    // edge at 2·x − 100 element pixels.
    const scaled: RevealBox = { sc: 2, dx: -100, dy: 0, left: 0, top: 0, w: 4000, h: 200 };
    const plain = points(wideClip(REV_F0 + 20, identity(4000, 200), false))[1][0];
    const moved = points(wideClip(REV_F0 + 20, scaled, false))[1][0];
    // The top intercept is sampled at a different film y in the scaled frame,
    // so compare the mapping rather than the exact value: it must be well to
    // the right of 2x the unscaled position minus the offset's sign.
    expect(moved).toBeGreaterThan(plain);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   THE COMPOSITED REVEAL.

   The polygons above are no longer written to the DOM — an animating clip-path
   re-rasterises the headline every frame, which is the phone stutter — but they
   are still the DEFINITION of the picture. So the panes that replaced them are
   not tested against a fresh idea of what the reveal ought to look like. They
   are tested against the polygon, region for region, on every frame of every
   band.

   Three things have to hold, and each has its own way of going quietly wrong:

     1. THE PAIR CANCELS. The wrapper clips with a transform and the inner
        carries the inverse. If they stop composing to the identity the glyphs
        drift, and they drift by a fraction of a pixel — which does not read as
        a bug, it reads as the type having gone soft.
     2. THE EDGE IS THE POLYGON'S EDGE. Off by half a pixel and the reveal has
        stopped tracking the edge in the footage it was traced against.
     3. THE REGION IS THE POLYGON'S REGION. This is the one the phone needs. Its
        reveal is the UNION of two half-planes, and nested clipping boxes can
        only ever produce their INTERSECTION. Getting that backwards is not a
        subtle error — it hides most of the line — but nothing throws, so it has
        to be asserted.

   The heavy comparisons collect their misses and assert once at the end rather
   than firing a matcher per sample point: there are a quarter of a million
   points in the region sweep and a quarter of a million matchers is a minute of
   wall clock for no extra information.
   ══════════════════════════════════════════════════════════════════════════ */

/** The pane geometry, defaulting to an identity film frame with no padding. */
const metrics = (over: Partial<RevealMetrics> = {}): RevealMetrics => ({
  sc: 1,
  dx: 0,
  dy: 0,
  left: 0,
  top: 0,
  w: 900,
  h: 200,
  pl: 0,
  pt: 0,
  cw: 900,
  ch: 200,
  ...over,
});

/**
 * One real frame per band, so nothing is tested only at a film scale of 1 with
 * an unpadded line — `sc`, `pl` and `pt` each drop out of a different term and
 * an identity frame hides all three.
 *
 *   wide     1920x1000 viewport, the film-space line layout
 *   tablet    900x1000 viewport, left-aligned, no padding
 *   phone      390x844 viewport, full-bleed line with 27.3px of side padding
 */
const WIDE_FRAME = metrics({
  sc: 1,
  dx: 0,
  dy: -40,
  left: 200,
  top: 198,
  w: 899,
  h: 300,
  cw: 898.56,
  ch: 300,
});

const TABLET_FRAME = metrics({
  sc: 1.0417,
  dx: 0,
  dy: -62.5,
  left: 54,
  top: 150,
  w: 468,
  h: 250,
  cw: 468,
  ch: 250,
});

const PHONE_FRAME = metrics({
  sc: 0.7816,
  dx: -42.6,
  dy: 0,
  left: 0,
  top: 122,
  w: 390,
  h: 200,
  pl: 27.3,
  pt: 0,
  cw: 335.4,
  ch: 200,
});

type BandKey = 'wide' | 'tablet' | 'phone';

interface BandCase {
  key: BandKey;
  box: RevealMetrics;
  f0: number;
  len: number;
}

const BANDS: readonly BandCase[] = [
  { key: 'wide', box: WIDE_FRAME, f0: REV_F0, len: REV_X.length },
  { key: 'tablet', box: TABLET_FRAME, f0: TREV_F0, len: TREV_X.length },
  { key: 'phone', box: PHONE_FRAME, f0: PREV_F0, len: PREV_X.length },
];

const bandOf = (k: BandKey) => ({ phone: k === 'phone', tablet: k === 'tablet' });

/** The polygon the old engine would have written for the same frame. */
const clipFor = (k: BandKey, f: number, box: RevealMetrics): string =>
  revealClip(f, box, bandOf(k));

/** Ray-cast. `''` means the polygon was dropped entirely, i.e. everything shows. */
function inClip(clip: string, x: number, y: number): boolean {
  if (clip === '') return true;
  const p = points(clip);
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i];
    const [xj, yj] = p[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** The union the two panes actually uncover. */
function inPanes(pa: RevealPanes, box: RevealMetrics, u: number, v: number): boolean {
  if (pa.done) return true;
  return (
    insidePane(pa.wedge, box, WEDGE_BLEED, u, v) ||
    insidePane(pa.strip, box, STRIP_BLEED, u, v)
  );
}

/** Read a `matrix(...)` string back, to check what the DOM would really get. */
function parseMatrix(css: string): Affine {
  const n = css
    .replace(/^matrix\(/, '')
    .replace(/\)$/, '')
    .split(',')
    .map(Number);
  return { a: n[0], b: n[1], c: n[2], d: n[3], e: n[4], f: n[5] };
}

/** Every measured frame of a band, plus the midpoints between them. */
function sweep(f0: number, len: number, extra = 0): number[] {
  const out: number[] = [];
  for (let i = 0; i <= len - 1 + extra; i += 0.5) out.push(f0 + i);
  return out;
}

/** The reveal's edges for one frame, in pane coordinates. */
function edgesAt(k: BandKey, i: number, box: RevealMetrics) {
  if (k === 'phone') {
    const sx = at(PREV_SX, i);
    const sy = at(PREV_SY, i);
    return {
      sx,
      sy,
      a: paneSlant(at(PREV_X, i) - REV_PAD, sx, box, PREV_XREF),
      b: paneLevel(at(PREV_Y, i) - REV_PAD, sy, box, PREV_YREF),
    };
  }
  const tablet = k === 'tablet';
  const sx = at(tablet ? TREV_S : REV_S, i);
  return {
    sx,
    sy: 0,
    a: paneSlant(
      at(tablet ? TREV_X : REV_X, i) - REV_PAD,
      sx,
      box,
      tablet ? TREV_YREF : REV_YREF,
    ),
    b: Number.NEGATIVE_INFINITY,
  };
}

describe('the transform pair cancels', () => {
  /**
   * The whole technique rests on this: the clip edge moves because the wrapper
   * moves, and the glyphs stay because the inner undoes it exactly.
   */
  it('leaves the glyphs exactly where they were, on every band', () => {
    let worst = 0;
    let checked = 0;
    for (const { key, box, f0, len } of BANDS) {
      for (const f of sweep(f0, len)) {
        const pa = revealPanes(f, box, bandOf(key));
        for (const m of [pa.wedge, pa.strip]) {
          const back = composeAffine(m, invertAffine(m));
          worst = Math.max(
            worst,
            Math.abs(back.a - 1),
            Math.abs(back.b),
            Math.abs(back.c),
            Math.abs(back.d - 1),
            Math.abs(back.e),
            Math.abs(back.f),
          );
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(400);
    expect(worst).toBeLessThan(1e-9);
  });

  it('survives the trip through matrix(), which is what the DOM actually gets', () => {
    // The engine writes strings, and a string is quantised. What matters is the
    // residual AFTER the round trip, measured where it is largest: a glyph at
    // the far corner of the copy, pushed through the wrapper and back.
    let worst = 0;
    for (const { key, box, f0, len } of BANDS) {
      for (const f of sweep(f0, len)) {
        const pa = revealPanes(f, box, bandOf(key));
        for (const m of [pa.wedge, pa.strip]) {
          const back = composeAffine(
            parseMatrix(affineCss(m)),
            parseMatrix(affineCss(invertAffine(m))),
          );
          for (const [cx, cy] of [
            [0, 0],
            [box.cw, 0],
            [0, box.ch],
            [box.cw, box.ch],
          ]) {
            const [x, y] = applyAffine(back, cx, cy);
            worst = Math.max(worst, Math.abs(x - cx), Math.abs(y - cy));
          }
        }
      }
    }
    // A thousandth of a pixel. A device pixel on the S21 Ultra is 0.27 of one.
    expect(worst).toBeLessThan(0.001);
  });

  it('is a plain skew pair on the bands with one edge', () => {
    // matrix(1,0,s,1,tx,0) IS `translateX(tx) skewX(atan s)`, and its inverse
    // IS `skewX(-atan s) translateX(-tx)`. Asserted because the shape of the
    // wedge's matrix is what keeps it the cheap case.
    const pa = revealPanes(REV_F0 + 20, WIDE_FRAME, { phone: false, tablet: false });
    expect(pa.wedge.a).toBe(1);
    expect(pa.wedge.b).toBe(0);
    expect(pa.wedge.d).toBe(1);
    expect(pa.wedge.f).toBe(0);
    const inv = invertAffine(pa.wedge);
    expect(inv.c).toBeCloseTo(-pa.wedge.c, 12);
    expect(inv.e).toBeCloseTo(-pa.wedge.e, 9);
  });

  it('carries BOTH shears on the phone strip, which is what puts two edges on one box', () => {
    // A skew can only slant one pair of a box's sides. The strip has to slant
    // both — its left edge onto the slant and its bottom edge onto the film's
    // horizontal edge — and that is a general matrix, not a skew.
    const i = 20;
    const pa = revealPanes(PREV_F0 + i, PHONE_FRAME, { phone: true, tablet: false });
    expect(pa.strip.c).toBeCloseTo(PREV_SX[i], 12);
    expect(pa.strip.b).toBeCloseTo(PREV_SY[i], 12);
    expect(pa.strip.b).not.toBe(0);
  });
});

describe('the clip edge lands where the polygon edge landed', () => {
  /**
   * The wedge clips with its RIGHT edge. Map that edge and it has to be the
   * polygon's slant — the same line, in the same place, on every frame.
   */
  it.each([
    ['wide', WIDE_FRAME, REV_F0, REV_X.length, false],
    ['tablet', TABLET_FRAME, TREV_F0, TREV_X.length, true],
  ] as const)('tracks the %s slant', (_k, box, f0, len, tablet) => {
    let worst = 0;
    let checked = 0;
    for (const f of sweep(f0, len)) {
      const clip = wideClip(f, box, tablet);
      if (clip === '') continue;
      const p = points(clip);
      const pa = revealPanes(f, box, { phone: false, tablet });
      expect(pa.done).toBe(false);

      // The polygon quotes the slant at its top (y = −60) and its bottom
      // (y = h + 60) in the LINE's coordinates; the panes work in the copy's,
      // which is the line's shifted by its padding.
      for (const [px, py] of [p[1], p[2]]) {
        const [ex] = applyAffine(pa.wedge, box.cw + WEDGE_BLEED.r, py - box.pt);
        worst = Math.max(worst, Math.abs(ex - (px - box.pl)));
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(50);
    // 0.1 because the polygon was emitted at 1dp; the panes are not rounded.
    expect(worst).toBeLessThanOrEqual(0.05);
  });

  it('tracks both phone edges, and the second one is the strip', () => {
    const box = PHONE_FRAME;
    let corners = 0;
    for (const f of sweep(PREV_F0, PREV_X.length)) {
      const i = f - PREV_F0;
      const clip = phoneClip(f, box);
      if (clip === '') continue;
      const pa = revealPanes(f, box, { phone: true, tablet: false });
      const { a, sx, b, sy } = edgesAt('phone', i, box);

      // The wedge's right edge is the slant: `x − sx·y` is constant along it.
      const [wx, wy] = applyAffine(pa.wedge, box.cw + WEDGE_BLEED.r, 33);
      expect(wx - sx * wy).toBeCloseTo(a, 6);

      // The strip's left edge is that same slant, backed off by the seam so the
      // two panes overlap rather than abut.
      const [lx, ly] = applyAffine(pa.strip, -STRIP_BLEED.l, 71);
      expect(lx - sx * ly).toBeCloseTo(a - PANE_SEAM, 6);

      // The strip's bottom edge is the horizontal edge: `y − sy·x` is constant.
      const [bx, by] = applyAffine(pa.strip, 17, box.ch + STRIP_BLEED.b);
      expect(by - sy * bx).toBeCloseTo(b, 6);

      // And the polygon's own corner — the point it solves for so that its two
      // edges meet without a notch — lies on the strip's bottom edge.
      const p = points(clip);
      if (p.length === 6) {
        const [cx, cy] = p[3];
        expect(cy - box.pt - sy * (cx - box.pl)).toBeCloseTo(b, 0);
        corners++;
      }
    }
    expect(corners).toBeGreaterThan(20);
  });
});

describe('the panes uncover the polygon region', () => {
  /**
   * The assertion that actually proves the picture did not move: walk a grid
   * over the copy and demand that a pixel is uncovered by the panes exactly
   * when the polygon uncovered it.
   *
   * Points within 2px of either edge are skipped. The strip deliberately
   * overlaps the wedge by PANE_SEAM so their shared boundary carries no
   * antialiasing seam, and the polygon was emitted at 1dp — neither is a
   * disagreement about where the edge IS, and both live inside that band.
   */
  it.each(BANDS.map((b) => [b.key, b] as const))(
    'matches the %s polygon, frame by frame',
    (key, { box, f0, len }) => {
      let sampled = 0;
      let misses = 0;
      let first = '';
      for (const f of sweep(f0, len)) {
        const clip = clipFor(key, f, box);
        const pa = revealPanes(f, box, bandOf(key));
        expect(pa.done, 'done disagrees with the polygon at frame ' + f).toBe(clip === '');
        if (clip === '') continue;

        const { a, sx, b, sy } = edgesAt(key, f - f0, box);
        for (let v = -30; v <= box.ch + 30; v += 7) {
          for (let u = -30; u <= box.cw + 30; u += 5) {
            if (Math.abs(u - (a + sx * v)) < 2) continue;
            if (b > -1e6 && Math.abs(v - (b + sy * u)) < 2) continue;
            if (inPanes(pa, box, u, v) !== inClip(clip, u + box.pl, v + box.pt)) {
              misses++;
              if (!first) first = 'frame ' + f + ' at (' + u + ',' + v + ')';
            }
            sampled++;
          }
        }
      }
      expect(sampled).toBeGreaterThan(20000);
      expect(misses, key + ': first mismatch ' + first).toBe(0);
    },
  );

  it('needs BOTH phone panes — neither one alone is the polygon', () => {
    // The phone reveal is a union of half-planes, so an intersection of
    // clipping boxes cannot express it and no single pane can either. This is
    // the counter-example that stops someone "simplifying" the strip away.
    const box = PHONE_FRAME;
    let outsideWedge = 0;
    let outsideStrip = 0;
    for (const f of sweep(PREV_F0, PREV_X.length)) {
      const clip = phoneClip(f, box);
      if (clip === '') continue;
      const pa = revealPanes(f, box, { phone: true, tablet: false });
      for (let v = -30; v <= box.ch + 30; v += 11) {
        for (let u = -30; u <= box.cw + 30; u += 9) {
          if (!inClip(clip, u + box.pl, v + box.pt)) continue;
          if (!insidePane(pa.wedge, box, WEDGE_BLEED, u, v)) outsideWedge++;
          if (!insidePane(pa.strip, box, STRIP_BLEED, u, v)) outsideStrip++;
        }
      }
    }
    expect(outsideWedge).toBeGreaterThan(0);
    expect(outsideStrip).toBeGreaterThan(0);
  });

  it('parks the strip on the bands that have no second edge', () => {
    // Wide and tablet render one pane's worth of copy. The strip is
    // `display:none` there, but it must be geometrically empty as well, or a
    // band change would flash a second copy of the headline over the first.
    for (const { key, box, f0, len } of BANDS) {
      if (key === 'phone') continue;
      for (const f of sweep(f0, len)) {
        const pa = revealPanes(f, box, bandOf(key));
        expect(pa.strip).toBe(PANE_OFF);
        expect(insidePane(pa.strip, box, STRIP_BLEED, box.cw / 2, box.ch / 2)).toBe(false);
      }
    }
  });

  it('clips the strip away entirely before the phone horizontal edge is in shot', () => {
    // `PREV_Y`'s −9999 sentinel is not special-cased. Fed straight through it
    // puts the strip's bottom edge ten thousand film pixels above the copy,
    // which is exactly what the polygon's 4-point stage-1 wedge meant.
    const box = PHONE_FRAME;
    for (let i = 0; i < 7; i++) {
      const pa = revealPanes(PREV_F0 + i, box, { phone: true, tablet: false });
      for (let v = -30; v <= box.ch + 30; v += 23) {
        for (let u = -30; u <= box.cw + 30; u += 29) {
          expect(insidePane(pa.strip, box, STRIP_BLEED, u, v)).toBe(false);
        }
      }
    }
  });
});

describe('the panes finish where the polygon finished', () => {
  it.each(BANDS.map((b) => [b.key, b] as const))(
    'drops the clip on %s at the same frame',
    (key, { box, f0, len }) => {
      let last = -1;
      for (const f of sweep(f0, len, 4)) {
        const clip = clipFor(key, f, box);
        expect(revealPanes(f, box, bandOf(key)).done).toBe(clip === '');
        if (clip !== '') last = f;
      }
      // And it really did sweep, rather than finishing on the first frame.
      expect(last).toBeGreaterThan(f0 + 4);
    },
  );

  it('leaves nothing clipped once it is done', () => {
    const box = PHONE_FRAME;
    const pa = revealPanes(PREV_F0 + PREV_X.length, box, { phone: true, tablet: false });
    expect(pa.done).toBe(true);
    expect(pa.wedge).toBe(IDENTITY);
    for (let v = -60; v <= box.ch + 60; v += 20) {
      for (let u = -60; u <= box.cw + 60; u += 20) {
        expect(insidePane(pa.wedge, box, WEDGE_BLEED, u, v)).toBe(true);
      }
    }
  });

  it('starts the wide band with the whole line still covered', () => {
    const box = WIDE_FRAME;
    const pa = revealPanes(REV_F0, box, { phone: false, tablet: false });
    // The reveal edge starts at film x = 2 and the wide line starts at film
    // x = 200, so on frame one there is nothing of the copy to see.
    expect(insidePane(pa.wedge, box, WEDGE_BLEED, 10, box.ch / 2)).toBe(false);
    expect(insidePane(pa.wedge, box, WEDGE_BLEED, box.cw - 10, box.ch / 2)).toBe(false);
  });
});

describe('the pane bleed', () => {
  /**
   * A pane clips with ONE edge — two, for the strip. Its other edges are only
   * bleed, and they have to stay off the copy for the whole sweep, including
   * whatever the type paints outside its own glyph boxes. 60px is the margin
   * WEDGE_BLEED and STRIP_BLEED are sized for; this is what stops someone
   * trimming them because 800px "looks like a typo".
   *
   * It is a constant and `inkReach` is what keeps it honest. Asserting the
   * bleed against a remembered number only proves the bleed has not moved —
   * the type can move instead, and did not have to ask.
   */
  const SHADOW = 60;

  it('is sized for the ink the stylesheet actually paints, not for a number', () => {
    // The bleed only has to clear the type WHILE the sweep is running: the
    // clip is released at `done` and the line is unclipped from then on. Which
    // is why this is the only place the two are compared — but it is compared,
    // because a shadow grown past the bleed would otherwise be cut through the
    // whole reveal with every test in this file still green.
    expect(INK).toBeGreaterThan(0); // the scan found the shadows at all
    expect(
      SHADOW,
      'the module now paints ' +
        INK +
        'px outside its glyph boxes — grow SHADOW, and WEDGE_BLEED/STRIP_BLEED with it',
    ).toBeGreaterThanOrEqual(INK);
  });

  it.each(BANDS.map((b) => [b.key, b] as const))(
    'never lets a %s pane cut the copy with an edge that is not the reveal',
    (key, { box, f0, len }) => {
      for (const f of sweep(f0, len)) {
        const pa = revealPanes(f, box, bandOf(key));
        if (pa.done) continue;

        // Wedge: the left edge, and the two flat ones.
        for (const v of [-SHADOW, box.ch + SHADOW]) {
          const [lx] = applyAffine(pa.wedge, -WEDGE_BLEED.l, v);
          expect(lx, key + ' wedge left edge at frame ' + f).toBeLessThan(-SHADOW);
        }
        expect(applyAffine(pa.wedge, 0, -WEDGE_BLEED.t)[1]).toBeLessThanOrEqual(-SHADOW);
        expect(
          applyAffine(pa.wedge, 0, box.ch + WEDGE_BLEED.b)[1],
        ).toBeGreaterThanOrEqual(box.ch + SHADOW);

        if (key !== 'phone') continue;

        // Strip: the top edge and the right edge.
        for (const u of [-SHADOW, box.cw + SHADOW]) {
          expect(
            applyAffine(pa.strip, u, -STRIP_BLEED.t)[1],
            'strip top edge at frame ' + f,
          ).toBeLessThan(-SHADOW);
        }
        for (const v of [-SHADOW, box.ch + SHADOW]) {
          expect(
            applyAffine(pa.strip, box.cw + STRIP_BLEED.r, v)[0],
            'strip right edge at frame ' + f,
          ).toBeGreaterThan(box.cw + SHADOW);
        }
      }
    },
  );
});

describe('parking a pane', () => {
  /**
   * `PANE_OFF` is the geometry's way of saying "this pane carries no edge this
   * frame". Writing it to the DOM would be correct and is not what the engine
   * does — a pane translated a hundred thousand pixels off the copy, with its
   * inner counter-translated a hundred thousand pixels back, is a scroll
   * container with a hundred-thousand-pixel scroll range under the
   * `overflow: hidden` fallback that Safari before 16 gets. `isPaneOff` is how
   * the engine spots the case and parks with `visibility` instead.
   */
  it('spots the parked pane', () => {
    expect(isPaneOff(PANE_OFF)).toBe(true);
    expect(isPaneOff(IDENTITY)).toBe(false);
  });

  it('never mistakes a pane that is carrying an edge for a parked one', () => {
    for (const { key, box, f0, len } of BANDS) {
      for (const f of sweep(f0, len, 4)) {
        const pa = revealPanes(f, box, bandOf(key));
        expect(isPaneOff(pa.wedge), key + ' wedge at frame ' + f).toBe(false);
        expect(isPaneOff(pa.strip), key + ' strip at frame ' + f).toBe(
          pa.strip === PANE_OFF,
        );
      }
    }
  });

  it('keeps an order of magnitude between a real offset and the parked one', () => {
    // The threshold is a plain comparison against PANE_OFF's own offset, so
    // what protects it is distance. The largest the tables ever ask for is the
    // phone's "not in shot yet" sentinel, which puts the strip's edge some
    // eight thousand pixels above the copy. If a future table closes that gap
    // this fails here rather than by parking a pane that was carrying an edge.
    let worst = 0;
    for (const { key, box, f0, len } of BANDS) {
      for (const f of sweep(f0, len, 4)) {
        const pa = revealPanes(f, box, bandOf(key));
        for (const m of [pa.wedge, pa.strip]) {
          if (m === PANE_OFF) continue;
          worst = Math.max(worst, Math.abs(m.e), Math.abs(m.f));
        }
      }
    }
    expect(worst).toBeGreaterThan(1000); // the sentinel really is in there
    expect(worst).toBeLessThan(Math.abs(PANE_OFF.f) / 10);
  });
});

describe('the clip is released, not parked', () => {
  /**
   * The picture the panes draw is only half the job. The other half is what
   * they do when there is no picture left to draw: a pane clips to the copy's
   * content box plus its bleed, and a headline left in that state for the rest
   * of the page's life is one shadow, outline or text-stroke away from being
   * silently cut — by a number chosen for the reveal, not for the type.
   *
   * The `clip-path` this replaced was REMOVED from the element at `done`. These
   * are the two files that have to agree that this one still is.
   */
  it('is a state the engine writes, once, on the line itself', () => {
    // Not per frame, and not per pane: one attribute on the reveal line,
    // guarded by its own memo.
    expect(ENGINE).toMatch(/const RV_OPEN = 'data-rv-open'/);
    expect(ENGINE).toMatch(/revOpen\.current !== true[\s\S]{0,80}setAttribute\(RV_OPEN/);
    expect(ENGINE).toMatch(/revOpen\.current !== false[\s\S]{0,80}removeAttribute\(RV_OPEN/);
  });

  it('is entered by `done` and by `?reveal=off`, and by nothing else', () => {
    // `done` takes the same exit as the escape hatch: the sweep is over, so the
    // clip is over with it.
    expect(ENGINE).toMatch(/if \(noReveal\.current \|\| panes\.done\) \{\s*release\(\);/);
    // …and the state where the reveal never ran at all — reduced motion, no
    // decoder, the `off` band — takes it too.
    expect(ENGINE).toMatch(/if \(!on \|\| !frame\) \{[\s\S]{0,200}release\(\);/);
  });

  it('takes the clip off both panes in the stylesheet', () => {
    // Higher specificity than the `@supports (overflow: clip)` rule it has to
    // beat, so the order of the two in the file cannot decide it.
    expect(CSS).toMatch(
      /\.rvLine\[data-rv-open\][^{]*\.rvPane\s*\{[^}]*overflow:\s*visible/,
    );
  });

  it('takes the promotion off with it', () => {
    // `will-change: transform` is the reveal's, not the line's. Pinned for the
    // session it holds a full-resolution text layer on a phone, and hands the
    // narrow band's --lsc exit a promoted layer to stretch rather than a line
    // to re-raster.
    expect(CSS, 'the pane').toMatch(
      /\.rvLine\[data-rv-open\][^{]*\.rvPane\s*\{[^}]*will-change:\s*auto/,
    );
    expect(CSS, 'the counter-transformed inner').toMatch(
      /\.rvLine\[data-rv-open\][^{]*\.rvInner\s*\{[^}]*will-change:\s*auto/,
    );
  });

  it('is the same `done` the line scrim waits for', () => {
    // The scrim is `.line::before`, a child of the LINE and not of either pane,
    // so it was never inside the clip in the first place. That is only harmless
    // because it is not lit until `done` — by which point, now, nothing is
    // clipped at all. Two things keyed to one flag; this is the second.
    expect(ENGINE).toMatch(/revDone\.current === true/);
  });

  it('parks the second copy rather than moving it, so nothing paints twice', () => {
    // Released, BOTH panes carry the identity — the strip's duplicate copy
    // lands exactly on top of the wedge's. `visibility` is the only thing
    // keeping it off the screen, and the engine writes it from `isPaneOff`.
    expect(ENGINE).toMatch(/const park = isPaneOff\(m\)/);
    expect(ENGINE).toMatch(/style\.visibility = park \? 'hidden' : ''/);
    expect(ENGINE).toMatch(/affineCss\(park \? IDENTITY : m\)/);
  });
});
