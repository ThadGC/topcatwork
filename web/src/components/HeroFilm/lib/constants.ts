/**
 * HERO FILM — constants.
 *
 * Every number here started as a verbatim copy out of the legacy cine module
 * (assets/site.js 2841-3473). This is a PORT, not a redesign: do not round a
 * value, do not merge two nearly-equal values, do not "tidy" a magic number.
 * The reveal tables in ./reveal.ts are keyed to these exact figures.
 *
 * ── the one thing that was NOT a port ───────────────────────────────────────
 * The legacy module carried `FPS = 60`, and every shipped mp4 was 60fps. The
 * masters are not: `TC video desktop final fix.mov` and `TC video mobile final
 * fix.mov` are both 24fps, 1062 frames, 44.25s. The 60fps clips were upsampled
 * — 2651 frames carrying 1062 frames of information — so the lattice was
 * addressing 2.5 positions inside every real frame. `FPS` below is now the
 * source rate, and the values derived from it (the scrub deadband in
 * ./scrub.ts, the end-of-film ceiling) moved with it. See each one for why.
 */

/**
 * The source frame rate, and therefore the seek lattice.
 *
 * Both masters are 24fps. Every seek that lands on a frame boundary is a coin
 * toss between two pictures, which is why ./transport.ts addresses
 * `(frame + 0.5) / FPS` — the midpoint of a frame. That trick only works when
 * the lattice IS the source's: at 60 against a 24fps source, `f = 2` resolves
 * to 2.5/60 = 1/24 exactly, i.e. the boundary the `+0.5` exists to avoid.
 *
 * It is also the seek BUDGET. At 60 the film asked for ~2.5 distinct times per
 * real frame and got the same picture back 1.5 times out of every 2.5 — decode
 * work with nothing on the other end of it.
 *
 * Consumers, and what each one does with it:
 *   - ./transport.ts   `lastFrameIndex` / `frameFor` / `frameTime`: the seek
 *                      lattice, used by the `?film=play` fallback and by
 *                      `useFilmScrub.snap()` (skip-to-end, lock-at-end).
 *   - ./scrub.ts       the epsilon deadband, derived as a fraction of 1/FPS.
 *   - ./outputs.ts     `plateOpacity`: `shownTime * FPS < PLATE_CUT`.
 *   - useHeroFilm.ts   the `FE` chase floor — where FPS cancels out of its own
 *                      expression and the value is unchanged either way.
 */
export const FPS = 24;

/**
 * The clip-path reveal grid, in ./reveal.ts. NOT the source frame rate.
 *
 * The reveal tables were measured on every SECOND source frame, so they are a
 * 12fps grid over a 24fps master, and `REV_F0` / `TREV_F0` / `PREV_F0` are
 * indices into that grid. The check is that they land on their beats: 124/12 =
 * 10.33s against a wide beat at 10.3, 157/12 = 13.08s against a tablet beat at
 * 13.0, 170/12 = 14.17s against a phone beat at 14.5. Read the same indices as
 * 24fps and the wide reveal would start at 5.2s, half a film early.
 *
 * It also sets the "is the picture still moving" slop in useHeroFilm.ts, where
 * two source frames of tolerance is load-bearing — see the comment there.
 */
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

/**
 * The still plate covers frame 0 only: `shownTime * FPS < 0.5`.
 *
 * Read as half a source frame, which at 24fps is 20.8ms. `shownTime` is the
 * PRESENTED `mediaTime`, so it takes the values 0, 1/24, 2/24 …; the only one
 * under half a frame is frame 0 itself. (At the old FPS = 60 the same
 * expression meant 8.3ms, which selected the same single frame — this moved
 * with the constant without changing which frames it covers.)
 */
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
 * All three cuts were re-encoded from the 24fps masters (scripts/
 * encode-film.sh) — every previous mp4 was 60fps, i.e. 2651 frames carrying
 * 1062 frames of information. Encoding at the source rate spends the same
 * <= GOP decodes per seek on 2.5x fewer frames, so the seek gets cheaper and
 * the file gets smaller at the same time:
 *
 *      1920   1920x1080   24.47 -> 23.08 MB   332 -> 133 keyframes   GOP 8
 *       864    576x720     6.78 ->  5.97 MB   221 -> 266 keyframes   GOP 12 -> 4
 *       608    406x720      6.28 ->  6.22 MB  221 -> 266 keyframes   GOP 12 -> 4
 *
 * Read the GOP column, not the keyframe count: the mobile bands went from a
 * keyframe every 12 frames to one every 4 — THREE TIMES the keyframe density
 * per frame of film, and therefore a third of the wasted decodes per seek —
 * while the raw count only rose from 221 to 266 because there are 2.5x fewer
 * frames to cover. Desktop keeps GOP 8 and simply carries 2.5x fewer frames.
 *
 * The two mobile files come from a DIFFERENT master to the desktop one: the
 * mobile master is framed and graded for the portrait crop. They are not two
 * bitrates of one cut and must never be re-derived from each other.
 *
 * THE MOBILE MASTER IS PILLARBOXED — that is what the "mean luma difference
 * 112/255 at t=0" recorded here used to be reading. It is a 1920x1080 file
 * carrying a portrait picture at x=656, 608 wide; `cropdetect` on frame 0
 * returns exactly `608:1080:656:0`. The tablet cut used to be `crop=864` from
 * x=680, which ran 280px past the picture's right edge at 1264 and baked a
 * black column down the right third of every tablet frame — the client's
 * 27 Aug report, reproduced at 1000x850 as a film that painted only the left
 * 68%. It is now `crop=584` from the same x=680, i.e. the picture and nothing
 * else, and the file is named for that width like the phone one is.
 *
 * ── the `?v=` stamp ─────────────────────────────────────────────────────────
 * The three clips are stamped `v=9` together. .htaccess holds .mp4 for a week,
 * so a visitor holding a `v=8` 60fps clip would scrub an upsampled film through
 * an engine on a 24fps lattice. One stamp for all three removes the question of
 * which files moved.
 *
 * The posters carry the PLATES' `v=5` instead, because they ARE the plates —
 * see the note on `poster` below.
 */
/**
 * Default frame-0 still plates, per band.
 *
 * Held over the film until the decoder paints a real frame, so each one is
 * extracted from the exact clip above and never from the master — otherwise
 * the handover from plate to first frame is a visible pop. All three were
 * re-cut from the 24fps encodes and are byte-identical to that band's poster,
 * which is the same frame by the same command; `v=5` retires the ones cut from
 * the 60fps clips (and, for the two mobile bands, from the un-scaled 1080
 * crops — those plates were 864x1080 and 608x1080 against 576x720 and 406x720
 * encodes).
 *
 * Declared BEFORE `DEFAULT_SOURCES` because the posters below are these — see
 * the note there.
 */
export const DEFAULT_PLATES = {
  src: '/assets/video/plates/plate-f0.webp?v=5',
  srcNarrow: '/assets/video/plates/tablet/plate-f0.webp?v=5',
  srcPhone: '/assets/video/plates/plate-f0-phone.webp?v=5',
} as const;

export const DEFAULT_SOURCES = {
  src: '/assets/video/topcat-intro-1920.mp4?v=9',
  /*
    THE POSTER IS THE PLATE. Not "the same picture" — the same bytes:

      sha256 topcat-intro-1920-poster.webp == plates/plate-f0.webp
             345566a78915aae5041dea524cc6e03651959cb31e787f47a449709d8202907d
      sha256 topcat-intro-584-poster.webp  == plates/tablet/plate-f0.webp
             (re-cut 27 Aug with the tablet crop; see the pillarbox note above)
      sha256 topcat-intro-608-poster.webp  == plates/plate-f0-phone.webp
             c544793a0d40cd2007da34504005335b9daecafd1f40441e1a789b768d070e89

    scripts/encode-film.sh makes them with `cp -f`, so they cannot
    drift. They used to be named as two different URLs, which is two cache
    keys, which is TWO DOWNLOADS of one picture: on the phone band the server
    log showed `topcat-intro-608-poster.webp?v=9` (41,906 B) arriving at 556ms
    and `plates/plate-f0-phone.webp?v=5` (41,906 B) at 553ms — 41,906 wasted
    bytes and an extra request in the three hundred milliseconds the film is
    trying to open its first byte-range.

    Naming the poster with the PLATE's URL is what collapses them. The plate is
    the one that has to be this URL (it is a CSS background on `.plate`, and it
    is what the visitor actually looks at while the decoder warms up), so the
    poster follows it rather than the other way round. Both files stay on disk;
    the `-poster` copies are simply no longer requested by the page.
  */
  poster: DEFAULT_PLATES.src,
  srcNarrow: '/assets/video/topcat-intro-584.mp4?v=9',
  posterNarrow: DEFAULT_PLATES.srcNarrow,
  srcPhone: '/assets/video/topcat-intro-608.mp4?v=9',
  posterPhone: DEFAULT_PLATES.srcPhone,
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
 * Neither mobile band holds it exactly. `scale=-2:'min(720,ih)'` rounds the
 * derived width to an even number: 584:1080 = 0.54074 rounds to 390:720 =
 * 0.54167 (0.17% wide) and 608:1080 = 0.56296 rounds to 406:720 = 0.56389
 * (0.16% wide). Both are well under a pixel of drift across the reveal edge at
 * any shipping viewport, so they are left alone; they are recorded here so
 * nobody reads "preserves the aspect" as exact and builds something on top of
 * it that needs exactness.
 *
 * THE TABLET NUMBER MOVED WITH THE CROP, 864 -> 584, AND HAD TO. The tablet
 * reveal table (lib/reveal.ts TREV_X/TREV_S) is expressed in film-space x off
 * the crop's LEFT edge, which is unchanged at master x=680 — so every measured
 * value still names the same edge in the footage. What changed is how wide the
 * frame carrying them is, and `revealFrame()` divides by exactly this constant
 * to get px-per-film-px. Leave it at 864 against a 584-wide crop and the whole
 * reveal lands 32% short.
 */
export const FILM_W = { wide: 1920, tablet: 584, phone: 608 } as const;
export const FILM_H = 1080;
