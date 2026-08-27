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
 * returns exactly `608:1080:656:0`. Only the phone cut comes from it.
 *
 * ── THERE IS NO TABLET CUT ANY MORE (27 Aug) ────────────────────────────────
 * There used to be one, `crop=864:1080:680` of that master, which ran 280px
 * past the picture's right edge and baked a black column down the right third
 * of every tablet frame — the client's report of a film that painted only the
 * left 68%. Narrowing the crop to 584 removed the black but left the tablet
 * playing a 390x720 upscale of a PORTRAIT crop in a landscape window: sharp
 * nowhere and cropped everywhere. His answer, and it is the right one: "make
 * sure you have the highest quality version showing on tablet."
 *
 * So 721px and up all play `topcat-intro-1920.mp4`. One file, one plate, one
 * reveal table, one set of beat timings, and the tablet gets the full frame at
 * full resolution instead of a blown-up crop. `filmBand()` in ./timeline.ts is
 * what keeps that separate from the tablet's own LAYOUT, which has not changed.
 * The byte-range path in ./filmSource.ts means the larger file is not a larger
 * download — it fetches the GOPs it scrubs.
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
 * ⛔ REVERSED 27 Aug (v=6). These are now cut from the CLIENT'S OWN HIGH-RES
 * RENDERS of frame 0, not from the shipped encodes:
 *
 *   wide   `F1 FIXED SLAB.png`  2688x1513  ->  2688x1513 webp q78  343,850 B
 *   phone  `F1 SLAB mobile.png` 1080x1920  ->  1080x1920 webp q80  161,438 B
 *
 * The rule this replaces said to cut the plate from the exact clip "and never
 * from the master", so that the handover from plate to first frame could not
 * pop. That bought an invisible handover at the cost of a VISIBLE BLUR on
 * arrival, which is the wrong trade and the client reported it as such:
 * "There can be no blur on the image when the user loads in."
 *
 * The blur was not subtle and it was not the encode's fault. `.plate` is
 * `background-size:cover` on a box of `100vw + 2*--curveOut` by `100vh`, so a
 * 393pt phone at DPR 3 renders this picture at ~1438x2556 device px. The old
 * phone plate was 406x720 — a 3.5x upscale. It is now 1080x1920, a 1.33x one.
 * The wide plate was 1920x1080 against ~3198x1800 on a retina 1440; it is now
 * 2688x1513. Both were additionally carrying the video encode's own loss.
 *
 * Why the handover still does not pop: both stills were verified frame-exact
 * against the MASTERS before use (offset sweep, PSNR peak at dx=0 falling
 * ~5.5dB at +/-1px; grade within 2.4 luma), and `.plate` and `.vid` share
 * `cover` + centre, so the geometry is identical. What changes at handover is
 * sharpness only, and it happens on the first scroll — with the film already
 * in motion, which masks it. At rest, which is what the visitor actually
 * looks at, the picture is now sharp.
 *
 * The ceiling here is the source, not the encoder: 1080w is still 0.75x of
 * what a 393pt/DPR3 phone wants and 2688w is 0.84x of a retina 1440. Higher
 * would need a bigger render from the client, not a re-encode. AVIF was
 * measured and saves only ~10% at matched quality, which does not justify a
 * second format against the one-URL rule below.
 *
 * Still byte-identical to that band's poster — see the note there.
 *
 * Declared BEFORE `DEFAULT_SOURCES` because the posters below are these — see
 * the note there.
 */
export const DEFAULT_PLATES = {
  src: '/assets/video/plates/plate-f0.webp?v=6',
  srcPhone: '/assets/video/plates/plate-f0-phone.webp?v=6',
} as const;

export const DEFAULT_SOURCES = {
  src: '/assets/video/topcat-intro-1920.mp4?v=9',
  /*
    THE POSTER IS THE PLATE. Not "the same picture" — the same bytes:

      sha256 topcat-intro-1920-poster.webp == plates/plate-f0.webp
             36bcf321aa6e759ba247251c9b64ebac39fc0137808dae31c69f10acdaf0fa14
      sha256 topcat-intro-608-poster.webp  == plates/plate-f0-phone.webp
             db54b8fb798ee0c82b5ff86d8b38e695fa88e2d59346668e398c99c6cf672516

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
 * The wide one is exact; the phone is not, quite. `scale=-2:'min(720,ih)'`
 * rounds the derived width to an even number, and 608:1080 = 0.56296 rounds to
 * 406:720 = 0.56389 — 0.16% wide. That is well under a pixel of drift across
 * the reveal edge at any shipping viewport, so it is left alone; it is recorded
 * here so nobody reads "preserves the aspect" as exact and builds something on
 * top of it that needs exactness.
 *
 * NO `tablet` KEY. The tablet plays the wide cut, so it reads `wide` — see
 * `filmBand()` in ./timeline.ts. lib/reveal.ts still carries TREV_X/TREV_S,
 * the table measured against the retired 584 crop; nothing selects them any
 * more and nothing should without re-measuring them.
 */
export const FILM_W = { wide: 1920, phone: 608 } as const;
export const FILM_H = 1080;
