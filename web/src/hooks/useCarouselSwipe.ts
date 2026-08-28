'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * The one pointer/swipe engine, ported from the old vanilla build.
 *
 * Three carousels in the old site each answered to a finger, a mouse and a
 * trackpad, and each did it with its own copy of the same code:
 *
 *   - the stone wheel        assets/site.js:1165-1194
 *   - the review deck (solo) assets/site.js:1802-1829
 *   - the services helix     assets/site.js:586-631
 *
 * and two of the three delegated their drag to the shared `attachSwipe`
 * helper at assets/site.js:4-81. This module is that helper plus the two
 * drag bindings that never used it, behind one API.
 *
 * STANDING CLIENT RULE (verified, do not water down): a swipe must answer to
 * touch, mouse AND a trackpad `wheel` deltaX. The client reviews the mobile
 * layout on a MacBook; a touch-only implementation has already shipped broken
 * once and was rejected. Hence `wheel` is a first-class input here, not an
 * afterthought, and it is attached `{passive:false}` because the handler
 * calls preventDefault() — React's onWheel/onTouchMove props are passive and
 * CANNOT carry this.
 *
 * EVERY NUMBER BELOW IS THE SOURCE'S. None was chosen here.
 */

/* ---------------------------------------------------------------- wheel --
   The trackpad path. All three call sites share the shape

     axis gate -> preventDefault -> accumulate deltaX -> fire one step

   but not the constants, so the constants are the caller's. site.js:620-631
   (helix), 1181-1191 (stone wheel), 1820-1831 (review deck).                */

export interface WheelStepConfig {
  /**
   * The 2:1 axis gate. The source spells it as a rejection:
   * `if (Math.abs(deltaX) < Math.abs(deltaY) * 2) return;`
   * — i.e. only treat the gesture as horizontal when |dx| >= 2*|dy|, so a
   * vertical page scroll (which carries a little deltaX jitter) never spins
   * the carousel. site.js:622, site.js:1183.
   */
  axisRatio?: number;
  /**
   * Full override of the gate, for the one call site whose comparison is not
   * a ratio: the review deck rejects on `|dx| <= |dy|` (site.js:1822), which
   * is NOT `axisRatio: 1` — an exactly-diagonal delta is rejected there and
   * would be accepted by the ratio form. Reproduce the oddity, do not smooth
   * it out. Return true to treat the event as horizontal.
   */
  axisGate?: (deltaX: number, deltaY: number) => boolean;
  /** The accumulator: one step per `threshold` px of deltaX. 24 for the
   *  helix and the stone wheel (site.js:626, 1187); 60 for the review deck
   *  (site.js:1828). */
  threshold?: number;
  /**
   * Time-based cooldown, ms. After a step, ignore further steps until the
   * clock passes it. The stone wheel uses 260 (site.js:1188); the helix used
   * 300 (site.js:628). Default here is 260. Ignored when `quiet` is set.
   */
  cooldown?: number;
  /**
   * The review deck's alternative to a cooldown (site.js:1823-1830): a hard
   * lock after one step, released only by `quiet` ms of no wheel events at
   * all — the timer is restarted by EVERY wheel event, so one long trackpad
   * flick yields exactly one page. 140ms there. Setting this switches the
   * cooldown off; leave it undefined for the timed form.
   */
  quiet?: number;
}

/** site.js:1181-1191 — the stone wheel's own numbers. */
export const WHEEL_STONE_WHEEL: WheelStepConfig = { axisRatio: 2, threshold: 24, cooldown: 260 };
/** site.js:620-631 — the services helix's own numbers. */
export const WHEEL_HELIX: WheelStepConfig = { axisRatio: 2, threshold: 24, cooldown: 300 };
/** site.js:1820-1831 — the review deck: 1:1-exclusive gate, 60px, lock+quiet. */
export const WHEEL_REVIEW_DECK: WheelStepConfig = {
  axisGate: (dx, dy) => Math.abs(dx) > Math.abs(dy),
  threshold: 60,
  quiet: 140,
};

/* ----------------------------------------------------------------- drag --
   Two drag engines, because the old build had two.

   'raw'     — mousedown/mousemove/mouseup + touchstart/touchmove/touchend,
               straight off the element, no axis lock, no scroll takeover.
               This is what the stone wheel (site.js:1165-1172) and the
               desktop helix (site.js:592-612) use. The move listeners live on
               `window`, so a release outside the element still ends the drag.

   'pointer' — the shared `attachSwipe` (site.js:4-81): pointer events, a 5px
               slop before the axis locks, and — once the axis locks vertical
               on a touch — it TAKES OVER the page scroll and flings it. The
               review deck (site.js:1806-1818) and the phone helix
               (site.js:614-619) use this one.

   A caller that needs both at once (the helix does: 'raw' above 720px,
   'pointer' on a phone) calls the hook twice with different `enabled`
   predicates. That is exactly what site.js:607-619 does.                    */

export type DragMode = 'raw' | 'pointer' | 'none';

export interface CarouselSwipeOptions {
  /** Gate for every input. site.js `cfg.enabled` (:8), `galleryOn` (:1177),
   *  `revSolo` (:1807), `hxPhone` (:606). Defaults to always on. */
  enabled?: () => boolean;
  /**
   * 'pointer' mode only, and only the source uses it: the review deck refuses
   * to start a drag on an expanded review's own scrolling page
   * (`ignore: t => !!(t.closest && t.closest('.rev-page'))`, site.js:1808).
   * Return true to let the event through untouched.
   */
  ignore?: (target: EventTarget | null) => boolean;

  drag?: DragMode;
  /** Class toggled on the element for the duration of a drag: 'dragging' for
   *  the stone wheel (site.js:1164) and the helix (site.js:592). The review
   *  deck toggles 'solo-dragging' on a DIFFERENT element, so it does that in
   *  its own onDragStart/onDragEnd instead. */
  dragClass?: string;
  /**
   * 'raw' mode only. The stone wheel calls preventDefault() on mousedown
   * BEFORE it checks whether the gallery is on (site.js:1170) — 'always'.
   * The helix checks first and returns, so a phone-width mousedown is never
   * defaulted (site.js:607) — 'when-enabled'. Default 'always'.
   */
  preventDefaultMouseDown?: 'always' | 'when-enabled';

  /**
   * 'pointer' mode only. A DELIBERATE DEPARTURE FROM THE SOURCE, asked for by
   * name: "if someone places their thumb on the review card and swipes up ...
   * it should just scroll down. It should not interact with the review card
   * itself."
   *
   * With this set, the moment the axis resolves vertical the gesture is
   * released for its whole duration — nothing is preventDefaulted, the page
   * scroll is not taken over, and no fling is armed. The browser does the
   * scrolling natively, on the compositor, with its own momentum.
   *
   * ⛔ THE ELEMENT MUST ALSO CARRY `touch-action: pan-y`, or the browser will
   * not scroll and neither will anything else. And that CSS must not ship
   * without this flag: with `pan-y` alone the native pan AND the old JS
   * takeover both run, measured at 659px of scroll for 170px of finger
   * against 333px native.
   */
  releaseOnVertical?: boolean;

  /** A drag began. site.js `cfg.onStart` / `pointerDown` / `hxDown`. */
  onDragStart?: () => void;
  /** Continuous drag delta in px from the press point — the mode the stone
   *  wheel and the solo review deck need, because both glide with the finger.
   *  site.js `cfg.onMove(dx)` (:41), `pointerMove` (:1157), `hxMove` (:594). */
  onDragMove?: (dx: number) => void;
  /**
   * The drag ended. `dx` is the total travel, `vx` the release velocity in
   * px/ms from the source's EMA (site.js:38-40) — the review deck's flick
   * test needs it (site.js:1815). 'raw' mode reports vx as 0: the source's
   * raw bindings never measured a velocity, and inventing one here would be
   * a new number.
   */
  onDragEnd?: (dx: number, vx: number) => void;

  /** Discrete prev/next. Fired by the wheel accumulator; `dir` is +1 for a
   *  rightward/next step and -1 for prev, matching `accum>0?1:-1`. */
  onStep?: (dir: 1 | -1) => void;
  /** Trackpad config, or false for no wheel binding at all. */
  wheel?: WheelStepConfig | false;

  /** Test seam. Defaults to performance.now, which is what the source reads
   *  (site.js:625, 1185). Not a behaviour switch — do not pass it in app code. */
  now?: () => number;
}

/* attachSwipe's own constants, site.js:6 and :10-11. */
const SLOP = 5;
const VY_WIN = 70;

/* Horizontal must be twice the vertical travel before it may claim a gesture,
   the same 2:1 dominance the trackpad gate already uses. Only consulted when
   `releaseOnVertical` is set. */
const HORIZ_BIAS = 2;

/**
 * The imperative core. Returns a teardown that removes every listener,
 * cancels the fling and restores `scrollBehavior`.
 */
export function attachCarouselSwipe(
  el: HTMLElement | null,
  opts: CarouselSwipeOptions,
): () => void {
  /* site.js:5 — attachSwipe's first line is a null guard. */
  if (!el) return () => {};

  const noop = () => {};
  const cleanups: Array<() => void> = [];
  const now = () => (opts.now ?? (() => performance.now()))();
  const enabled = () => (opts.enabled ? opts.enabled() : true);

  const mode: DragMode = opts.drag ?? 'none';

  /* ================================================================ raw ==
     site.js:1153-1172 (stone wheel) and site.js:592-612 (helix). Identical
     bodies; the helix's are wrapped in a `!hxPhone()` gate, which is this
     hook's `enabled`. */
  if (mode === 'raw') {
    let dragging = false;
    let startX = 0;
    let lastDx = 0;

    const down = (x: number) => {
      if (!enabled()) return;
      dragging = true;
      lastDx = 0;
      startX = x;
      if (opts.dragClass) el.classList.add(opts.dragClass);
      (opts.onDragStart ?? noop)();
    };
    const move = (x: number) => {
      if (!dragging) return;
      lastDx = x - startX;
      (opts.onDragMove ?? noop)(lastDx);
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      if (opts.dragClass) el.classList.remove(opts.dragClass);
      /* vx is 0: the raw bindings never measured one. */
      (opts.onDragEnd ?? noop)(lastDx, 0);
    };

    const onMouseDown = (e: MouseEvent) => {
      /* site.js:1170 preventDefaults unconditionally; site.js:607 gates
         first. `preventDefaultMouseDown` is which of the two. */
      if ((opts.preventDefaultMouseDown ?? 'always') === 'always') {
        e.preventDefault();
      } else {
        if (!enabled()) return;
        e.preventDefault();
      }
      down(e.clientX);
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientX);
    const onTouchStart = (e: Event) => {
      const t = (e as TouchEvent).touches?.[0];
      if (t) down(t.clientX);
    };
    const onTouchMove = (e: Event) => {
      const t = (e as TouchEvent).touches?.[0];
      if (t) move(t.clientX);
    };

    el.addEventListener('mousedown', onMouseDown);
    /* On window, not the element: site.js:1167-1168. A mouse released outside
       the carousel still ends the drag. */
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', up);
    /* passive:true — the source never preventDefaults a touch here.
       site.js:1169-1170. */
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', up);

    cleanups.push(() => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', up);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', up);
    });
  }

  /* ============================================================ pointer ==
     A line-for-line port of attachSwipe, site.js:4-81. */
  if (mode === 'pointer') {
    /* site.js:9 */
    let on = false;
    let axis = 0;
    let pid: number | null = null;
    let touch = false;
    let sx = 0;
    let sy = 0;
    let ly = 0;
    let lt = 0;
    let glide: number | null = null;
    let freed = false;
    /* site.js:11-12 */
    let vyHist: Array<{ y: number; t: number }> = [];
    let lx = 0;
    let lxt = 0;
    let vx = 0;

    /* site.js:13-14 — while a fling owns the page, smooth scrolling is off. */
    const freeScroll = () => {
      if (!freed) {
        freed = true;
        document.documentElement.style.scrollBehavior = 'auto';
      }
    };
    const restoreScroll = () => {
      if (freed) {
        freed = false;
        document.documentElement.style.scrollBehavior = '';
      }
    };
    /* site.js:15-16 */
    const stopGlide = () => {
      if (glide !== null) {
        cancelAnimationFrame(glide);
        glide = null;
      }
      restoreScroll();
    };
    const killGlide = () => {
      if (glide !== null) stopGlide();
    };

    /* site.js:17-19 — any new input anywhere kills a running fling. */
    window.addEventListener('pointerdown', killGlide, { capture: true, passive: true });
    window.addEventListener('touchstart', killGlide, { capture: true, passive: true });
    window.addEventListener('wheel', killGlide, { capture: true, passive: true });

    /* site.js:20-31 */
    const onPointerDown = (e: PointerEvent) => {
      if (!enabled()) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (opts.ignore && opts.ignore(e.target)) return;
      stopGlide();
      on = true;
      axis = 0;
      pid = e.pointerId;
      touch = e.pointerType !== 'mouse';
      sx = e.clientX;
      sy = e.clientY;
      ly = e.clientY;
      lt = e.timeStamp || now();
      vyHist = [{ y: e.clientY, t: lt }];
      lx = e.clientX;
      lxt = lt;
      vx = 0;
    };

    /* site.js:32-53 */
    const onPointerMove = (e: PointerEvent) => {
      if (!on || e.pointerId !== pid) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (!axis) {
        /* 5px of slop before the axis commits, then it is locked for the
           whole gesture. site.js:35-38. */
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
        if (opts.releaseOnVertical) {
          /*
            ⛔ THE SOURCE COIN-FLIPS ON THE FIRST 5px AND BREAKS TIES TOWARDS
            HORIZONTAL, WHICH IS HOW A THUMB FLICK GOT EATEN.

            Six pixels of thumb arc was enough: driven in real Chrome, a 160px
            up-flick whose first delivered move was dx=+6 / dy=-4 locked to the
            carousel for the entire gesture — every later move came back
            defaultPrevented, the deck dragged and sprang back, and the page
            moved 0px for 160px of finger.

            So vertical wins ties and needs only its own 5px, while horizontal
            must be HORIZ_BIAS times the vertical travel before it may claim
            the gesture. Neither satisfied means the gesture is still genuinely
            ambiguous, so NO verdict is taken and the next move decides. It
            cannot stall: any move with |dy| >= 5 resolves vertical, any move
            with |dx| >= 2|dy| resolves horizontal.
          */
          if (Math.abs(dy) >= SLOP && Math.abs(dy) >= Math.abs(dx)) axis = -1;
          else if (Math.abs(dx) >= SLOP && Math.abs(dx) >= Math.abs(dy) * HORIZ_BIAS) axis = 1;
          else return;
          if (axis < 0) {
            /* RELEASED FOR THE REST OF THE GESTURE. `on = false` makes every
               later pointermove and pointerup for this pointer a no-op, and
               the next pointerdown re-arms it. The browser owns the pan from
               here, via `touch-action: pan-y`. */
            on = false;
            axis = 0;
            restoreScroll();
            return;
          }
        } else {
          axis = Math.abs(dx) >= Math.abs(dy) ? 1 : -1;
        }
        if (axis > 0) {
          try {
            if (pid !== null) el.setPointerCapture(pid);
          } catch {
            /* site.js:37 swallows this — jsdom and old Safari both throw. */
          }
          (opts.onDragStart ?? noop)();
        }
      }
      if (axis > 0) {
        /*
          ⛔ A TOUCH GESTURE IS NEVER preventDefault()ED WHEN THE BROWSER OWNS
          THE AXES.

          `releaseOnVertical` ships with `touch-action: pan-y` on the element,
          and that is already an absolute contract: the browser will pan
          vertically and will NOT pan horizontally, whatever this code does. So
          there is no default action left to prevent — and calling it anyway is
          what lets a gesture the browser has decided is a vertical pan be
          fought by a handler that decided it was horizontal. That fight is
          what the client sees as the page jumping up and down under his thumb,
          and it is exactly the kind of thing that reproduces on a real phone
          and not in a synthetic pointer sequence.

          A mouse drag has no touch-action contract, so it still needs this.
        */
        if (e.cancelable && !(touch && opts.releaseOnVertical)) e.preventDefault();
        /* The velocity EMA: 0.6 of the new sample, 0.4 of the old.
           site.js:43-45. */
        const nx = e.timeStamp || now();
        const dt2 = Math.max(1, nx - lxt);
        vx = 0.6 * ((e.clientX - lx) / dt2) + 0.4 * vx;
        lx = e.clientX;
        lxt = nx;
        (opts.onDragMove ?? noop)(dx);
        return;
      }
      /* Vertical, on a touch: the element swallowed the gesture, so it hands
         the page its scroll back by hand. site.js:48-53.

         ⛔ UNREACHABLE WHEN `releaseOnVertical` IS SET, and that is the point:
         a vertical verdict has already set `on = false` above, so this
         hand-rolled scroll and the fling below never run for that caller. The
         browser does the panning, on the compositor, with its own momentum. */
      if (!touch) return;
      freeScroll();
      const nowT = e.timeStamp || now();
      const step = e.clientY - ly;
      ly = e.clientY;
      lt = nowT;
      vyHist.push({ y: e.clientY, t: nowT });
      while (vyHist.length > 2 && nowT - vyHist[0].t > VY_WIN) vyHist.shift();
      window.scrollBy(0, -step);
    };

    /* site.js:54-58 */
    const releaseSpeed = () => {
      if (vyHist.length < 2) return 0;
      const a = vyHist[0];
      const b = vyHist[vyHist.length - 1];
      const dt = b.t - a.t;
      return dt > 4 ? (b.y - a.y) / dt : 0;
    };

    /* site.js:59-69 — clamp ±2.6 px/ms, scale by 16.7 (one frame), decay
       0.90 a frame, stop under 0.4. */
    const fling = () => {
      stopGlide();
      let v = Math.max(-2.6, Math.min(2.6, releaseSpeed())) * 16.7;
      freeScroll();
      const step = () => {
        v *= 0.9;
        if (Math.abs(v) < 0.4) {
          glide = null;
          restoreScroll();
          return;
        }
        window.scrollBy(0, -v);
        glide = requestAnimationFrame(step);
      };
      glide = requestAnimationFrame(step);
    };

    /* site.js:70-79 */
    const end = (e?: PointerEvent) => {
      if (!on || (e && e.pointerId !== pid)) return;
      on = false;
      try {
        if (pid !== null) el.releasePointerCapture(pid);
      } catch {
        /* site.js:73 swallows this too. */
      }
      if (axis > 0) {
        (opts.onDragEnd ?? noop)(e ? e.clientX - sx : 0, vx);
      } else if (axis < 0 && touch && Math.abs(releaseSpeed()) > 0.25) {
        fling();
      } else {
        restoreScroll();
      }
      axis = 0;
      pid = null;
    };

    el.addEventListener('pointerdown', onPointerDown as EventListener);
    /* {passive:false} — this handler preventDefaults. site.js:53. */
    window.addEventListener('pointermove', onPointerMove as EventListener, { passive: false });
    window.addEventListener('pointerup', end as EventListener);
    window.addEventListener('pointercancel', end as EventListener);

    cleanups.push(() => {
      stopGlide();
      window.removeEventListener('pointerdown', killGlide, { capture: true });
      window.removeEventListener('touchstart', killGlide, { capture: true });
      window.removeEventListener('wheel', killGlide, { capture: true });
      el.removeEventListener('pointerdown', onPointerDown as EventListener);
      window.removeEventListener('pointermove', onPointerMove as EventListener);
      window.removeEventListener('pointerup', end as EventListener);
      window.removeEventListener('pointercancel', end as EventListener);
    });
  }

  /* ============================================================== wheel ==
     site.js:620-631, 1181-1191, 1820-1831. */
  if (opts.wheel) {
    const cfg = opts.wheel;
    const ratio = cfg.axisRatio ?? 2;
    const threshold = cfg.threshold ?? 24;
    const cooldownMs = cfg.cooldown ?? 260;
    const quiet = cfg.quiet;
    const gate =
      cfg.axisGate ?? ((dx: number, dy: number) => Math.abs(dx) >= Math.abs(dy) * ratio);

    let accum = 0;
    let cooldownUntil = 0;
    let lock = false;
    let quietT: ReturnType<typeof setTimeout> | null = null;

    const onWheel = (e: WheelEvent) => {
      /* The enabled gate comes FIRST, before the axis test and before
         preventDefault: site.js:1182, site.js:1821. */
      if (!enabled()) return;
      if (!gate(e.deltaX, e.deltaY)) return;
      e.preventDefault();

      if (quiet !== undefined) {
        /* The review deck's lock+quiet form, site.js:1824-1830. Note the
           timer is re-armed on EVERY wheel event, including the ones the
           lock then discards, so the lock outlives a long flick. */
        if (quietT) clearTimeout(quietT);
        quietT = setTimeout(() => {
          accum = 0;
          lock = false;
        }, quiet);
        if (lock) return;
        accum += e.deltaX;
        if (Math.abs(accum) > threshold) {
          (opts.onStep ?? noop)(accum > 0 ? 1 : -1);
          accum = 0;
          lock = true;
        }
        return;
      }

      /* The timed form, site.js:625-629 and 1185-1189. */
      const t = now();
      accum += e.deltaX;
      if (t >= cooldownUntil && Math.abs(accum) > threshold) {
        (opts.onStep ?? noop)(accum > 0 ? 1 : -1);
        accum = 0;
        cooldownUntil = t + cooldownMs;
      }
    };

    el.addEventListener('wheel', onWheel as EventListener, { passive: false });
    cleanups.push(() => {
      if (quietT) clearTimeout(quietT);
      el.removeEventListener('wheel', onWheel as EventListener);
    });
  }

  return () => {
    for (const c of cleanups) c();
  };
}

/**
 * React wrapper. Attaches once per element; the callbacks and predicates are
 * read from a ref at event time, so a caller may pass fresh closures on every
 * render without the listeners being torn down and re-bound.
 *
 * A caller needing two drag engines at once (the helix: 'raw' above 720px,
 * 'pointer' on a phone — site.js:607-619) calls this twice with opposite
 * `enabled` predicates and `wheel: false` on the second.
 */
export function useCarouselSwipe(
  ref: RefObject<HTMLElement | null>,
  options: CarouselSwipeOptions,
): void {
  const optsRef = useRef(options);
  optsRef.current = options;

  /* Structural choices are read once, at attach time; everything else is
     read live through optsRef, hence the narrow dep list. */
  const mode = options.drag ?? 'none';
  const wheelOn = options.wheel ? options.wheel : false;
  const releaseVertical = options.releaseOnVertical ?? false;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attachCarouselSwipe(el, {
      drag: mode,
      wheel: wheelOn,
      releaseOnVertical: releaseVertical,
      dragClass: optsRef.current.dragClass,
      preventDefaultMouseDown: optsRef.current.preventDefaultMouseDown,
      enabled: () => (optsRef.current.enabled ? optsRef.current.enabled() : true),
      ignore: (t) => (optsRef.current.ignore ? optsRef.current.ignore(t) : false),
      onDragStart: () => optsRef.current.onDragStart?.(),
      onDragMove: (dx) => optsRef.current.onDragMove?.(dx),
      onDragEnd: (dx, vx) => optsRef.current.onDragEnd?.(dx, vx),
      onStep: (dir) => optsRef.current.onStep?.(dir),
      now: optsRef.current.now,
    });
    /* wheelOn is a config object; callers pass a module-level constant
       (WHEEL_STONE_WHEEL etc.) or false, so its identity is stable. */
  }, [ref, mode, wheelOn, releaseVertical]);
}
