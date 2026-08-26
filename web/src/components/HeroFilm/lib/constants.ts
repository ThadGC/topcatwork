/**
 * HERO FILM — constants.
 *
 * Every number here is copied verbatim out of the legacy cine module
 * (assets/site.js 2841-3473). This is a PORT, not a redesign: do not round a
 * value, do not merge two nearly-equal values, do not "tidy" a magic number.
 * The film was tuned frame-by-frame against a 12fps source; the reveal tables
 * in ./reveal.ts are keyed to these exact figures.
 */

/**
 * Seek quantisation grid. NOT the source frame rate — the legacy module
 * snapped `currentTime` onto a 1/60s lattice and sampled mid-frame, so a
 * scroll delta smaller than 1/60s never issued a decoder seek.
 */
export const FPS = 60;

/** The real source frame rate. Drives the clip-path reveal tables. */
export const SRCFPS = 12;

/** Fallback duration, replaced by `video.duration` once it is finite and > 1. */
export const DUR = 44.25;

/** Per-60fps-frame chase constant for the scroll easing. */
export const EASE = 0.15;

/** Film progress at which `#hero` gets `.loaded` and the hero copy enters. */
export const INK_AT = 0.93;

/** Film progress at which the hero's bottom corner radius starts unrolling. */
export const CURVE_AT = 0.9;

/** Nav-grade luma ramp: 30 -> 185, floored at 0.20. */
export const GRADE_LO = 30;
export const GRADE_HI = 185;
export const GRADE_MIN = 0.2;

/** The still plate covers frame 0 only: `shownTime * FPS < 0.5`. */
export const PLATE_CUT = 0.5;

/** A seek younger than this is left alone; older than this it is re-kicked. */
export const SEEK_STALL = 140;

/** Seconds of contiguous buffer required before the scrub is allowed to start. */
export const SPAN_MIN = 4;

/** Story-beat Z travel, in px, for the default (non-hero, non-kit) branch. */
export const Z_FAR = -150;
export const Z_NEAR = 560;

/** Wide-band hero wipe window, in film seconds. */
export const WIPE_AT = 0;
export const WIPE_OUT = 6.0;

/** `--cineEdge` reaches this at full hero visibility. */
export const HERO_EDGE = 1;

/** Narrow-band hero Z push. */
export const HERO_Z = 300;

/** Wide-band kit-line slide window, in film seconds. */
export const KIT_SET = 30.2;
export const KIT_OUT = 35.3;

/** Film-space bleed subtracted from the reveal edge so it never hairlines. */
export const REV_PAD = 3;

/** Debounce before the runway collapses and the film locks. */
export const SETTLE_MS = 220;

/**
 * Viewport-height guard. `measure()` only refreshes the cached viewport height
 * when the width changes or the height moves more than this. Together with the
 * head-level resize `stopImmediatePropagation` shim this is the mobile
 * URL-bar suppression — without it the film re-measures every time the address
 * bar collapses, and the whole timeline jumps.
 */
export const VP_H_SLOP = 140;

/** Default film sources, per band. Same files the legacy page ships. */
export const DEFAULT_SOURCES = {
  src: '/assets/video/topcat-intro-1920.mp4?v=6',
  poster: '/assets/video/topcat-intro-poster.webp?v=5',
  srcNarrow: '/assets/video/topcat-intro-864.mp4?v=7',
  posterNarrow: '/assets/video/topcat-intro-864-poster.webp?v=5',
  srcPhone: '/assets/video/topcat-intro-608.mp4?v=7',
  posterPhone: '/assets/video/topcat-intro-608-poster.webp?v=5',
} as const;

/** Default frame-0 still plates, per band. */
export const DEFAULT_PLATES = {
  src: '/assets/video/plates/plate-f0.webp?v=3',
  srcNarrow: '/assets/video/plates/tablet/plate-f0.webp?v=3',
  srcPhone: '/assets/video/plates/plate-f0-phone.webp?v=3',
} as const;

/** Intrinsic film width per band — the fallback when `videoWidth` is 0. */
export const FILM_W = { wide: 1920, tablet: 864, phone: 608 } as const;
export const FILM_H = 1080;
