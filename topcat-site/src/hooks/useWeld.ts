'use client';

import { useEffect } from 'react';

/**
 * THE WELD — the `#process` -> `#about` hand-off.
 *
 * Port of the IIFE at assets/site.js:4441-4573 (the old build), verbatim in
 * behaviour and in constants.
 *
 * WHAT IT DOES
 * ------------
 * `#process` is pinned (`position:sticky`) while the page scrolls a fixed
 * distance past it. Over that distance a full-screen fixed stage — `#weldStage`
 * — carries two halves of a CLONE of `#about`, one sliding in from each side.
 * When the two halves meet, a seam runs down the join (`.welding`), the real
 * `#about` is revealed underneath, the stage lets go, and `#process` is hidden
 * behind `.weld-past`. The divider between the two sections is suppressed for
 * the whole manoeuvre, because there is no gap to divide.
 *
 * Every one of those states is CSS that already shipped in the port
 * (src/styles/home-sections.css:1898-1952) and every one of them is gated on
 * `body.weld-live`. Nothing in the React tree was adding that class, so the
 * entire choreography was dead: `#process` stayed `position:relative`,
 * `#weldStage` was never built, and the divider showed.
 *
 * THE THREE GATES, reproduced exactly (site.js:4547):
 *   1. `(min-width:1121px)` — the frozen desktop band. Phone and tablet do
 *      not weld, and the CSS is inside the same query, so a class leaking on
 *      to a narrow viewport would still be inert; the JS gate is what stops
 *      the measuring and the rAF pump.
 *   2. `(prefers-reduced-motion: reduce)` — no-op.
 *   3. `#process` and `#about` both present — home page only.
 *
 * WHAT IS NOT THE SOURCE'S
 * ------------------------
 * Teardown. The source's IIFE runs once on a static document and never
 * unwinds; React mounts and unmounts, and a client-side navigation away from
 * `/` must not leave `weld-live` on `<body>`, a `#weldStage` in the DOM, or an
 * inline `margin-top` on a section that no longer exists. `disable()` is the
 * source's own and is called on unmount, and the cleanup below then does the
 * three things the source never had to: remove the stage, drop the listeners,
 * and hand `#about`'s `.rise` children back their transitions.
 *
 * `document.body` and `#weldStage` are outside React's tree — body's class
 * list is written to directly, and the stage is a detached DOM subtree
 * appended to body, exactly as the source builds it. `#about` and `#process`
 * ARE React-owned, but React only writes `className`/`style` when the rendered
 * value changes, and both render a constant `className="section"` and no
 * `style`, so the classes and inline properties written here survive a
 * re-render. (`weld-hide` / `weld-past` are added by this hook alone.)
 */

/* ------------------------------------------------------- the constants -- */

/** site.js:4447-4449 — all five are viewport-height fractions or 0..1 ratios.
 *  Carried across unrounded and unrenamed. */

/** The hold: how far the pinned process section rests before the doors move. */
export const REST = 0.4;
/** The shut: the distance over which the two door leaves travel to the join. */
export const SHUT = 1.2;
/** The weld: the tail after the doors meet, while the seam runs. */
export const WELD = 0.3;
/** How much of the shut the door-edge glow takes to reach full strength. */
export const EDGE_IN = 0.06;
/** Scrolling back above this fraction of the shut re-arms the seam animation. */
export const ARMD = 0.94;

/* ----------------------------------------------------------- the maths -- */

/** site.js:4452 — offset-parent chain, not `getBoundingClientRect`, because
 *  the answer must be a document coordinate that does not move while
 *  `#process` is sticky. */
export function docTop(el: HTMLElement): number {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
    y += n.offsetTop;
  }
  return y;
}

/** site.js:4453 — cubic ease-in-out. Drives the door travel only. */
export function easeIO(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ------------------------------------------------------------ the hook -- */

/**
 * Mounted from `<Process/>`, which is where the source's IIFE reads from:
 * both elements are looked up by id, exactly as `site.js:4442` does, rather
 * than threaded through refs — `#about` is a sibling component and the stage
 * clone needs the whole rendered section, not a React handle to it.
 */
export function useWeld(): void {
  useEffect(() => {
    /* site.js:4442-4443 */
    const proc = document.getElementById('process');
    const about = document.getElementById('about');
    if (!proc || !about) return;

    const mqWide = window.matchMedia('(min-width:1121px)');
    const mqCalm = window.matchMedia('(prefers-reduced-motion: reduce)');

    let stage: HTMLDivElement | null = null;
    let doorL: HTMLDivElement | null = null;
    let doorR: HTMLDivElement | null = null;
    let tilesReal: HTMLElement[] = [];
    let tilesL: HTMLElement[] = [];
    let tilesR: HTMLElement[] = [];

    /* site.js:4450 */
    let S = 0;
    let TOTAL = 1;
    let HOLD = 0;
    let SLIDE = 1;
    let TAIL = 1;
    let target = 0;

    /* site.js:4451 */
    let cur = -1;
    let on = false;
    let phase = false;
    let welded = false;
    let ticking = false;
    let armed = false;
    let loop: number | null = null;

    /** Every `.rise` inside `#about` whose transition this hook suppressed, so
     *  the suppression can be lifted on unmount. Not the source's — see the
     *  header note on teardown. */
    const riseTouched: HTMLElement[] = [];
    const killTransition = (el: HTMLElement) => {
      el.style.transition = 'none';
      el.classList.add('in');
      riseTouched.push(el);
    };

    /* site.js:4455-4465 — the clone is `aria-hidden` and stripped of every id,
       because it is a second copy of a section that is still in the document.
       Its `.rise` children are forced to their revealed state with transitions
       off: the clone is never observed by the reveal IntersectionObserver, so
       without this it would slide in as a full screen of `opacity:0`. */
    function cloneAbout(): HTMLElement {
      const c = about!.cloneNode(true) as HTMLElement;
      c.removeAttribute('id');
      c.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
      c.classList.add('weld-about');
      c.setAttribute('aria-hidden', 'true');
      c.style.marginTop = '0px';
      c.querySelectorAll<HTMLElement>('.rise').forEach((el) => {
        el.style.transition = 'none';
        el.classList.add('in');
      });
      return c;
    }

    /* site.js:4466-4488 */
    function build(): void {
      if (stage) return;
      stage = document.createElement('div');
      stage.id = 'weldStage';
      stage.setAttribute('aria-hidden', 'true');

      const leaf = (side: 'l' | 'r'): HTMLDivElement => {
        const d = document.createElement('div');
        d.className = 'weld-door weld-' + side;
        const f = document.createElement('div');
        f.className = 'weld-floor';
        const face = document.createElement('div');
        face.className = 'weld-face';
        face.appendChild(cloneAbout());
        d.appendChild(f);
        d.appendChild(face);
        return d;
      };

      doorL = leaf('l');
      doorR = leaf('r');

      const seam = document.createElement('div');
      seam.id = 'weldSeam';
      seam.innerHTML =
        '<span class="ws-glow"></span><span class="ws-run"></span><span class="ws-head"></span>';

      stage.appendChild(doorL);
      stage.appendChild(doorR);
      stage.appendChild(seam);
      document.body.appendChild(stage);

      tilesReal = Array.from(about!.querySelectorAll<HTMLElement>('.ac-tile'));
      tilesL = Array.from(doorL.querySelectorAll<HTMLElement>('.ac-tile'));
      tilesR = Array.from(doorR.querySelectorAll<HTMLElement>('.ac-tile'));

      /* The REAL about, not the clone: once the doors can show it, it must
         never be caught mid-reveal behind them. */
      about!.querySelectorAll<HTMLElement>('.rise').forEach(killTransition);
    }

    /* site.js:4489-4496 — the collage hinge (useAboutHinge) writes inline
       transforms on the real tiles every frame; the two clones copy them so
       the doors show the same fold the section behind them is in. String
       compare first: the writes are the expensive part. */
    function mirror(): void {
      for (let i = 0; i < tilesReal.length; i++) {
        const t = tilesReal[i].style.transform;
        const o = tilesReal[i].style.opacity;
        if (tilesR[i] && tilesR[i].style.transform !== t) {
          tilesR[i].style.transform = t;
          tilesL[i].style.transform = t;
        }
        if (tilesR[i] && tilesR[i].style.opacity !== o) {
          tilesR[i].style.opacity = o;
          tilesL[i].style.opacity = o;
        }
      }
    }

    /* site.js:4497 — a plain rAF pump, alive only while the doors are on. */
    function pump(): void {
      if (!on) {
        loop = null;
        return;
      }
      mirror();
      loop = requestAnimationFrame(pump);
    }

    /* site.js:4498-4511 */
    function measure(): void {
      const vh = window.innerHeight;
      const procH = proc!.offsetHeight;
      const barH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--barH'),
        ) || 0;

      /* How far up the process section may ride while pinned: never positive,
         never further than its own overflow, and never past the point where
         its padded top would slide under the fixed bar. */
      const pin = Math.min(
        0,
        Math.max(vh - procH, barH - (parseFloat(getComputedStyle(proc!).paddingTop) || 0)),
      );
      proc!.style.setProperty('--procPin', pin.toFixed(2) + 'px');

      /* Where the cloned about sits inside the door face: centred in the
         leftover height, but never more than 6vh down from the bar. */
      const slack = Math.max(0, vh - barH - about!.offsetHeight);
      target = barH + Math.min(slack / 2, vh * 0.06);

      HOLD = Math.round(vh * REST);
      SLIDE = Math.round(vh * SHUT);
      TAIL = Math.round(vh * WELD);
      TOTAL = HOLD + SLIDE + TAIL;

      /* The scroll distance the manoeuvre needs that the pinned section does
         not already provide, bought as margin above `#about`. */
      const pad = Math.max(0, TOTAL - (procH + pin - target));
      about!.style.marginTop = pad ? pad + 'px' : '';

      S = docTop(about!) - pad - procH - pin;
      if (stage) stage.style.setProperty('--weldTop', target + 'px');
    }

    /* site.js:4512-4545 */
    function frame(): void {
      ticking = false;
      const px = window.pageYOffset - S;
      if (px === cur) return;
      cur = px;

      const inPhase = px > 0 && px < TOTAL;
      if (inPhase && !stage) build();

      if (inPhase !== phase) {
        phase = inPhase;
        about!.classList.toggle('weld-hide', inPhase);
        if (inPhase) {
          proc!.classList.remove('weld-past');
          measure();
        }
      }

      if (inPhase) {
        const d = Math.max(0, Math.min(1, (px - HOLD) / SLIDE));
        if (d > 0 && !on) {
          on = true;
          stage!.classList.add('on');
          if (!loop) loop = requestAnimationFrame(pump);
        } else if (d <= 0 && on) {
          on = false;
          stage!.classList.remove('on');
        }
        if (!on) {
          proc!.classList.remove('weld-past');
          return;
        }

        const off = (1 - easeIO(d)) * 100;
        doorL!.style.transform = 'translate3d(' + (-off).toFixed(3) + '%,0,0)';
        doorR!.style.transform = 'translate3d(' + off.toFixed(3) + '%,0,0)';

        const w = Math.max(0, Math.min(1, (px - HOLD - SLIDE) / TAIL));
        const fade = Math.max(0, 1 - Math.max(0, w - 0.25) / 0.55);
        stage!.style.setProperty(
          '--edgeA',
          (d < 1 ? Math.min(1, d / EDGE_IN) : fade).toFixed(3),
        );
        stage!.style.setProperty('--seamA', (d < 1 ? 0 : fade).toFixed(3));

        if (d >= 1 && !welded) {
          welded = true;
          /* Reflow between remove and add, or the CSS animation does not
             restart on a second pass. `void offsetWidth` is the source's own. */
          stage!.classList.remove('welding');
          void stage!.offsetWidth;
          stage!.classList.add('welding');
        } else if (d < ARMD && welded) {
          welded = false;
          stage!.classList.remove('welding');
        }
        mirror();
      } else {
        if (on) {
          on = false;
          mirror();
          stage!.classList.remove('on');
        }
        proc!.classList.toggle('weld-past', px >= TOTAL);
      }
    }

    /* site.js:4546 */
    function onScroll(): void {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    }

    /* site.js:4547-4553 */
    function enable(): void {
      if (armed || !mqWide.matches || mqCalm.matches) return;
      armed = true;
      document.body.classList.add('weld-live');
      requestAnimationFrame(() => {
        measure();
        cur = -1;
        frame();
      });
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* site.js:4554-4566 */
    function disable(): void {
      if (!armed) return;
      armed = false;
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('weld-live');
      about!.classList.remove('weld-hide');
      proc!.classList.remove('weld-past');
      about!.style.marginTop = '';
      if (stage) stage.classList.remove('on', 'welding');
      on = false;
      phase = false;
      welded = false;
      cur = -1;
      if (loop) {
        cancelAnimationFrame(loop);
        loop = null;
      }
    }

    /* site.js:4567-4569 — a viewport and a half either side, because the door
       can move the section further than one screen inside a single frame. */
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting && armed) {
            build();
            measure();
            cur = -1;
            frame();
          }
        });
      },
      { rootMargin: '150% 0px 150% 0px' },
    );
    io.observe(proc);

    /* site.js:4570-4577 */
    let rt: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (rt) clearTimeout(rt);
      rt = setTimeout(() => {
        if (!mqWide.matches || mqCalm.matches) {
          disable();
          return;
        }
        enable();
        measure();
        cur = -1;
        frame();
      }, 160);
    };
    window.addEventListener('resize', onResize);

    /* site.js:4578 */
    const onWide = () => {
      if (mqWide.matches) enable();
      else disable();
    };
    mqWide.addEventListener('change', onWide);

    /* site.js:4579 */
    enable();

    /* -------------------------------------------------------- teardown -- */
    return () => {
      disable();
      io.disconnect();
      window.removeEventListener('resize', onResize);
      mqWide.removeEventListener('change', onWide);
      if (rt) clearTimeout(rt);
      if (loop) cancelAnimationFrame(loop);
      /* Even when `disable()` short-circuited on `!armed`, these three must
         still go: the class list, the stage and the padding are the only
         traces the weld leaves outside React's tree. */
      document.body.classList.remove('weld-live');
      about.classList.remove('weld-hide');
      proc.classList.remove('weld-past');
      about.style.marginTop = '';
      proc.style.removeProperty('--procPin');
      stage?.remove();
      stage = null;
      riseTouched.forEach((el) => {
        el.style.transition = '';
      });
    };
  }, []);
}
