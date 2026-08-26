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
 * which is a seek per animation frame during any scroll at all. 8ms desktop,
 * 20ms mobile: mobile decoders are slower to settle and a tighter deadband
 * just burns them on corrections nobody can see.
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

import { HAVE_CURRENT_DATA } from './transport';

export { HAVE_CURRENT_DATA };

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
   * Seeking to or past `duration` puts the element into its ended state. On a
   * 44.25s film 0.999 stops 44ms short, which is still inside the last 12fps
   * source frame (83ms long), so the closing beauty frame is reachable.
   */
  ceiling: number;
}

export const DEFAULT_SCRUB: ScrubConfig = {
  lerp: 0.2,
  epsilonDesktop: 0.008,
  epsilonMobile: 0.02,
  ceiling: 0.999,
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
