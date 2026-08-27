'use client';

/**
 * HERO FILM — the transport, bound to a real media element.
 *
 * All of the policy lives in lib/transport.ts as a pure function. This hook is
 * only the effectful half: read the element's state, ask the controller what
 * to do, do it, and remember what it did so the next decision has the dedupe
 * state it needs.
 *
 * It also owns the two pieces of decoder babysitting the legacy module needed
 * and this one still needs on the seek fallback path: the `decoderKick` (a
 * play/pause pair that unwedges a decoder sitting on a seek it never
 * completes) and the readiness gate.
 */

import { useCallback, useRef } from 'react';
import {
  DEFAULT_TRANSPORT,
  decideTransport,
  lastFrameIndex,
  frameFor,
  frameTime,
  type TransportConfig,
} from './lib/transport';
import { SPAN_MIN } from './lib/constants';

export interface FilmTransport {
  /**
   * Drive the element one animation frame.
   * @param want  film time the composition wants, in seconds
   * @param dur   duration to clamp against
   * @param dt    milliseconds since the previous call, for the velocity term
   */
  step(want: number, dur: number, dt: number): void;
  /** Seek straight to a film time, bypassing the chase. Used by skip and lock. */
  snap(time: number, dur: number): void;
  /** True once the element has a decoded frame and enough contiguous buffer. */
  ready(): boolean;
  /** Forget the chase state — on band change, source swap or remount. */
  reset(): void;
  /** Stop the decoder. */
  halt(): void;
}

/** Longest contiguous buffered range, in seconds. */
function bufferedSpan(video: HTMLVideoElement): number {
  try {
    const b = video.buffered;
    let m = 0;
    for (let i = 0; i < b.length; i++) m = Math.max(m, b.end(i) - b.start(i));
    return m;
  } catch {
    return 0;
  }
}

export function useFilmTransport(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  cfg: TransportConfig = DEFAULT_TRANSPORT,
): FilmTransport {
  const lastSeekAt = useRef(0);
  const lastSeekFrame = useRef(-1);
  const prevWant = useRef(Number.NaN);
  /** EMA of d(want)/dt. Smoothed because raw scroll deltas are spiky. */
  const wantVel = useRef(0);
  const appliedRate = useRef(-1);
  const kicked = useRef(false);
  const okOnce = useRef(false);

  const ready = useCallback(() => {
    if (okOnce.current) return true;
    const v = videoRef.current;
    if (!v) return false;
    // `filmReady()`, site.js: a decoded frame is not enough. Without a few
    // seconds of contiguous buffer the chase spends its whole life stalling,
    // which looks far worse than not starting.
    if (v.readyState >= 3 && bufferedSpan(v) >= SPAN_MIN) okOnce.current = true;
    return okOnce.current;
  }, [videoRef]);

  const reset = useCallback(() => {
    lastSeekAt.current = 0;
    lastSeekFrame.current = -1;
    prevWant.current = Number.NaN;
    wantVel.current = 0;
    appliedRate.current = -1;
    kicked.current = false;
    okOnce.current = false;
  }, []);

  const halt = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (!v.paused) v.pause();
    } catch {
      /* element detached */
    }
    appliedRate.current = -1;
  }, [videoRef]);

  /**
   * `decoderKick()` — site.js 3049-3056.
   *
   * A play()/pause() pair forces the pipeline to flush and re-present. It is
   * the only reliable way out of a seek that never fires `seeked`. Guarded by
   * `kicked` so a wedged decoder is not kicked once per frame.
   */
  const kick = useCallback(() => {
    const v = videoRef.current;
    if (!v || kicked.current) return;
    kicked.current = true;
    const done = () => {
      try {
        v.pause();
      } catch {
        /* ignore */
      }
      lastSeekFrame.current = -1;
      kicked.current = false;
    };
    try {
      const p = v.play();
      if (p && typeof p.then === 'function') {
        p.then(done, () => {
          kicked.current = false;
        });
      } else {
        done();
      }
    } catch {
      kicked.current = false;
    }
  }, [videoRef]);

  const snap = useCallback(
    (time: number, dur: number) => {
      const v = videoRef.current;
      if (!v) return;
      const last = lastFrameIndex(dur, cfg.fps);
      const f = frameFor(time, cfg.fps, last);
      lastSeekFrame.current = f;
      lastSeekAt.current = performance.now();
      try {
        if (!v.paused) v.pause();
        v.currentTime = frameTime(f, cfg.fps);
      } catch {
        /* not seekable yet */
      }
      appliedRate.current = -1;
      prevWant.current = time;
      wantVel.current = 0;
    },
    [videoRef, cfg.fps],
  );

  const step = useCallback(
    (want: number, dur: number, dt: number) => {
      const v = videoRef.current;
      if (!v) return;

      // Feed-forward term. This is what removes the standing lag a plain
      // proportional chase leaves behind; see the header of lib/transport.ts.
      const secs = Math.max(0.001, dt / 1000);
      if (Number.isFinite(prevWant.current)) {
        const raw = (want - prevWant.current) / secs;
        // Only the forward component feeds forward. A negative velocity would
        // subtract from the rate, and the rate cannot go below zero anyway —
        // scrolling back is the seek path's job, not the chase's.
        wantVel.current = wantVel.current * 0.65 + Math.max(0, raw) * 0.35;
      }
      prevWant.current = want;

      const cmd = decideTransport(
        {
          want,
          wantVel: wantVel.current,
          currentTime: v.currentTime,
          duration: Number.isFinite(v.duration) && v.duration > 1 ? v.duration : dur,
          readyState: v.readyState,
          paused: v.paused,
          seeking: v.seeking,
          ended: v.ended,
          now: performance.now(),
          lastSeekAt: lastSeekAt.current,
          lastSeekFrame: lastSeekFrame.current,
        },
        cfg,
      );

      switch (cmd.kind) {
        case 'idle':
          return;

        case 'pause':
          try {
            v.pause();
          } catch {
            /* ignore */
          }
          appliedRate.current = -1;
          return;

        case 'kick':
          kick();
          return;

        case 'seek':
          lastSeekFrame.current = cmd.frame;
          lastSeekAt.current = performance.now();
          try {
            if (!v.paused) v.pause();
            v.currentTime = cmd.time;
          } catch {
            /* not seekable yet */
          }
          appliedRate.current = -1;
          return;

        case 'rate': {
          // Quantise before comparing: playbackRate is a live decoder setting
          // and re-assigning it with a value that differs in the fourth
          // decimal is a real cost for no visible difference.
          const q = Math.round(cmd.rate * 100) / 100;
          if (q !== appliedRate.current) {
            appliedRate.current = q;
            try {
              v.playbackRate = q;
            } catch {
              /* rate out of the element's supported range */
            }
          }
          if (cmd.play) {
            try {
              const p = v.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
            } catch {
              /* autoplay blocked — muted playsinline should not be, but */
            }
          }
          // A seek is no longer outstanding once we are playing forward.
          lastSeekFrame.current = -1;
          return;
        }
      }
    },
    [videoRef, cfg, kick],
  );

  // Mutated in place, never replaced: the engine holds this object in effect
  // dependency arrays, and a fresh identity per render would tear the film
  // down and rebuild it on every parent re-render.
  const api = useRef<FilmTransport>({} as FilmTransport);
  api.current.step = step;
  api.current.snap = snap;
  api.current.ready = ready;
  api.current.reset = reset;
  api.current.halt = halt;
  return api.current;
}
