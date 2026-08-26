/**
 * HERO FILM — the disciplined-seek scrub policy.  ** THE DEFAULT TRANSPORT **
 *
 * Ported from VDM Digital's shipping scroll-scrub engine
 * (`app/src/components/scroll-scrub/scroll-scrub.tsx`, `updateVideos()`), which
 * is fifteen lines long and does not judder. The whole of it:
 *
 *     if (!video || !segment.ready || video.seeking) continue;
 *     segment.current += (segment.target - segment.current) * 0.2;
 *     const targetTime = clamp(segment.current, 0, 0.999) * video.duration;
 *     const epsilon = isMobile() ? 0.02 : 0.008;
 *     if (Math.abs(video.currentTime - targetTime) > epsilon) {
 *       video.currentTime = targetTime;
 *     }
 *
 * Three separate disciplines are hiding in that, and all three matter:
 *
 * ── 1. SEEK COALESCING ──────────────────────────────────────────────────────
 * `if (video.seeking) continue` — one seek in flight, full stop. No queue, no
 * pending flag, no re-fire on `seeked`. This is the piece Topcat was missing.
 * The old module held a `pending` seek and re-issued it from the `seeked`
 * handler, so a fast scroll built a BACKLOG: every seek that landed
 * immediately triggered the next one, and the decoder never got a frame's
 * worth of idle time to present anything. Dropping the queue means the film
 * asks for wherever the scroll is NOW when the decoder is next free, which is
 * both fresher and cheaper. Frames then arrive at the decoder's own rhythm
 * instead of a rhythm the scroll imposed on it — and it is the irregularity,
 * not the rate, that the eye reads as judder.
 *
 * ── 2. THE EPSILON DEADBAND ─────────────────────────────────────────────────
 * Assign `currentTime` only when the element is more than `epsilon` away from
 * where it should be. Topcat used to seek on every changed 1/60th frame index,
 * which is a seek per animation frame during any scroll at all.
 *
 * The reference's 8ms / 20ms are NOT copied. They are VDM's clips' numbers,
 * and a deadband is only meaningful in units of the source's frame duration:
 * the seek is worth issuing exactly when it would present a DIFFERENT picture.
 * Topcat's masters are 24fps, so one frame is 41.7ms and 8ms addresses five
 * distinct positions inside the frame already on screen — five decodes, one
 * picture. See SRC_FRAME below for what replaced them.
 *
 * ── 3. THE TARGET LERP ──────────────────────────────────────────────────────
 * Chase the scroll's demand geometrically — 20% of the remaining gap per
 * animation frame — and seek toward the CHASED value, not the raw one. Scroll
 * deltas are spiky (wheel notches, momentum, trackpad flicks); feeding those
 * straight to a decoder asks it to change direction several times a second.
 *
 * Note the lerp is INSIDE the seeking guard, exactly as the reference has it:
 * while a seek is in flight the chase does not advance either. Let it advance
 * and it runs ahead of a decoder that is already behind, so the seek that
 * eventually issues is aimed at a stale place and immediately needs another.
 *
 * ── why this is a pure function ─────────────────────────────────────────────
 * Same reason as ./transport.ts: reading a media element's state and deciding
 * what to do about it are separated so the deciding half can be tested without
 * a decoder. See ./scrub.test.ts.
 */

import { FPS } from './constants';
import { HAVE_CURRENT_DATA } from './transport';

export { HAVE_CURRENT_DATA };

/**
 * One source frame, in seconds — 1/24 = 41.7ms.
 *
 * Every deadband below is a fraction of this and nothing else. Hardcode a
 * millisecond figure here again and it silently stops meaning anything the
 * moment the film is re-cut at another rate.
 */
export const SRC_FRAME = 1 / FPS;

export interface ScrubConfig {
  /** Fraction of the remaining gap closed per animation frame. */
  lerp: number;
  /** Deadband on a pointer-and-hover device, in seconds. */
  epsilonDesktop: number;
  /** Deadband on a coarse-pointer / small-viewport device, in seconds. */
  epsilonMobile: number;
  /**
   * Fraction of `duration` the scrub is allowed to address.
   *
   * Seeking to or past `duration` puts the element into its ended state, so
   * the scrub has to stop short — but not so short that it stops short of the
   * closing beauty frame, which is the film's payoff.
   *
   * This moved with FPS. It used to be 0.999, chosen when the source was
   * believed to be 12fps: 0.999 x 44.25 = 44.2058 stops 44ms short, and an
   * 83ms last frame starting at 44.1667 swallows that comfortably. The real
   * source is 24fps, whose last frame starts at 44.2083 — so 0.999 landed one
   * frame EARLY and the scrub could no longer reach the closing frame at all;
   * it only ever appeared on the `snap()` at lock. 0.9995 x 44.25 = 44.2279
   * is inside the last frame (index 1061 of 1062) and still 22ms clear of the
   * ended state, which is more headroom than `snap()` itself used to take.
   *
   * It is also what keeps `epsilonMobile` affordable — see below.
   */
  ceiling: number;
}

/**
 * ── how the two deadbands are picked ────────────────────────────────────────
 *
 * Both are fractions of SRC_FRAME and nothing else. What they are NOT is a
 * proof that a held frame is the frame on screen — the tempting version of
 * that argument is wrong, and it is worth writing down why so nobody tightens
 * these numbers believing it.
 *
 * The tempting version is symmetric: `currentTime` sits on a frame, so any
 * target within +/- half a frame of it is inside that same frame. That needs
 * `currentTime` to be the frame's MIDPOINT, and it never is. After the scrub's
 * own seek it is either the arbitrary time we asked for (Chrome hands the seek
 * target straight back) or the frame's START, k/24 (Firefox and Safari snap to
 * the PTS). Frame k occupies [k/24, (k+1)/24), so against a frame start a
 * band of +/- 1/48 covers [k/24 - 1/48, k/24 + 1/48): the forward half is
 * inside frame k, but the whole backward half belongs to frame k-1 — a
 * genuinely different picture the deadband declines to fetch.
 *
 * So the honest worst case is: one source frame stale, on either device. Not
 * zero. That is affordable, and it is not a regression — the 8ms desktop value
 * this replaced had the SAME one-frame backward worst case, inside a window
 * five times narrower, and bought that narrowness with five decodes per
 * presented picture. It is also transient: the deadband only holds while
 * `want` has stopped moving. Any continued scroll advances the chase past the
 * band on the next animation frame or two, so the staleness cannot persist
 * through a scroll — only through a pause, where there is nothing to compare
 * it against.
 *
 * DESKTOP — half a source frame. The floor is a cost argument, not a proof.
 * From a frame-start `currentTime` every forward target the band swallows is
 * inside the frame on screen, so tightening below half buys extra decodes for
 * pictures already presented; and it does not make the film any fresher,
 * because the backward exposure stays one frame however narrow the band gets.
 * A narrower stale window, never a shallower one.
 *
 * MOBILE — a whole source frame. The same trade one step out: at a full frame
 * the exposure is still one frame in either direction, and mobile decoders are
 * slower to settle, so corrections that fine are cost with no picture on the
 * other end. Past a full frame it would be two, which is why SRC_FRAME is also
 * the cap — ./scrub.test.ts pins both ends.
 *
 * ── the ceiling interaction, which is not obvious and bites at the end ──────
 * useHeroFilm.ts keeps its rAF loop alive while `|want - currentTime|` exceeds
 * `1 / SRCFPS` (83.3ms). At film progress 1, `want` is `dur` but the scrub can
 * only address `ceiling * dur`, and the deadband lets `currentTime` rest up to
 * one epsilon short of even that. So the loop parks at the end of the film
 * only if
 *
 *     (1 - ceiling) * dur + epsilonMobile  <  1 / SRCFPS
 *
 * At the old ceiling of 0.999 that is 44.25 + 41.7 = 85.9ms against an 83.3ms
 * limit — a whole-frame mobile deadband would have left the loop spinning
 * after the last scroll. At 0.9995 it is 22.1 + 41.7 = 63.8ms, with 19.5ms to
 * spare. The two numbers are a pair; ./scrub.test.ts asserts the inequality so
 * neither can be moved alone.
 */
export const DEFAULT_SCRUB: ScrubConfig = {
  lerp: 0.2,
  epsilonDesktop: SRC_FRAME / 2,
  epsilonMobile: SRC_FRAME,
  ceiling: 0.9995,
};

/** Everything the policy is allowed to know. No DOM here. */
export interface ScrubInput {
  /** Film time the composition wants, in seconds. */
  want: number;
  /**
   * The lerped film time carried between animation frames, in seconds.
   * Non-finite means "no chase yet" and snaps the chase onto `want`.
   */
  current: number;
  /** The element's real `currentTime`. */
  currentTime: number;
  /** The element's `duration`. Non-finite means metadata has not landed. */
  duration: number;
  /** The element's `readyState`. */
  readyState: number;
  /** The element's `seeking`. */
  seeking: boolean;
  /** Coarse pointer or small viewport — picks the deadband. */
  mobile: boolean;
}

export type ScrubCommand =
  /** Do nothing, and do not advance the chase either. */
  | { kind: 'idle' }
  /** The chase advanced but the element is already inside the deadband. */
  | { kind: 'hold'; current: number }
  /** Assign `currentTime`; `current` is the chase value to carry forward. */
  | { kind: 'seek'; time: number; current: number };

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

/** One step of the chase. Exported because the lerp is worth testing alone. */
export function lerpToward(current: number, target: number, k: number): number {
  if (!Number.isFinite(current)) return target;
  return current + (target - current) * k;
}

/** The deadband for this device, in seconds. */
export function scrubEpsilon(
  mobile: boolean,
  cfg: ScrubConfig = DEFAULT_SCRUB,
): number {
  return mobile ? cfg.epsilonMobile : cfg.epsilonDesktop;
}

/**
 * Decide what to do with the media element this animation frame.
 *
 * Ordering is the contract:
 *
 *   1. no decoded frame, or no duration     -> idle
 *   2. a seek is already in flight          -> idle, AND the chase is frozen
 *   3. advance the chase toward `want`
 *   4. inside the deadband                  -> hold (carry the chase, no seek)
 *   5. otherwise                            -> one seek, toward the chased time
 */
export function decideScrub(
  s: ScrubInput,
  cfg: ScrubConfig = DEFAULT_SCRUB,
): ScrubCommand {
  // 1. Nothing decoded yet, or no duration to clamp against.
  if (s.readyState < HAVE_CURRENT_DATA) return { kind: 'idle' };
  if (!Number.isFinite(s.duration) || s.duration <= 0) return { kind: 'idle' };

  // 2. SEEK COALESCING. One in flight at a time, full stop.
  if (s.seeking) return { kind: 'idle' };

  // 3. THE TARGET LERP.
  const current = lerpToward(s.current, s.want, cfg.lerp);

  // 4/5. THE EPSILON DEADBAND.
  const time = clamp(current, 0, cfg.ceiling * s.duration);
  if (Math.abs(s.currentTime - time) > scrubEpsilon(s.mobile, cfg)) {
    return { kind: 'seek', time, current };
  }
  return { kind: 'hold', current };
}
