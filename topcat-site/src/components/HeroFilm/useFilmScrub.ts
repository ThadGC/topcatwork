'use client';

/**
 * HERO FILM — the disciplined-seek scrub, bound to a real media element.
 *
 * All of the policy lives in lib/scrub.ts as a pure function. This hook is
 * only the effectful half: read the element's state, ask the policy what to
 * do, do it, and carry the chase value forward.
 *
 * It implements the same `FilmTransport` surface as ./useFilmTransport.ts so
 * the engine can hold one of them behind the `?film=` switch without caring
 * which. What it deliberately does NOT implement is any of that module's
 * decoder babysitting:
 *
 *   - no `SEEK_STALL` window and no `decoderKick`. Both existed to unwedge a
 *     seek that never fired `seeked`. With one seek in flight at a time there
 *     is nothing queued behind a hung seek to unwedge — the next animation
 *     frame simply finds `seeking` still true and does nothing, and when the
 *     decoder does land it, the chase picks up from wherever the scroll now
 *     is. A play/pause kick on a scrubbed film is itself a source of drift.
 *   - no buffered-span gate. That was a forward-play requirement: playing
 *     needs contiguous buffer ahead of the playhead, and 4 seconds of it was
 *     the price of admission. A byte-range seek needs one GOP. Gating on it
 *     pinned the film at frame 0 for as long as it took 4s of a 25 MB clip to
 *     arrive, which on a slow connection is most of the visit.
 */

import { useCallback, useRef } from 'react';
import {
  DEFAULT_SCRUB,
  HAVE_CURRENT_DATA,
  decideScrub,
  type ScrubConfig,
} from './lib/scrub';
import { frameFor, frameTime, lastFrameIndex } from './lib/transport';
import { FPS } from './lib/constants';
import type { FilmTransport } from './useFilmTransport';

/**
 * "Mobile" for the purposes of the deadband and the iOS prime.
 *
 * The reference's two queries, verbatim: a coarse pointer with no hover, OR a
 * viewport at or under 860px. Note this is NOT the film's own band split
 * (1121 / 1120 / 720) — those pick which encode and which beat timings to use,
 * and this picks how hard the decoder should be pushed. A 900px tablet in
 * landscape wants the mobile deadband and the tablet encode.
 */
export function scrubIsMobile(): boolean {
  if (typeof matchMedia !== 'function') return false;
  try {
    return (
      matchMedia('(hover: none) and (pointer: coarse)').matches ||
      matchMedia('(max-width:860px)').matches
    );
  } catch {
    return false;
  }
}

export function useFilmScrub(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  /** Coarse pointer or small viewport — picks the deadband. Read per frame. */
  isMobile: () => boolean,
  cfg: ScrubConfig = DEFAULT_SCRUB,
): FilmTransport {
  /** The lerped film time. NaN means "no chase yet"; the first step snaps. */
  const chase = useRef(Number.NaN);
  const okOnce = useRef(false);

  const ready = useCallback(() => {
    if (okOnce.current) return true;
    const v = videoRef.current;
    if (!v) return false;
    // A decoded frame exists. That is all a seek needs, and it is also exactly
    // the point at which the plate can be released — see the `painted` gate in
    // useHeroFilm.ts.
    if (v.readyState >= HAVE_CURRENT_DATA) okOnce.current = true;
    return okOnce.current;
  }, [videoRef]);

  const reset = useCallback(() => {
    chase.current = Number.NaN;
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
  }, [videoRef]);

  /**
   * Seek straight to a film time, bypassing the chase.
   *
   * Used by skip-to-end and by the lock-at-end handoff, both of which must
   * land on an exact frame rather than converge on one. This is the one place
   * the 1/FPS lattice from lib/transport.ts is still the right tool: it is
   * what guarantees the final seek addresses the last frame and not the
   * element's ended state.
   *
   * FPS is the source's 24, so `frameTime` lands on the MIDPOINT of a real
   * frame — at the end of the film, 1061.5/24 = 44.2292s of a 44.25s, 1062
   * frame master. On the old 1/60 lattice the same call produced 2654.5/60 =
   * 44.2417s: still inside the last source frame, but arrived at by accident,
   * and with lattice points elsewhere in the film (f = 2 -> 2.5/60 = 1/24)
   * landing exactly ON a frame boundary, which is the coin toss the `+0.5`
   * exists to prevent.
   */
  const snap = useCallback(
    (time: number, dur: number) => {
      const v = videoRef.current;
      if (!v) return;
      const f = frameFor(time, FPS, lastFrameIndex(dur, FPS));
      const at = frameTime(f, FPS);
      try {
        if (!v.paused) v.pause();
        v.currentTime = at;
      } catch {
        /* not seekable yet */
      }
      chase.current = at;
    },
    [videoRef],
  );

  const step = useCallback(
    (want: number, dur: number) => {
      const v = videoRef.current;
      if (!v) return;

      const cmd = decideScrub(
        {
          want,
          current: chase.current,
          currentTime: v.currentTime,
          duration: Number.isFinite(v.duration) && v.duration > 1 ? v.duration : dur,
          readyState: v.readyState,
          seeking: v.seeking,
          mobile: isMobile(),
        },
        cfg,
      );

      // `idle` carries no chase value on purpose: while a seek is in flight the
      // chase is frozen, so it cannot run ahead of a decoder already behind it.
      if (cmd.kind === 'idle') return;

      chase.current = cmd.current;
      if (cmd.kind === 'hold') return;

      try {
        v.currentTime = cmd.time;
      } catch {
        // Keep the last painted frame while the browser catches up. The next
        // animation frame will find the element unseekable-but-quiet and try
        // again, which is the whole recovery path this transport needs.
      }
    },
    [videoRef, isMobile, cfg],
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
