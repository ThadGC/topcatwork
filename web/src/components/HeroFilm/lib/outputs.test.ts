/**
 * HERO FILM — output-curve tests.
 *
 * These are the functions the whole composition is made of. They are cheap to
 * test and expensive to get subtly wrong: a veil that starts a second early
 * dims the last shot, a curve that opens too soon shows the page below through
 * the hero's corners, a blur that is not quantised re-rasterises the text 60
 * times a second.
 */

import { describe, it, expect } from 'vitest';
import {
  bandGradeFromLuma,
  clamp01,
  curveValue,
  heroNarrow,
  inkOn,
  kitOffset,
  luma,
  navGradeFromLuma,
  plateOpacity,
  revealAlpha,
  revealScale,
  smoothstep,
  sortedLuma,
  storyAlpha,
  storyBlur,
  storyZ,
  veilValue,
  wipeEase,
} from './outputs';
import { FPS, GRADE_MIN, INK_AT, Z_FAR } from './constants';
import { coverFit, filmFrame } from './geometry';

const DUR = 44.25;

describe('veil', () => {
  it('holds the floor for the whole film, then ramps over the tail', () => {
    expect(veilValue(0, DUR, 38, 0.2)).toBe(0.2);
    expect(veilValue(37 / DUR, DUR, 38, 0.2)).toBe(0.2);
    expect(veilValue(1, DUR, 38, 0.2)).toBe(1);
  });

  it('is monotone across the ramp', () => {
    let prev = -1;
    for (let i = 0; i <= 100; i++) {
      const v = veilValue(i / 100, DUR, 38, 0.2);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('rounds to 2dp — the memo guard depends on it', () => {
    // Without the rounding this value wobbles in the fifth decimal and writes
    // a new inline style on every one of 60 frames a second.
    for (let i = 0; i <= 50; i++) {
      const v = veilValue(i / 50, DUR, 38, 0.2);
      expect(Number(v.toFixed(2))).toBe(v);
    }
  });

  it('survives a veilAt at the very end of the film', () => {
    expect(Number.isFinite(veilValue(1, DUR, DUR, 0.2))).toBe(true);
  });
});

describe('curve', () => {
  it('stays shut until the last tenth of the film', () => {
    expect(curveValue(0)).toBe(0);
    expect(curveValue(0.9)).toBe(0);
    expect(curveValue(0.89)).toBe(0);
  });
  it('is fully open at the end', () => {
    expect(curveValue(1)).toBe(1);
  });
  it('eases rather than ramping linearly', () => {
    expect(curveValue(0.95)).toBe(0.5);
    expect(curveValue(0.925)).toBeLessThan(0.25);
  });
});

describe('ink', () => {
  it('releases the hero copy at 93% and not before', () => {
    expect(inkOn(INK_AT - 0.001)).toBe(false);
    expect(inkOn(INK_AT)).toBe(true);
    expect(inkOn(1)).toBe(true);
  });
});

describe('plate', () => {
  it('covers frame 0 only', () => {
    // The argument is the PRESENTED `mediaTime`, so the only values it ever
    // really takes are multiples of one source frame. `PLATE_CUT` is half a
    // frame, so frame 0 is in and every other frame is out — and that is true
    // whether FPS is the source's 24 or the 60 it used to be, because the
    // threshold scales with the constant. Asserted against the frame grid
    // rather than a bare millisecond figure so it stays true either way.
    const frame = (n: number) => n / FPS;
    expect(plateOpacity(frame(0))).toBe(1);
    expect(plateOpacity(frame(0.49))).toBe(1);
    expect(plateOpacity(frame(1))).toBe(0);
    expect(plateOpacity(frame(2))).toBe(0);
    expect(plateOpacity(10)).toBe(0);
  });
});

describe('story alpha', () => {
  it('is hard off outside the beat window', () => {
    // Not 'nearly off': a beat that has not started must not composite at all.
    expect(storyAlpha(0)).toBe(0);
    expect(storyAlpha(1)).toBe(0);
    expect(storyAlpha(-0.5)).toBe(0);
    expect(storyAlpha(1.5)).toBe(0);
  });

  it('is fully on across the middle', () => {
    expect(storyAlpha(0.5)).toBe(1);
    expect(storyAlpha(0.2)).toBe(1);
  });

  it('fades in over the first 16% and out over the last 26%', () => {
    expect(storyAlpha(0.08)).toBeGreaterThan(0);
    expect(storyAlpha(0.08)).toBeLessThan(1);
    expect(storyAlpha(0.9)).toBeGreaterThan(0);
    expect(storyAlpha(0.9)).toBeLessThan(1);
    // The out ramp is longer than the in ramp, so at symmetric distances from
    // the ends the exit is further along.
    expect(storyAlpha(0.08)).not.toBe(storyAlpha(0.92));
  });
});

describe('reveal alpha', () => {
  it('has no fade in — the clip-path is the entrance', () => {
    // The moment the beat opens it is at full opacity; the wipe does the work.
    expect(revealAlpha(10.4, 10.3, 24.5, 2.47)).toBe(1);
    expect(revealAlpha(15, 10.3, 24.5, 2.47)).toBe(1);
  });
  it('fades out over the last FAD seconds', () => {
    expect(revealAlpha(23.5, 10.3, 24.5, 2.47)).toBeGreaterThan(0);
    expect(revealAlpha(23.5, 10.3, 24.5, 2.47)).toBeLessThan(1);
    expect(revealAlpha(24.5, 10.3, 24.5, 2.47)).toBe(0);
  });
  it('is off before it starts', () => {
    expect(revealAlpha(9, 10.3, 24.5, 2.47)).toBe(0);
  });
  it('shrinks on the way out, on the narrow band', () => {
    expect(revealScale(10.3, 24.5, 2.47)).toBe(1);
    expect(revealScale(24.5, 24.5, 2.47)).toBeCloseTo(0.84, 5);
  });
});

describe('story depth and blur', () => {
  it('starts at the far plane and rushes the camera', () => {
    expect(storyZ(0, 560)).toBe(Z_FAR);
    expect(storyZ(1, 560)).toBe(560);
    // p² — the beat hangs back before it moves.
    expect(storyZ(0.5, 560)).toBeLessThan((Z_FAR + 560) / 2);
  });

  it('uses the shallower wide-band planes for the film-space slots', () => {
    expect(storyZ(1, 150)).toBe(150);
    expect(storyZ(1, 300)).toBe(300);
  });

  it('blurs only on the way out, in half-pixel steps, capped at 4.5', () => {
    expect(storyBlur(0.5)).toBe(0);
    expect(storyBlur(0.72)).toBe(0);
    expect(storyBlur(1)).toBe(4.5);
    for (let i = 72; i <= 100; i++) {
      const b = storyBlur(i / 100);
      expect(b * 2).toBe(Math.round(b * 2)); // quantised to 0.5
      expect(b).toBeLessThanOrEqual(4.5);
    }
  });
});

describe('the hero wipe', () => {
  it('starts with speed already on it', () => {
    // 0.4p + 0.6p²: the copy is taken off the screen by the film, not eased
    // politely away.
    expect(wipeEase(0)).toBe(0);
    expect(wipeEase(1)).toBeCloseTo(1, 10);
    expect(wipeEase(0.1)).toBeGreaterThan(0.04);
  });

  it('accelerates', () => {
    const d1 = wipeEase(0.2) - wipeEase(0.1);
    const d2 = wipeEase(0.9) - wipeEase(0.8);
    expect(d2).toBeGreaterThan(d1);
  });

  it('fades and pushes back on the narrow band instead', () => {
    expect(heroNarrow(0)).toEqual({ o: 1, z: 0 });
    const late = heroNarrow(4.8);
    expect(late.o).toBe(0);
    expect(late.z).toBe(380);
  });
});

describe('the kit line slide', () => {
  const at = 27.0;
  const out = 38.5;
  const x1 = 900;

  it('is fully off-screen left when the beat opens', () => {
    expect(kitOffset(at, at, out, 30.2, 35.3, x1)).toBe(-900);
  });
  it('has settled at zero by the set point', () => {
    expect(kitOffset(30.2, at, out, 30.2, 35.3, x1)).toBe(0);
    expect(kitOffset(32, at, out, 30.2, 35.3, x1)).toBe(0);
  });
  it('leaves left again after the out point', () => {
    expect(kitOffset(35.3, at, out, 30.2, 35.3, x1)).toBe(0);
    expect(kitOffset(out, at, out, 30.2, 35.3, x1)).toBe(-900);
    expect(kitOffset(37, at, out, 30.2, 35.3, x1)).toBeLessThan(0);
  });
  it('decelerates in and accelerates out — (1−q)² then q²', () => {
    const half = kitOffset(at + (30.2 - at) / 2, at, out, 30.2, 35.3, x1);
    expect(half).toBeCloseTo(-x1 * 0.25, 1);
  });
});

describe('grading', () => {
  it('weights luma Rec.709', () => {
    expect(luma(255, 255, 255)).toBeCloseTo(255, 5);
    expect(luma(0, 0, 0)).toBe(0);
    expect(luma(0, 255, 0)).toBeCloseTo(182.376, 3);
  });

  it('sorts ascending so percentile picks index from the end', () => {
    const data = [0, 0, 0, 255, 255, 255, 255, 255, 128, 128, 128, 255];
    const s = sortedLuma(data, 3);
    expect(s[0]).toBeLessThanOrEqual(s[1]);
    expect(s[1]).toBeLessThanOrEqual(s[2]);
  });

  it('floors the nav grade so the header always has some scrim', () => {
    const dark = new Array(192).fill(0);
    expect(navGradeFromLuma(dark)).toBe(GRADE_MIN);
  });

  it('takes the ~97th percentile for the nav, not the max', () => {
    // One blown highlight in a corner must not darken the whole nav.
    const mostlyDark = new Array(192).fill(0);
    mostlyDark[190] = 255;
    mostlyDark[191] = 255;
    expect(navGradeFromLuma(mostlyDark)).toBe(GRADE_MIN);
  });

  it('saturates the nav grade over a bright frame', () => {
    expect(navGradeFromLuma(new Array(192).fill(255))).toBe(1);
  });

  it('takes the max for a story line, with no floor', () => {
    // A line over a dark shot needs no scrim at all, and zero is a legitimate
    // answer here — unlike the nav.
    expect(bandGradeFromLuma(new Array(384).fill(0))).toBe(0);
    const oneHot = new Array(384).fill(0);
    oneHot[383] = 255;
    expect(bandGradeFromLuma(oneHot)).toBe(1);
  });
});

describe('geometry', () => {
  it('covers: a wide source overflows horizontally', () => {
    const f = coverFit(1000, 1000, 1920, 1080);
    expect(f.dh).toBe(1000);
    expect(f.dw).toBeGreaterThan(1000);
    expect(f.dx).toBeLessThan(0);
    expect(f.dy).toBe(0);
  });

  it('covers: a source narrower than the box overflows vertically', () => {
    // Portrait source in a landscape box: the width is pinned and the height
    // runs off the top and bottom symmetrically.
    const f = coverFit(2000, 1000, 1080, 1920);
    expect(f.dw).toBe(2000);
    expect(f.dh).toBeGreaterThan(1000);
    expect(f.dx).toBe(0);
    expect(f.dy).toBeLessThan(0);
    expect(f.dy).toBeCloseTo((1000 - f.dh) / 2, 10);
  });

  it('film frame: a 16:9 box maps 1 film px to width/1920', () => {
    const f = filmFrame(1920, 1080, 1920, 1080);
    expect(f.filmU).toBe(1);
    expect(f.filmX).toBe(0);
    expect(f.filmY).toBe(0);
  });

  it('film frame: rounds so a resize does not jitter the layout', () => {
    const f = filmFrame(1373, 812, 1920, 1080);
    expect(String(f.filmU).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(5);
    expect(String(f.filmX).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);
  });
});

describe('primitives', () => {
  it('clamps', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(9)).toBe(1);
  });
  it('smoothsteps', () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(0.5)).toBe(0.5);
  });
});
