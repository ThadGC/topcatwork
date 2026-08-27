/**
 * HERO FILM — the story timeline.
 *
 * In the legacy page these lived as `data-at` / `data-out` attributes (plus
 * `-narrow` and `-phone` overrides) on the three `.cine-line` paragraphs, and
 * `retimeStory()` read them back out of the DOM on every band change. Here
 * they are typed data and the DOM never holds them.
 *
 * The timings are per-band because the films are different edits, not two
 * encodes of one edit. A beat that lands on a cut at 10.3s in the 1920 cut
 * lands on a different shot in the 608 cut.
 *
 * THERE ARE TWO FILMS, NOT THREE, SINCE 27 AUG. The tablet plays the 1920 cut
 * — the client asked for the highest-quality version on tablet rather than an
 * upscaled portrait crop — so for anything keyed to the FOOTAGE it reads as
 * wide. See `filmBand` below.
 */

/** The three viewport bands. Both `narrow` and `phone` MQs match on a phone. */
export interface Band {
  /** `(min-width:1121px)` */
  wide: boolean;
  /** `(max-width:1120px)` */
  narrow: boolean;
  /** `(max-width:720px)` */
  phone: boolean;
  /** narrow AND NOT phone — 721..1120px */
  tablet: boolean;
  /** the hero-copy mode: 'wide' | 'nr' | 'off' */
  mode: 'wide' | 'nr' | 'off';
}

/**
 * `band(d, k)` — site.js 2853.
 *
 * `(phone && phoneValue) || (narrow && narrowValue) || baseValue`.
 *
 * Two quirks are load-bearing and are reproduced exactly:
 *  - a *missing* `-phone` override falls through to the `-narrow` value,
 *    because both media queries match on a phone. Beat 2 relies on this: it
 *    has no phone timing and deliberately inherits the tablet one.
 *  - the `||` chain means a value of 0 falls through too. No beat uses 0, but
 *    changing the operator would change behaviour if one ever did.
 */
export function pickBand<T>(
  band: Band,
  base: T,
  narrow?: T,
  phone?: T,
): T {
  if (band.phone && phone) return phone;
  if (band.narrow && narrow) return narrow;
  return base;
}

/** Where a beat sits when the wide-band film-space layout is not in use. */
export type VPos = 'top' | 'low';
/** Which wide-band film-space slot a beat occupies. */
export type VPosWide = 'hero' | 'high';

export interface StoryBeat {
  id: 'open' | 'reveal' | 'kit';
  /** Lead text. `emphasis` is the gold-gradient run that closes the line. */
  text: string;
  emphasis?: string;
  /** The smaller line under it, if any. */
  sub?: string;

  at: number;
  out: number;
  atNarrow?: number;
  outNarrow?: number;
  atPhone?: number;
  outPhone?: number;

  vpos?: VPos;
  vposWide?: VPosWide;
  vposNarrow?: VPos;
}

/**
 * The three beats, copy and timings verbatim from index.html 3634-3639.
 *
 * Beat 1 is the clip-path reveal line; beat 2 is the slide-in "kit" line.
 * They are identified positionally in the legacy module
 * (`[data-vpos-wide="hero"]` / `[data-vpos-wide="high"]`); here the `id`
 * carries it, which is why the wide-band slot can stay purely presentational.
 */
export const STORY: readonly StoryBeat[] = [
  {
    id: 'open',
    text: 'It starts as a mountain.',
    at: 1.0,
    out: 6.0,
    vpos: 'top',
  },
  {
    id: 'reveal',
    text: 'The slab you choose is ',
    emphasis: 'unique.',
    sub: 'Measured, cut and finished for your home, and built to last for decades.',
    at: 10.3,
    out: 24.5,
    atNarrow: 13.0,
    outNarrow: 24.5,
    atPhone: 14.5,
    outPhone: 24.0,
    vpos: 'low',
    vposWide: 'hero',
    vposNarrow: 'top',
  },
  {
    id: 'kit',
    text: 'The stone sets the tone of ',
    emphasis: 'the room.',
    sub: 'Once you choose your stone, the rest follows.',
    at: 27.0,
    out: 38.5,
    // No phone override: the phone inherits these through the narrow MQ.
    atNarrow: 28.5,
    outNarrow: 37.5,
    vpos: 'low',
    vposWide: 'high',
    vposNarrow: 'top',
  },
];

/** A beat's window resolved for the current band. */
export interface BeatWindow {
  at: number;
  out: number;
  /**
   * Z the beat rushes to. Wide band overrides it per slot so the two
   * film-space lines stay behind the plane the opening beat flies through.
   */
  zNear: number;
}

/**
 * The band whose FILM this viewport plays.
 *
 * The tablet plays the wide cut, so everything keyed to the footage — the
 * encode, the plate, `FILM_W`, the reveal table and the beat timings below —
 * must read the tablet as wide, or a beat lands on a shot that is nowhere
 * near it. Everything keyed to LAYOUT (`vposNarrow`, the CSS bands, `mode`,
 * `zNear`) still reads it as narrow, because the tablet's page layout has not
 * changed at all. Keeping the two apart is the whole job of this function.
 */
export function filmBand(band: Band): Band {
  return band.tablet ? { ...band, narrow: false } : band;
}

/** `retimeStory()` — site.js 3160-3169. */
export function beatWindow(beat: StoryBeat, band: Band): BeatWindow {
  /* Timings off the FILM band, `zNear` off the layout band — see filmBand. */
  const f = filmBand(band);
  const at = Number(pickBand(f, beat.at, beat.atNarrow, beat.atPhone)) || 0;
  const out = Number(pickBand(f, beat.out, beat.outNarrow, beat.outPhone)) || 0;
  const zNear =
    !band.narrow && beat.vposWide ? (beat.vposWide === 'high' ? 150 : 300) : 560;
  return { at, out, zNear };
}

/** The `.cine-hero` headline block. Not a `.cine-line`; it has its own path. */
export const HERO_COPY = {
  headline: 'Your worktop ',
  emphasis: 'starts here.',
  sub: 'Follow the slab from the finest mountains of Europe and Asia, out of the quarry and into your kitchen.',
  cue: 'Scroll to begin',
} as const;
