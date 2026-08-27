'use client';

import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import type { RefObject } from 'react';

/**
 * The About collage hinge — a port of `scrollSequence` (assets/site.js:4244-4278)
 * and its single caller, the `#aboutCollage` IIFE (assets/site.js:4411-4441).
 *
 * Six `.ac-tile`s hang on hinges. As `#about` climbs the viewport each one
 * swings shut in turn — the big plate and the island tile on an X hinge from
 * the top edge, the four side tiles on a Y hinge from whichever vertical edge
 * faces the middle of the collage — while it rides forward out of the
 * `perspective:1250px` the grid declares (home-sections.css) and fades up.
 *
 * WHY THIS IS A SCRUB AND NOT A REVEAL
 * ------------------------------------
 * The sibling `viewSequence` (site.js:4279-4310, the why-mosaic) plays once on
 * a timer when it enters view. This one is welded to scroll position for the
 * whole time the section is on screen, because the weld door in `#process`
 * drives `#about` past the viewport under program control — see WELD CLOCK
 * below. A timed entrance would desynchronise from that the moment the door
 * moved the section itself.
 *
 * ONE CALL SITE. `scrollSequence` is declared as a top-level function in
 * site.js but is called exactly once (site.js:4432). It is still ported as a
 * standalone `attachScrollSequence` — separable from the About-specific hinge
 * table so a second caller costs nothing — but no other section needs it today.
 *
 * EVERY NUMBER BELOW IS THE SOURCE'S. None was chosen here.
 */

/* ------------------------------------------------ scrollSequence engine -- */

/** site.js:4246-4251 — the defaults, kept even though the one caller overrides
 *  all five. `start`/`end` are viewport fractions of the host's rect top;
 *  `span` is how much of the run one tile occupies, `step` the stagger between
 *  tiles, `scrub` the per-frame lerp toward the raw scroll reading. */
export interface ScrollSequenceOpts {
  start?: number;
  end?: number;
  span?: number;
  step?: number;
  scrub?: number;
}

const DEF_START = 0.98;
const DEF_END = 0.26;
const DEF_SPAN = 0.4;
const DEF_STEP = 0.105;
const DEF_SCRUB = 0.085;

/** site.js:4276 — the observer is deliberately enormous: the sequence stays
 *  live for well over a screen either side, because the weld door can shove
 *  the section a long way in a single frame. */
const ROOT_MARGIN = '140% 0px 140% 0px';

export type SequenceApply = (el: HTMLElement, e: number, i: number) => void;

/**
 * site.js:4244-4278, verbatim in behaviour.
 *
 * Returns a detach function. THE SOURCE HAS NO TEARDOWN — its IIFE runs once
 * on a static page and never unwinds. React mounts and unmounts, so the
 * observer and the rAF have to be cancellable; that is the only addition.
 */
export function attachScrollSequence(
  host: HTMLElement | null,
  tiles: readonly HTMLElement[],
  apply: SequenceApply,
  opts: ScrollSequenceOpts = {},
): () => void {
  /* site.js:4245 */
  if (!host || !tiles.length) return () => {};
  /* Explicitly re-bound: TS drops the narrowing inside the hoisted `read`/
     `tick` function declarations below, which are not arrow consts. */
  const el0: HTMLElement = host;

  const START = opts.start != null ? opts.start : DEF_START;
  const END = opts.end != null ? opts.end : DEF_END;
  const SPAN = opts.span != null ? opts.span : DEF_SPAN;
  const STEP = opts.step != null ? opts.step : DEF_STEP;
  const SCRUB = opts.scrub != null ? opts.scrub : DEF_SCRUB;

  /* site.js:4252-4254 — reduced motion lands every tile at rest and stops.
     Note this is `e === 1`, which the About `apply` reads as "past 0.999" and
     answers by CLEARING the inline styles rather than writing the resting
     ones. That is the source's behaviour and it matters: it hands the tiles
     back to CSS instead of pinning them. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tiles.forEach((el, i) => apply(el, 1, i));
    return () => {};
  }

  let cur: number | null = null;
  let raf: number | null = null;
  let live = false;

  /* site.js:4256-4259 */
  function read(): number {
    const vh = window.innerHeight || 1;
    const top = el0.getBoundingClientRect().top / vh;
    return Math.max(0, Math.min(1, (START - top) / (START - END)));
  }

  /* site.js:4260-4269 */
  function tick(): void {
    const t = read();
    cur = cur === null ? t : cur + (t - cur) * SCRUB;
    for (let i = 0; i < tiles.length; i++) {
      const u = Math.max(0, Math.min(1, (cur - i * STEP) / SPAN));
      /* Cubic ease-out on the per-tile fraction — 1-(1-u)^3. */
      apply(tiles[i], 1 - Math.pow(1 - u, 3), i);
    }
    if (live) raf = requestAnimationFrame(tick);
  }

  /* site.js:4270 — one frame runs immediately, before any observation, so the
     tiles are never briefly at rest on a page that loads mid-section. */
  tick();

  if (typeof IntersectionObserver === 'undefined') {
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }

  /* site.js:4271-4277 — leaving view SNAPS: `cur = read()` throws away the
     eased value, then one un-scheduled tick paints the true position. Coming
     back in therefore starts from the truth rather than lerping in from
     wherever the scrub happened to be a screen ago. */
  const io = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting === live) return;
        live = e.isIntersecting;
        if (live) {
          raf = requestAnimationFrame(tick);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
          cur = read();
          tick();
        }
      });
    },
    { rootMargin: ROOT_MARGIN },
  );
  io.observe(host);

  return () => {
    live = false;
    io.disconnect();
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  };
}

/* -------------------------------------------------------- the About hinge -- */

export interface Hinge {
  /** rotateX or rotateY */
  ax: 'X' | 'Y';
  /** degrees at e=0, signed so the tile opens away from the collage centre */
  deg: number;
  /** the `transform-origin` the hinge pivots on */
  org: string;
}

/**
 * site.js:4421-4428 — index-aligned with the six `.ac-tile`s in markup order:
 * `ac-w1` (the brand plate), `ac-w2`, `ac-w3`, `ac-w4`, `ac-p1`, `ac-p2`.
 *
 * The asymmetry is real, not a typo: the X hinges swing 84 degrees and the Y
 * hinges 78, and the two X tiles (0 and 3) are the full-width left column
 * pieces, which hang from their top edge. The Y tiles alternate sign so the
 * right-hand stack (1, 5) pivots on its right edge and (2, 4) on its left.
 */
export const HINGE: readonly Hinge[] = [
  { ax: 'X', deg: -84, org: '50% 0%' },
  { ax: 'Y', deg: -78, org: '100% 50%' },
  { ax: 'Y', deg: 78, org: '0% 50%' },
  { ax: 'X', deg: -84, org: '50% 0%' },
  { ax: 'Y', deg: 78, org: '0% 50%' },
  { ax: 'Y', deg: -78, org: '100% 50%' },
];

/** site.js:4434-4435 — the tile rides forward from 70px behind the plane. */
const DEPTH = 70;
/** site.js:4436 — opacity outruns the swing, so a tile is solid well before it
 *  is square on. */
const FADE_GAIN = 2.1;

/**
 * site.js:4437-4438 — the timing profile when the weld door owns the scroll.
 *
 * `start:1.21` begins the sequence while the collage is still a fifth of a
 * screen BELOW the fold, and `end:0.576` finishes it while the section top is
 * still past the middle of the viewport, because under the weld the section is
 * being driven upward much faster than a finger scrolls. `scrub:0.26` is
 * nearly double the free-scroll lerp for the same reason — a slower follow
 * would visibly lag the door.
 */
export const SEQ_WELD: Required<ScrollSequenceOpts> = {
  start: 1.21,
  end: 0.576,
  span: 0.42,
  step: 0.112,
  scrub: 0.26,
};

/** site.js:4439 — free scrolling: the run is the normal one screen-and-a-bit. */
export const SEQ_PLAIN: Required<ScrollSequenceOpts> = {
  start: 0.94,
  end: 0.2,
  span: 0.42,
  step: 0.112,
  scrub: 0.14,
};

/**
 * site.js:4433-4436 — the per-tile write, split out so it can be asserted on.
 *
 * `null` means "past 0.999: clear the inline styles", which is not the same as
 * writing the resting values. Clearing hands the tile back to CSS, so the
 * `:hover` scale on `.ac-tile img` and the `will-change` budget are not held
 * hostage by a transform that will never change again.
 */
export function hingeStyle(
  e: number,
  i: number,
): { transform: string; opacity: string } | null {
  if (e > 0.999) return null;
  const h = HINGE[i % HINGE.length];
  return {
    transform:
      'translateZ(' +
      (-(1 - e) * DEPTH).toFixed(1) +
      'px) rotate' +
      h.ax +
      '(' +
      ((1 - e) * h.deg).toFixed(2) +
      'deg)',
    opacity: Math.min(1, e * FADE_GAIN).toFixed(3),
  };
}

/**
 * site.js:4429-4431 — the weld clock test, read ONCE at attach time.
 *
 * The source does not re-evaluate this on resize either; the profile a page
 * loads with is the profile it keeps. Reproduced rather than improved.
 *
 * All three clauses matter: the door is a desktop-only build (`min-width:1121px`
 * is the frozen desktop band), it is skipped under reduced motion, and it only
 * exists at all when `#process` is on the page — which on this site means the
 * home page and nowhere else.
 */
export function weldClockActive(): boolean {
  return (
    window.matchMedia('(min-width:1121px)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !!document.getElementById('process')
  );
}

/**
 * Wire the hinge to a `#aboutCollage` element.
 *
 * Layout-timed, not `useEffect`-timed: the source runs its first `tick()`
 * synchronously at parse time (site.js:4270), so the tiles are already folded
 * open on the first paint. An `useEffect` here would paint them square-on for
 * one frame and then snap them away.
 */
export function useAboutHinge(collageRef: RefObject<HTMLElement | null>): void {
  useIsomorphicLayoutEffect(() => {
    const collage = collageRef.current;
    if (!collage) return;

    /* site.js:4429 — ALL SIX, including `.ac-w4`.
       Below 1121px `.ac-w4{display:none}` (home-sections.css), so tile 3 is
       not on screen — but the source still counts it, so it still eats a
       0.112 stagger slot and the two portraits below it still start late.
       That is the source's oddity and it is reproduced, not corrected. */
    const tiles = Array.from(collage.querySelectorAll<HTMLElement>('.ac-tile'));
    if (!tiles.length) return;

    /* site.js:4430 — the origin is written once and never touched again; only
       the transform itself is animated. */
    tiles.forEach((el, i) => {
      el.style.transformOrigin = HINGE[i % HINGE.length].org;
    });

    const opts = weldClockActive() ? SEQ_WELD : SEQ_PLAIN;

    const detach = attachScrollSequence(
      collage,
      tiles,
      (el, e, i) => {
        const s = hingeStyle(e, i);
        if (!s) {
          el.style.transform = '';
          el.style.opacity = '';
          return;
        }
        el.style.transform = s.transform;
        el.style.opacity = s.opacity;
      },
      opts,
    );

    return () => {
      detach();
      /* Not the source's — the source never unmounts. On unmount hand every
         tile back to CSS so a remount does not inherit a half-swung inline
         transform from the previous life. */
      tiles.forEach((el) => {
        el.style.transform = '';
        el.style.opacity = '';
        el.style.transformOrigin = '';
      });
    };
  }, [collageRef]);
}
