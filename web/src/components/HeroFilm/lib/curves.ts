/**
 * HERO FILM — the output curves.
 *
 * Every visible property is a pure function of film time or film progress.
 * None of them touch the DOM. Transcribed from
 * ~/Documents/TOPCAT-FILM-SPEC/FILM-SPEC.md §4.
 *
 * ── the rounding is not cosmetic ────────────────────────────────────────────
 * Each value is rounded before it is written. That is the memo guard: an
 * unrounded value wobbles in the fifth decimal and writes a new inline style
 * on every animation frame, which is a style recalculation the compositor did
 * not need. Rounded, the engine can compare against the last value and skip
 * the write entirely — which is what keeps a 60Hz loop down to a handful of
 * DOM writes a second.
 *
 * ── WHAT IS NOT HERE, AND WHY ───────────────────────────────────────────────
 * The previous build carried `storyZ` (a translateZ rush from -150 to 560 on
 * a `perspective:1000px` stage) and `storyBlur` (a 0..4.5px exit blur). BOTH
 * ARE GONE, and they cost nothing:
 *
 *   - The engine applied them in its "everything else" branch, which is the
 *     branch that only ever ran for beat 1 — and beat 1 is `display:none` in
 *     every band. They were computed 60 times a second and written to an
 *     element nobody could see.
 *   - They are also two of the worst things you can do to text on a phone. A
 *     perspective ancestor stops the lines flattening into the stage's layer,
 *     so each becomes its own committed layer; and the projection factor
 *     1000/(1000 - z) sweeps 0.87 -> 2.27 as z runs its range, which is a
 *     continuous raster-scale change on live text. Every threshold crossing is
 *     a synchronous glyph repaint that re-snaps subpixel positions — a shiver
 *     in the text independent of anything else on screen.
 *
 * So the STORY BEATS lose nothing visible and the film sheds its worst
 * text-rendering hazard. Do not reintroduce `perspective` to "restore" their
 * depth: there was no visible depth to restore.
 *
 * ⚠️ THE HERO COPY IS THE EXCEPTION, and the distinction is the whole point.
 * On phone and tablet it really does fly at the camera as it leaves, and that
 * IS visible — the client spotted it missing. `heroNarrowScale` below brings it
 * back as a plain `scale`, which is mathematically the same picture, because a
 * pure translateZ under perspective is exactly a uniform scale about the
 * perspective origin. The look is restored; the 3D rendering context is not.
 */

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** The one easing the whole film uses for alpha: 3k² − 2k³. */
export const smoothstep = (k: number): number => k * k * (3 - 2 * k);

export const r2 = (v: number): number => Math.round(v * 100) / 100;
export const r3 = (v: number): number => Math.round(v * 1000) / 1000;

/**
 * Reveal-line alpha.
 *
 * There is deliberately NO FADE IN: the wipe that uncovers the line is its
 * entrance. Only the exit is faded, over `fad` seconds — 2.03 on a phone,
 * 2.47 everywhere else.
 */
export function revealAlpha(t: number, at: number, out: number, fad: number): number {
  const p = clamp01((t - at) / (out - at));
  const a = p <= 0 || p >= 1 ? 0 : Math.min(1, (out - t) / fad);
  return r2(smoothstep(a));
}

/**
 * The reveal line's shrink as it leaves — phone and tablet only.
 *
 * 1 -> 0.84 over the last `fad` seconds. This is the film's only animated
 * scale on text, and it is deliberately kept: it runs for two seconds on a
 * line that is fading to nothing at the same time, so any raster churn it
 * causes lands on glyphs that are already almost transparent. It is also the
 * first thing to try switching off if the text alone is ever reported as
 * unsteady — see `?film=noscale` in ./mode.ts.
 */
export function revealScale(t: number, out: number, fad: number): number {
  const q = clamp01((t - (out - fad)) / fad);
  return r3(1 - 0.16 * q * q);
}

/**
 * The kit line's slide.
 *
 * In from the left over `[at, setAt]` as −x1(1−q)², out again over
 * `[outAt, out]` as −x1·q². Flat at 0 between the two. `x1` is the line's own
 * right edge, so it travels its full width and is never partly on screen at
 * rest.
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

/**
 * The wide band's hero wipe.
 *
 * `0.4p + 0.6p²` — it already has speed at p=0, because the hero copy is meant
 * to be TAKEN off the screen by the film rather than to accelerate politely
 * away.
 */
export function wipeEase(p: number): number {
  return 0.4 * p + 0.6 * p * p;
}

/** The phone and tablet hero copy fade: gone by 4.8s. */
export function heroNarrowAlpha(t: number): number {
  const p = clamp01(t / 4.8);
  const a = p >= 1 ? 0 : Math.min(1, (1 - p) / 0.26);
  return r2(smoothstep(a));
}

/**
 * The phone and tablet hero copy does not just fade — it flies AT THE CAMERA.
 *
 * The original expressed this as `translateZ(380p²)` under a
 * `perspective: 1000px` ancestor. This build has no perspective anywhere, and
 * deliberately: a perspective ancestor stops text flattening into its parent's
 * layer and makes every frame a new raster scale on live glyphs, which is a
 * shiver of its own. Losing it also lost the movement, and the client caught
 * that the mobile copy was not animating like the desktop one.
 *
 * It comes back as a plain `scale`, and that is not an approximation: a pure
 * translateZ under perspective IS a uniform scale about the perspective origin,
 * exactly `d / (d − z)`. Feed it the same z and give the element a
 * transform-origin at the projected perspective origin — which useFilm.ts
 * measures — and the two are the same picture, without a 3D rendering context.
 *
 * At the end of the ramp z is 380, so the copy reaches 1000/620 = 1.61x.
 */
export function heroNarrowScale(t: number): number {
  const p = clamp01(t / 4.8);
  const z = 380 * p * p;
  return r3(1000 / (1000 - z));
}

/**
 * THE KEEP-SCROLLING CUE. A handover, not a fade.
 *
 * The rise starts at the film second the OPENING COPY has finished leaving — 6
 * on the wide band, where `.heroCopy` slides out over `t / 6`, and 4.8 on phone
 * and tablet, where `heroNarrowAlpha` reaches zero. So the small arrow picks up
 * exactly where the big one goes and the visitor never sees two at once.
 *
 * `out` is the film second it must be GONE by, and the caller passes
 * `HERO_INK * dur` — the same 93% at which the page's own hero is released. The
 * client, 28 Aug: "as soon as the surfaces worth building around text and stuff
 * animates in, then that arrow goes away." It reaches zero AT the ink rather
 * than after it, so none of the film's furniture is still fading while the h1
 * arrives.
 *
 * `min` of the two, not a product: a visitor who flicks straight through 93%
 * gets one clean disappearance instead of a fade-in immediately undone.
 */
export function keepCueAlpha(t: number, out: number, wide: boolean): number {
  const rise = clamp01((t - (wide ? 6 : 4.8)) / 1.2);
  const fall = clamp01((out - t) / 1.4);
  return r2(smoothstep(Math.min(rise, fall)));
}

/**
 * The scrim over the footage.
 *
 * Held at `veilMin` for the whole film so the picture reads, then ramped to
 * full from `veilAt` seconds to the end, so the hero copy has something to
 * land on.
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

/** The hero's bottom corner radius, over the last 10% of the film only. */
export function curveValue(film: number): number {
  return r2(smoothstep(clamp01((film - 0.9) / 0.1)));
}

/**
 * The frame-0 plate covers frame 0 and nothing else.
 *
 * The client, 28 Aug: "you overlay that frame, and then that frame goes
 * immediately away … as the user starts scrolling."
 *
 * Driven by the film's TARGET time, not by the decoder's reported time. The
 * previous build drove it from the decoder so the plate could not lift before
 * a real frame was painted — but that couples a visible property to network
 * latency, and on a real connection it meant the plate hung on after the
 * visitor had started moving. The film is memory-resident before the scrub
 * arms (see useFilm.ts), so by the time this can be called there IS a decoded
 * frame underneath.
 */
export function plateOpacity(filmSeconds: number, fps: number): 0 | 1 {
  return filmSeconds * fps < 0.5 ? 1 : 0;
}
