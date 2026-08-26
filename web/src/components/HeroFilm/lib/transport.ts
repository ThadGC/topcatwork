/**
 * HERO FILM — the transport controller.  ** FIX #2 **
 *
 * ── what the legacy module did ──────────────────────────────────────────────
 * It scrubbed the film by assigning `video.currentTime` once per animation
 * frame. Every one of those assignments is a decoder seek. Measured on the
 * shipping asset: mean 22ms, p90 38ms. At 60 animation frames a second the
 * decoder simply cannot keep up, so the film delivered ~45fps, and — worse —
 * delivered it irregularly, because a seek that lands in 12ms and a seek that
 * lands in 38ms produce visibly different frame spacing. That irregularity is
 * what reads as judder. It is not a frame-rate problem, it is a jitter problem.
 *
 * ── what this does instead ──────────────────────────────────────────────────
 * Run the film FORWARD — `play()` — and modulate `playbackRate` to chase the
 * scroll. Forward decode is the path every hardware decoder is built for; no
 * seek, no keyframe hunt, no pipeline flush.
 *
 *     rate = clamp(scrollVel + Kp · (want − currentTime), 0, 8)
 *
 * The feed-forward term `scrollVel` is not optional. A plain proportional
 * chase is a first-order lag: to hold a steady rate of R the error has to
 * settle at R/Kp, so at a realistic scroll speed the film sits a fixed
 * distance behind — measured at ~1.8s of standing lag, which is a beat and a
 * half. Feeding the scroll's own velocity forward makes the steady-state error
 * zero; `Kp` then only has to correct the residue.
 *
 * A seek is still the right answer in exactly two cases, and this controller
 * falls back to one:
 *
 *   - the user scrolled BACK. Video cannot play backwards; nothing else works.
 *   - the film is more than `jumpAhead` (2.2s) behind. Closing that at 8x
 *     would take 300ms of visibly fast-forwarded footage; one seek is both
 *     quicker and less obtrusive.
 *
 * The fallback keeps the legacy protections: frame-level dedupe, the 140ms
 * `SEEK_STALL` window, and the `decoderKick` recovery for a seek that hangs.
 *
 * ── why this is a pure function ─────────────────────────────────────────────
 * Everything above is policy, and policy is what breaks silently. Reading a
 * media element's state and deciding what to do about it are separated so the
 * deciding half can be tested without a decoder: see ./transport.test.ts.
 */

import { FPS, SEEK_STALL } from './constants';

/** `HTMLMediaElement.HAVE_CURRENT_DATA` — the frame at `currentTime` exists. */
export const HAVE_CURRENT_DATA = 2;

export interface TransportConfig {
  /** Seek quantisation grid. Seeks land mid-frame on a 1/`fps` lattice. */
  fps: number;
  /** Proportional gain on the time error. */
  kp: number;
  /** Hard ceiling on `playbackRate`. Above ~8x decode falls apart anyway. */
  rateMax: number;
  /**
   * Floor on `playbackRate`. Demand below this is treated as zero and the
   * element is paused instead — asking a decoder for 0.01x is worse than
   * asking it for nothing, and `playbackRate = 0` is not a defined pause.
   */
  rateMin: number;
  /** Behind by more than this (seconds) and a seek beats a fast-forward. */
  jumpAhead: number;
  /**
   * Ahead by more than this (seconds) counts as "the user scrolled back".
   *
   * It is NOT zero, and that is deliberate. Playing forward always overshoots
   * slightly — up to `rateMax x` one animation frame, ~133ms — and a zero
   * tolerance would turn every one of those overshoots into a seek, which is
   * precisely the behaviour this controller exists to remove. Below the
   * tolerance the element is simply paused and the scroll is allowed to catch
   * up to it.
   */
  backTol: number;
  /** A seek younger than this is left to land; older than this, kick it. */
  seekStall: number;
}

export const DEFAULT_TRANSPORT: TransportConfig = {
  fps: FPS,
  kp: 1.6,
  rateMax: 8,
  rateMin: 0.0625,
  jumpAhead: 2.2,
  backTol: 0.25,
  seekStall: SEEK_STALL,
};

/** Everything the controller is allowed to know. No DOM here. */
export interface TransportInput {
  /** Film time the composition wants, in seconds. */
  want: number;
  /** d(want)/dt in film-seconds per wall-second — the feed-forward term. */
  wantVel: number;
  /** The element's real `currentTime`. */
  currentTime: number;
  /** The element's `duration`. Non-finite means metadata has not landed. */
  duration: number;
  /** The element's `readyState`. */
  readyState: number;
  /** The element's `paused`. */
  paused: boolean;
  /** The element's `seeking`. */
  seeking: boolean;
  /** The element's `ended`. */
  ended: boolean;
  /** `performance.now()`. */
  now: number;
  /** When the last seek was issued, on the same clock as `now`. */
  lastSeekAt: number;
  /** Frame index of the last issued seek, or -1 if none. */
  lastSeekFrame: number;
}

export type TransportCommand =
  /** Do nothing this frame. */
  | { kind: 'idle' }
  /** Stop the decoder; the film is where it should be (or ahead of it). */
  | { kind: 'pause' }
  /** Set `playbackRate`, and `play()` first if `play` is true. */
  | { kind: 'rate'; rate: number; play: boolean }
  /** Assign `currentTime`. `frame` is what the caller records for the dedupe. */
  | { kind: 'seek'; time: number; frame: number }
  /** A seek has hung past `seekStall`; run the play/pause decoder kick. */
  | { kind: 'kick' };

/**
 * Index of the last addressable frame.
 *
 * `round(duration·fps) − 1`, floored at 0. Seeking to or past `duration` puts
 * the element in its ended state, from which `play()` restarts at zero — so
 * the film must never be asked for a time at or beyond it.
 */
export function lastFrameIndex(duration: number, fps: number = FPS): number {
  const d = Number.isFinite(duration) && duration > 0 ? duration : 0;
  return Math.max(0, Math.round(d * fps) - 1);
}

/** Quantise a film time onto the seek lattice, clamped to `[0, last]`. */
export function frameFor(t: number, fps: number, last: number): number {
  const f = Math.floor(t * fps);
  if (!(f > 0)) return 0; // also catches NaN
  return f > last ? last : f;
}

/**
 * Mid-frame time for a frame index.
 *
 * The `+0.5` is the legacy module's, and it is right: land on the boundary and
 * floating point decides which of two frames you get.
 */
export function frameTime(frame: number, fps: number): number {
  return (frame + 0.5) / fps;
}

/**
 * The chase law. Returns 0 to mean "pause" rather than a rate below `rateMin`.
 */
export function chaseRate(
  err: number,
  wantVel: number,
  cfg: TransportConfig = DEFAULT_TRANSPORT,
): number {
  const r = wantVel + cfg.kp * err;
  if (!(r >= cfg.rateMin)) return 0;
  return r > cfg.rateMax ? cfg.rateMax : r;
}

/**
 * Decide what to do with the media element this animation frame.
 *
 * Ordering is the whole contract, so it is spelled out:
 *
 *   1. no usable frame yet            -> idle
 *   2. a seek is in flight            -> idle inside the stall window, kick past it
 *   3. scrolled back, or far behind   -> seek (deduped by frame)
 *   4. at the end of the media        -> idle. NEVER play(); on an ended
 *                                        element that rewinds to zero.
 *   5. otherwise                      -> forward-play at the chased rate,
 *                                        or pause if the demand is ~zero.
 */
export function decideTransport(
  s: TransportInput,
  cfg: TransportConfig = DEFAULT_TRANSPORT,
): TransportCommand {
  // 1. Nothing decoded yet, or no duration to clamp against.
  if (s.readyState < HAVE_CURRENT_DATA) return { kind: 'idle' };
  if (!Number.isFinite(s.duration) || s.duration <= 0) return { kind: 'idle' };

  const last = lastFrameIndex(s.duration, cfg.fps);
  const err = s.want - s.currentTime;

  // 2. A seek is already in flight. Let it land; only intervene if it hangs.
  if (s.seeking) {
    return s.now - s.lastSeekAt < cfg.seekStall ? { kind: 'idle' } : { kind: 'kick' };
  }

  // 3. The two cases forward play cannot serve.
  const scrolledBack = -err > cfg.backTol;
  const farBehind = err > cfg.jumpAhead;
  if (scrolledBack || farBehind) {
    const frame = frameFor(s.want, cfg.fps, last);
    // Frame-level dedupe: the scroll moves in sub-frame increments and would
    // otherwise re-issue the same seek every animation frame, which is exactly
    // how the legacy module starved the decoder.
    if (frame === s.lastSeekFrame) return { kind: 'idle' };
    return { kind: 'seek', time: frameTime(frame, cfg.fps), frame };
  }

  // 4. Parked at the end of the media. Only a seek moves it from here, and
  //    step 3 already decided no seek is warranted.
  if (s.ended) return { kind: 'idle' };

  // 5. Forward play.
  const rate = chaseRate(err, s.wantVel, cfg);
  if (rate === 0) {
    return s.paused ? { kind: 'idle' } : { kind: 'pause' };
  }
  return { kind: 'rate', rate, play: s.paused };
}
