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

/**
 * Per-60fps-frame chase constant for the scroll easing.
 *
 * The VDM scroll-scrub reference smooths ONCE, at 0.2, between the scroll and
 * the decoder. Topcat smooths twice: here, and again in `DEFAULT_SCRUB.lerp`.
 * `eased` cannot simply be deleted -- `hold`, `armSettle()` and `lockFilm()`
 * are all expressed in its units, so removing it would redefine when the
 * runway collapses -- so instead it is opened up until it is near enough a
 * pass-through, which leaves the scrub lerp as the single effective smoother
 * and restores the reference's shape.
 *
 * At 0.15 the two stages in series put roughly 0.27s between the scroll and
 * the picture at a brisk scroll, against ~0.1s for VDM. At 0.45 this stage's
 * own time constant drops to about a third and the pair land near 0.12s.
 *
 * This is the knob if the film ever reads soft or, in the other direction,
 * twitchy. It never affects sync between the picture and the copy -- every
 * output composes from the film's actual presented time, not from this.
 */
export const EASE = 0.45;

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

/**
 * Default film sources, per band.
 *
 * The two mobile cuts were re-encoded to the scrub recipe (scripts/
 * encode-film.sh): height capped at 720 and GOP 4, down from a full 1080 at
 * GOP 12. The GOP is the whole point — it is the only number that decides how
 * many frames a decoder must chew through to present the one that was asked
 * for, and it roughly doubled the byte size (6.3 -> 11.8 MB) buying that.
 * The desktop cut already ships GOP 8 and is unchanged.
 *
 * ── the `?v=` stamp ─────────────────────────────────────────────────────────
 * All six are stamped `v=8` together. A visitor holding the OLD 608/864 cut at
 * `v=7` would scrub a 12-GOP film through an engine tuned for a 4-GOP one and
 * conclude, correctly, that nothing was fixed. One stamp for all six removes
 * the question of which files moved.
 */
export const DEFAULT_SOURCES = {
  src: '/assets/video/topcat-intro-1920.mp4?v=8',
  poster: '/assets/video/topcat-intro-poster.webp?v=8',
  srcNarrow: '/assets/video/topcat-intro-864.mp4?v=8',
  posterNarrow: '/assets/video/topcat-intro-864-poster.webp?v=8',
  srcPhone: '/assets/video/topcat-intro-608.mp4?v=8',
  posterPhone: '/assets/video/topcat-intro-608-poster.webp?v=8',
} as const;

/**
 * Default frame-0 still plates, per band.
 *
 * Held over the film until the decoder paints a real frame, so each one is
 * extracted from the exact clip above and never from the master — otherwise
 * the handover from plate to first frame is a visible pop. The two mobile
 * plates were re-extracted alongside the new encodes; `v=4` retires the ones
 * cut from the 1080 mobile clips.
 */
export const DEFAULT_PLATES = {
  src: '/assets/video/plates/plate-f0.webp?v=4',
  srcNarrow: '/assets/video/plates/tablet/plate-f0.webp?v=4',
  srcPhone: '/assets/video/plates/plate-f0-phone.webp?v=4',
} as const;

/**
 * Intrinsic film width per band — the fallback when `videoWidth` is 0, AND the
 * coordinate space the clip-path reveal tables in ./reveal.ts are expressed
 * in.
 *
 * These are NOT the encode resolutions and must not be updated to match them.
 * The mobile clips are now 406x720 and 576x720, but `revealFrame()` maps film
 * space through a cover fit computed from the ASPECT RATIO alone and then
 * divides by the nominal width here — so as long as an encode holds the
 * aspect, these numbers stay put and the reveal keeps landing on the same edge
 * in the footage.
 *
 * The tablet holds it exactly: 864:1080 and 576:720 are both 0.8. The phone
 * does not, quite. `scale=-2:'min(720,ih)'` rounds the derived width to an
 * even number, and 608:1080 = 0.56296 rounds to 406:720 = 0.56389 — 0.16%
 * wide. That is well under a pixel of drift across the reveal edge at any
 * shipping viewport, so it is left alone; it is recorded here so nobody reads
 * "preserves the aspect" as exact and builds something on top of it that
 * needs exactness.
 */
export const FILM_W = { wide: 1920, tablet: 864, phone: 608 } as const;
export const FILM_H = 1080;
