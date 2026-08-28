/**
 * HERO FILM — the story timeline.
 *
 * Copy and timings are the ones the client signed off. They are transcribed
 * from ~/Documents/TOPCAT-FILM-SPEC/FILM-SPEC.md §1 and §2, which was written
 * from the previous build before it was deleted. Do not round a value and do
 * not merge two nearly-equal values: each beat was tuned against a specific
 * shot, and a beat that lands on a cut at 10.3s in the wide cut lands on a
 * different shot in the phone cut.
 */

/** The three viewport bands. */
export interface Band {
  /** `(min-width: 1121px)` */
  wide: boolean;
  /** 721..1120px */
  tablet: boolean;
  /** `(max-width: 720px)` */
  phone: boolean;
}

export type BeatId = 'open' | 'reveal' | 'kit';

export interface StoryBeat {
  id: BeatId;
  /**
   * ⚠️ BEAT 1 IS NEVER SEEN. It was `display:none` in every band of the
   * previous build, in the vanilla original before it, and it is not rendered
   * here either. It is kept as data because it is part of the film's authored
   * structure and because its window is the only record of what the opening
   * six seconds are for.
   */
  hidden?: boolean;

  /** Lead text. `emphasis` is the gold-gradient run that closes the line. */
  text: string;
  emphasis?: string;
  /** The smaller line under it. */
  sub?: string;

  /** Film seconds. The phone falls back to the tablet's values when it has none. */
  at: number;
  out: number;
  atTablet?: number;
  outTablet?: number;
  atPhone?: number;
  outPhone?: number;
}

export const STORY: readonly StoryBeat[] = [
  {
    id: 'open',
    hidden: true,
    text: 'It starts as a mountain.',
    at: 1.0,
    out: 6.0,
  },
  {
    id: 'reveal',
    text: 'The slab you choose is ',
    emphasis: 'unique.',
    sub: 'Measured, cut and finished for your home, and built to last for decades.',
    at: 10.3,
    out: 24.5,
    atTablet: 13.0,
    outTablet: 24.5,
    atPhone: 14.5,
    outPhone: 24.0,
  },
  {
    id: 'kit',
    text: 'The stone sets the tone of ',
    emphasis: 'the room.',
    sub: 'Once you choose your stone, the rest follows.',
    at: 27.0,
    out: 38.5,
    /*
      NO PHONE OVERRIDE, AND THAT IS DELIBERATE. In the original the lookup was
      `(phone && phoneValue) || (narrow && narrowValue) || base` and both media
      queries matched on a phone, so a missing phone value fell through to the
      tablet's. The phone plays this beat at 28.5 -> 37.5. `beatWindow` below
      reproduces the fall-through explicitly rather than leaving it to a
      coincidence of two media queries.
    */
    atTablet: 28.5,
    outTablet: 37.5,
  },
];

/** The hero block. Not a beat; it has its own path in and out. */
export const HERO_COPY = {
  headline: 'Your worktop ',
  emphasis: 'starts here.',
  sub: 'Follow the slab from the finest mountains of Europe and Asia, out of the quarry and into your kitchen.',
  cue: 'Scroll to begin',
} as const;

/** A beat's window, resolved for a band. */
export interface BeatWindow {
  at: number;
  out: number;
}

/**
 * The phone and the tablet share a cut ONLY in the sense that the tablet plays
 * the wide film. Timings are per band; see the fall-through note on `kit`.
 */
export function beatWindow(beat: StoryBeat, band: Band): BeatWindow {
  if (band.phone) {
    return {
      at: beat.atPhone ?? beat.atTablet ?? beat.at,
      out: beat.outPhone ?? beat.outTablet ?? beat.out,
    };
  }
  if (band.tablet) {
    return { at: beat.atTablet ?? beat.at, out: beat.outTablet ?? beat.out };
  }
  return { at: beat.at, out: beat.out };
}

/** Read the band off a viewport width. */
export function bandFor(width: number): Band {
  return {
    phone: width <= 720,
    tablet: width > 720 && width <= 1120,
    wide: width > 1120,
  };
}

/**
 * The band whose FILM this viewport plays.
 *
 * 721px and up play the wide cut. The client, 27 Aug: "make sure you have the
 * highest quality version showing on tablet." There is no tablet cut — the one
 * that existed was a crop of the mobile master that ran past the picture's
 * right edge and baked a black column down every tablet frame.
 *
 * Everything keyed to the FOOTAGE (the encode, the plate, the beat timings)
 * reads the tablet as wide. Everything keyed to LAYOUT reads it as a tablet.
 * Keeping those two apart is this function's whole job.
 */
export function filmBand(band: Band): Band {
  return band.tablet ? { wide: true, tablet: false, phone: false } : band;
}

/** The film's nominal duration. Replaced by `video.duration` once it is real. */
export const DUR = 44.25;

/**
 * WHERE THE PAGE'S OWN HERO IS RELEASED, as film progress. It was a bare 0.93
 * in useFilm's tick; it is named here because a second thing is now timed
 * against it — the keep-scrolling cue is solved to reach zero AT this point,
 * not after it. Move one and you move both, which is the intent.
 */
export const HERO_INK = 0.93;
