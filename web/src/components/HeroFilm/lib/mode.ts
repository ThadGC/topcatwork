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
