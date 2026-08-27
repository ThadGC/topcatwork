'use client';

import { useEffect, type RefObject } from 'react';

/**
 * `viewSequence` — assets/site.js:4281-4312.
 *
 * The time-based sibling of `scrollSequence` (which drives the About collage
 * hinge). The difference is the clock:
 *
 *   scrollSequence  progress is a function of scroll position — scrub it back
 *                   and forth and the tiles follow the finger.
 *   viewSequence    progress is a function of TIME. An IntersectionObserver
 *                   fires once, the rAF loop runs to completion, and that is
 *                   the end of it. Scrolling away and back does not replay it.
 *
 * The home page's `#whyMosaic` is the only call site (site.js:4313-4319).
 *
 * Three properties of the source are load-bearing:
 *
 *   1. IT PLAYS ONCE. `played` latches and the observer disconnects on the
 *      first intersection. There is no reset path.
 *   2. THE TILES ARE PARKED SYNCHRONOUSLY, before the observer is created —
 *      `tiles.forEach((el,i) => apply(el, 0, i))`. Park them in an effect that
 *      runs after paint and the mosaic flashes at rest for one frame first.
 *   3. REDUCED MOTION SHORT-CIRCUITS TO REST, and never starts the loop:
 *      `apply(el, 1, i)` for every tile, then return.
 *
 * The easing is the source's own `1 - (1-u)^3` (ease-out cubic), applied per
 * tile against a stagger of `i * GAP` milliseconds.
 */

export interface ViewSequenceOptions {
  /** ms for one tile's travel. site.js default 620. */
  dur?: number;
  /** ms of stagger between consecutive tiles. site.js default 175. */
  gap?: number;
  /** ms to wait after the first intersection before anything moves. */
  hold?: number;
  /** IntersectionObserver threshold on the HOST. site.js default 0.2. */
  threshold?: number;
}

/**
 * @param host    the element observed for intersection (`#whyMosaic`)
 * @param select  CSS selector for the tiles, queried inside `host`
 * @param apply   `(el, e, i)` — write the tile's style for eased progress `e`
 *                in 0..1. Called with 0 for every tile before the first frame.
 */
export function useViewSequence(
  host: RefObject<HTMLElement | null>,
  select: string,
  apply: (el: HTMLElement, e: number, i: number) => void,
  opts: ViewSequenceOptions = {},
): void {
  const { dur = 620, gap = 175, hold = 0, threshold = 0.2 } = opts;

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const tiles = Array.from(el.querySelectorAll<HTMLElement>(select));
    if (!tiles.length) return;

    // site.js:4288 — reduced motion lands every tile at rest and never loops.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tiles.forEach((t, i) => apply(t, 1, i));
      return;
    }

    // site.js:4291 — park first, synchronously, or the mosaic shows at rest.
    tiles.forEach((t, i) => apply(t, 0, i));

    let t0: number | null = null;
    let raf: number | null = null;
    let played = false;

    const frame = (now: number) => {
      if (t0 === null) t0 = now;
      const ms = now - t0 - hold;
      let all = true;
      for (let i = 0; i < tiles.length; i++) {
        const u = Math.max(0, Math.min(1, (ms - i * gap) / dur));
        if (u < 1) all = false;
        apply(tiles[i], 1 - Math.pow(1 - u, 3), i);
      }
      raf = all ? null : requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || played) continue;
          played = true;
          io.disconnect();
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [host, select, apply, dur, gap, hold, threshold]);
}

export default useViewSequence;
