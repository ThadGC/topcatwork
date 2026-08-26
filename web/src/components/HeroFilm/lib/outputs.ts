/**
 * HERO FILM — output curves.
 *
 * Every visible property the film drives is a pure function of either film
 * progress (0..1) or film time (seconds). They are all here, none of them
 * touch the DOM, and each one keeps the source's exact rounding — the 2dp
 * `toFixed` calls are not cosmetic, they are the memo guards. Rounding to two
 * places is what stops a value that wobbles in the fifth decimal from writing
 * a new inline style on every one of 60 animation frames per second.
 */

import {
  CURVE_AT,
  GRADE_HI,
  GRADE_LO,
  GRADE_MIN,
  INK_AT,
  PLATE_CUT,
  FPS,
  Z_FAR,
  Z_NEAR,
} from './constants';

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** The one easing the whole film uses for alpha: 3k² - 2k³. */
export const smoothstep = (k: number): number => k * k * (3 - 2 * k);

/** Round to 2dp and return a number (not a string) — `+(x).toFixed(2)`. */
export const r2 = (v: number): number => Number(v.toFixed(2));
export const r3 = (v: number): number => Number(v.toFixed(3));
export const r1 = (v: number): number => Number(v.toFixed(1));

/**
 * `veil(film)` — site.js 2978-2985.
 *
 * The hero scrim is held at `veilMin` for the whole film, then ramps to full
 * over the tail: from `veilAt` seconds to the end. `--cineVeil` -> the
 * `.hero-shade` opacity.
 */
export function veilValue(
  film: number,
  dur: number,
  veilAt: number,
  veilMin: number,
): number {
  const t = film * dur;
  const k = clamp01((t - veilAt) / Math.max(0.001, dur - veilAt));
  return r2(veilMin + (1 - veilMin) * smoothstep(k));
}

/**
 * `curve(film)` — site.js 2988-2994.
 *
 * The hero's bottom corner radius (`--curveR: calc(48px * v)`) and the hairline
 * `::after` only appear over the last 10% of the film, as the page below is
 * about to be revealed.
 */
export function curveValue(film: number): number {
  const k = clamp01((film - CURVE_AT) / (1 - CURVE_AT));
  return r2(smoothstep(k));
}

/** `ink(film)` — releases the hero copy/CTA entrance at 93%. */
export function inkOn(film: number): boolean {
  return film >= INK_AT;
}

/**
 * `plate(t)` — the frame-0 still only covers frame 0 itself.
 *
 * Driven by the video's *shown* time, never by the scroll target: the plate is
 * there to hide the decoder's first-paint, so it has to follow the decoder.
 */
export function plateOpacity(shownTime: number): 0 | 1 {
  return shownTime * FPS < PLATE_CUT ? 1 : 0;
}

/** Rec.709 luma of one RGBA pixel. */
export function luma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Sorted Rec.709 luma of the first `count` pixels of an RGBA buffer.
 * Ascending, so percentile picks are indexed from the end.
 */
export function sortedLuma(data: ArrayLike<number>, count: number): number[] {
  const cell: number[] = new Array(count);
  for (let i = 0; i < count; i++) {
    cell[i] = luma(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  }
  cell.sort((a, b) => a - b);
  return cell;
}

/**
 * Nav grade — `grade()`, site.js 3007-3013.
 *
 * 48x4 = 192 samples of the top `header.bar` band, sorted, and the 188th
 * (~97.4th percentile) taken. Not the max: one blown highlight in the corner
 * of the frame should not darken the nav for a whole second. Floored at 0.20
 * so the nav always has *some* scrim to sit on.
 */
export function navGradeFromLuma(sorted: number[]): number {
  const hi = sorted[187];
  return r2(Math.max(GRADE_MIN, clamp01((hi - GRADE_LO) / (GRADE_HI - GRADE_LO))));
}

/**
 * Band grade — `bandGrade()`, site.js 3196-3198.
 *
 * 48x8 = 384 samples over the *line's own* rect, and the max taken, with no
 * floor. A story line only needs a scrim where it would otherwise sit on a
 * bright patch, so here the brightest pixel under the text is the right
 * statistic and zero is a legitimate answer.
 */
export function bandGradeFromLuma(sorted: number[]): number {
  return clamp01((sorted[sorted.length - 1] - GRADE_LO) / (GRADE_HI - GRADE_LO));
}

/**
 * Default story-beat alpha — site.js 3259.
 *
 * In over the first 16% of the beat's window, out over the last 26%.
 * Outside `[0,1]` the beat is hard off, so a beat that has not started yet
 * cannot bleed a fractional opacity.
 */
export function storyAlpha(p: number): number {
  const a = p <= 0 || p >= 1 ? 0 : Math.min(1, p / 0.16, (1 - p) / 0.26);
  return r2(smoothstep(a));
}

/**
 * Reveal-line alpha — site.js 3204-3206.
 *
 * There is deliberately no fade *in*: the clip-path wipe is the entrance. Only
 * the exit is faded, over `FAD` seconds (2.03 on a phone, 2.47 elsewhere).
 */
export function revealAlpha(t: number, at: number, out: number, fad: number): number {
  const p = clamp01((t - at) / (out - at));
  const a = p <= 0 || p >= 1 ? 0 : Math.min(1, (out - t) / fad);
  return r2(smoothstep(a));
}

/** Narrow-band reveal-line shrink as it leaves — `--lsc`, site.js 3229-3232. */
export function revealScale(t: number, out: number, fad: number): number {
  const q = clamp01((t - (out - fad)) / fad);
  return r3(1 - 0.16 * q * q);
}

/**
 * Story-beat Z — site.js 3262.
 *
 * `p²` so the beat hangs back at the far plane and then rushes the camera,
 * which is what makes the perspective read as depth rather than a zoom.
 */
export function storyZ(p: number, zNear: number = Z_NEAR): number {
  return Math.round(Z_FAR + (zNear - Z_FAR) * p * p);
}

/**
 * Story-beat blur — site.js 3263.
 *
 * Only over the last 28% of the window, quantised to 0.5px steps (max 4.5px).
 * The quantisation matters: a continuously-varying blur radius forces the
 * compositor to re-rasterise the text every frame.
 */
export function storyBlur(p: number): number {
  return p > 0.72 ? Math.round(((p - 0.72) / 0.28) * 9) / 2 : 0;
}

/**
 * The wide-band hero wipe ease — site.js 3019.
 *
 * `0.4p + 0.6p²`, i.e. it already has speed at p=0. The hero copy is meant to
 * be *taken* off the screen by the film, not to accelerate politely away.
 */
export function wipeEase(p: number): number {
  return 0.4 * p + 0.6 * p * p;
}

/**
 * Kit-line slide offset — site.js 3234-3241 (narrow) / 3249-3253 (wide).
 *
 * Slides in from the left over `[at, setAt]` as `-(x1)(1-q)²` and back out
 * over `[outAt, out]` as `-(x1)q²`. Between the two it sits at 0.
 */
export function kitOffset(
  t: number,
  at: number,
  out: number,
  setAt: number,
  outAt: number,
  x1: number,
): number {
  if (t < setAt) {
    const q = clamp01((t - at) / (setAt - at));
    return r2(-x1 * (1 - q) * (1 - q));
  }
  if (t > outAt) {
    const q = clamp01((t - outAt) / (out - outAt));
    return r2(-x1 * q * q);
  }
  return 0;
}

/** Narrow-band hero copy fade — site.js 3300-3303. */
export function heroNarrow(t: number): { o: number; z: number } {
  const p = clamp01(t / 4.8);
  const a = p >= 1 ? 0 : Math.min(1, (1 - p) / 0.26);
  return { o: r2(smoothstep(a)), z: Math.round(380 * p * p) };
}
