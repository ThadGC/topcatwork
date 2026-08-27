'use client';

/**
 * HERO FILM — presented-frame subscription.
 *
 * `requestVideoFrameCallback` is the only API that reports which frame is
 * actually ON SCREEN, as opposed to which frame the decoder has been asked
 * for. Two parts of the film depend on that distinction:
 *
 *  - the clip-path reveal (lib/reveal.ts) is keyed to source frame numbers, so
 *    it must advance when the compositor advances, not when the scroll does;
 *  - the frame sampler (lib/sampler.ts) caches its readback per presented
 *    frame, so it needs to know when that cache went stale.
 *
 * Safari shipped rVFC first and every current engine has it, but the fallback
 * matters: without it the caller polls `currentTime` from the animation loop,
 * which is one frame of latency and no `presentedFrames` counter — so the
 * fallback key is a quantised `currentTime` instead.
 */

import { useEffect, useRef } from 'react';
import { SRCFPS } from './lib/constants';

export interface PresentedFrame {
  /** Monotonic count of frames the compositor has shown. */
  presentedFrames: number;
  /** The media timestamp of that frame, in seconds. */
  mediaTime: number;
  /** `mediaTime` expressed in source frames — what the reveal tables index. */
  sourceFrame: number;
}

export interface VideoFrameHandle {
  /** Latest presented frame, or null before the first one. */
  current: PresentedFrame | null;
  /** True when the browser has `requestVideoFrameCallback`. */
  supported: boolean;
  /**
   * Cache key for the sampler. Falls back to a quantised `currentTime` when
   * rVFC is unavailable, so the cache still coalesces within a source frame.
   */
  key(video: HTMLVideoElement | null): number;
  /**
   * Source-frame index to feed the reveal tables. Falls back to
   * `currentTime * SRCFPS`, matching the legacy fallback exactly.
   */
  frame(video: HTMLVideoElement | null): number;
}

/**
 * `requestVideoFrameCallback` is in lib.dom as a required member, but it is
 * genuinely absent on some engines, so every call site guards at runtime.
 */
type MaybeRVFC = Partial<
  Pick<HTMLVideoElement, 'requestVideoFrameCallback' | 'cancelVideoFrameCallback'>
>;

/**
 * @param videoRef  the film element
 * @param onFrame   called once per newly presented frame. Kept in a ref so a
 *                  changing callback identity never re-subscribes — the
 *                  subscription owns a decoder callback and must not churn.
 */
export function useVideoFrame(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onFrame?: (f: PresentedFrame) => void,
): VideoFrameHandle {
  const latest = useRef<PresentedFrame | null>(null);
  const cb = useRef(onFrame);
  cb.current = onFrame;

  const handle = useRef<VideoFrameHandle>(undefined as unknown as VideoFrameHandle);
  if (!handle.current) {
    handle.current = {
      current: null,
      supported: false,
      key(video) {
        const f = latest.current;
        if (f) return f.presentedFrames;
        if (!video || video.readyState < 2) return -1;
        // No rVFC: quantise to the source grid so a paused film still hits.
        return Math.round(video.currentTime * SRCFPS * 4);
      },
      frame(video) {
        const f = latest.current;
        if (f) return f.sourceFrame;
        if (!video || video.readyState < 2 || Number.isNaN(video.currentTime)) return 0;
        return video.currentTime * SRCFPS;
      },
    };
  }

  useEffect(() => {
    const video = videoRef.current;
    const rvfc = video as MaybeRVFC | null;
    if (!video || !rvfc || typeof rvfc.requestVideoFrameCallback !== 'function') return;

    const h = handle.current;
    h.supported = true;

    let id = 0;
    let alive = true;

    const step = (
      _now: number,
      meta: { mediaTime: number; presentedFrames: number },
    ) => {
      if (!alive) return;
      const f: PresentedFrame = {
        presentedFrames: meta.presentedFrames,
        mediaTime: meta.mediaTime,
        sourceFrame: meta.mediaTime * SRCFPS,
      };
      latest.current = f;
      h.current = f;
      cb.current?.(f);
      try {
        id = rvfc.requestVideoFrameCallback!(step);
      } catch {
        /* element torn down mid-callback */
      }
    };

    try {
      id = rvfc.requestVideoFrameCallback(step);
    } catch {
      h.supported = false;
    }

    return () => {
      alive = false;
      h.supported = false;
      latest.current = null;
      h.current = null;
      try {
        rvfc.cancelVideoFrameCallback?.(id);
      } catch {
        /* already gone */
      }
    };
  }, [videoRef]);

  return handle.current;
}
