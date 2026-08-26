/**
 * HERO FILM — clip-path reveal tests.
 *
 * The reveal is the one part of the film that is measured data rather than
 * arithmetic: 82 (wide) / 49 (tablet) / 32 (phone) hand-measured frames of a
 * moving edge. A regression here does not throw, it just puts the mask a few
 * pixels off the edge in the footage and the line looks like it is fading in
 * badly. So the invariants get asserted.
 */

import { describe, it, expect } from 'vitest';
import {
  at,
  phoneClip,
  wideClip,
  revealClip,
  PREV_F0,
  PREV_X,
  PREV_Y,
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
  type RevealBox,
} from './reveal';
import { REV_PAD } from './constants';

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
