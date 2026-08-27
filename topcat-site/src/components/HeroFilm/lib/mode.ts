/**
 * HERO FILM — the `?film=` transport switch.
 *
 * `?film=scrub` (the default) — the VDM disciplined-seek scrub: coalesced
 * seeks, an epsilon deadband, a target lerp. This is what ships.
 *
 * `?film=play` — the forward-play `playbackRate` chase in ./transport.ts. It
 * was an experiment: run the film forward and modulate the rate, on the theory
 * that forward decode is the path hardware is built for. It is kept behind
 * this switch, tests and all, because it is the only way to A/B the two on a
 * real device without a rebuild — but it is NOT the VDM approach and it is not
 * the default.
 *
 * Read from `location.search` deliberately, and never during render: under
 * `output: 'export'` the HTML is prerendered with no `location` at all, so the
 * engine reads this in its boot effect and defaults to `scrub` everywhere else.
 */

export type FilmMode = 'scrub' | 'play';

/** Pure half, so the parsing is testable without a `location`. */
export function readFilmMode(search: string): FilmMode {
  const m = /[?&]film=([^&]*)/.exec(search || '');
  if (!m) return 'scrub';
  let value = m[1];
  try {
    value = decodeURIComponent(value);
  } catch {
    /* a malformed escape is not a mode */
  }
  return value.toLowerCase() === 'play' ? 'play' : 'scrub';
}

/** Effectful half. Safe to call before hydration; returns `scrub` on the server. */
export function filmMode(): FilmMode {
  if (typeof location === 'undefined') return 'scrub';
  return readFilmMode(location.search);
}

/**
 * `?grade=off` — skip every video→canvas readback.
 *
 * WHY THIS EXISTS. `drawImage(video, …)` forces a GPU→CPU readback. The JS call
 * itself measures ~20ms on an S21, which a probe attributes correctly, but the
 * pipeline flush it induces is paid afterwards on the COMPOSITOR — invisible to
 * both the long-task observer and any timing wrapper around the call. On a
 * device probe, 21 readbacks in 14s showed as 1.3% of the main thread while 38
 * frames blew past 33ms with no long task to blame, and a run that did not
 * scrub at all held 57.6fps. This switch is how that hypothesis gets tested on
 * a real handset instead of argued about.
 *
 * With grading off, `navGrade` and `bandGrade` return the neutral value the
 * legacy engine falls back to when the frame is unreadable, so the nav band and
 * the copy keep a fixed lift rather than tracking the film's luminance. That is
 * a visible but small change, and it is exactly what a precomputed luminance
 * track would replace if the experiment says readbacks are the cost.
 */
export function readGradeOff(search: string): boolean {
  const m = /[?&]grade=([^&]*)/.exec(search || '');
  if (!m) return false;
  let value = m[1];
  try {
    value = decodeURIComponent(value);
  } catch {
    /* a malformed escape is not a value */
  }
  return value.toLowerCase() === 'off';
}

/** Effectful half. Returns false on the server, so the export is unaffected. */
export function gradeOff(): boolean {
  if (typeof location === 'undefined') return false;
  return readGradeOff(location.search);
}

/**
 * `?reveal=off` — stop writing `clip-path` to the story line every frame.
 *
 * WHY. The slab reveal animates a polygon `clip-path` on the headline, a fresh
 * string per animation frame. A changing clip-path cannot be composited: the
 * browser must RE-RASTERISE that element every frame, and on a phone at
 * devicePixelRatio 3.75 that is a full-width text layer redrawn 60 times a
 * second. Raster work is charged to neither the long-task observer nor a
 * wrapper around requestAnimationFrame, which is why four rounds of device
 * probes came back clean while the stutter stayed exactly where the text is.
 *
 * With this on, the line is simply un-clipped: the reveal does not play, but
 * the copy still fades and moves on its own schedule.
 *
 * ── what it found, and what shipped ─────────────────────────────────────────
 * It found the stutter: `?reveal=off` reads "a lot smoother" on an S21 Ultra
 * while changing nothing else. The reveal is no longer a clip-path because of
 * it. It is now a pair of `overflow`-clipped panes carrying the edge on a
 * transform, over copy carrying the exact inverse — see lib/reveal.ts — so
 * nothing on this path rasterises per frame any more.
 *
 * The switch stays, because it is still the only way to A/B the reveal against
 * no reveal at all on a real handset without a rebuild. It now means "leave the
 * panes at identity": the geometry is still computed, since `done` is what
 * gates the line's scrim, and nothing clips.
 */
export function readRevealOff(search: string): boolean {
  const m = /[?&]reveal=([^&]*)/.exec(search || '');
  if (!m) return false;
  let value = m[1];
  try {
    value = decodeURIComponent(value);
  } catch {
    /* a malformed escape is not a value */
  }
  return value.toLowerCase() === 'off';
}

/** Effectful half. Returns false on the server, so the export is unaffected. */
export function revealOff(): boolean {
  if (typeof location === 'undefined') return false;
  return readRevealOff(location.search);
}
