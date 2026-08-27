'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * The services helix — a port of the IIFE at assets/site.js:454-700.
 *
 * `#helixStage` shipped in the port as an EMPTY div, so at every width above
 * 720px the services section rendered nothing: the grid is correctly
 * `display:none` there (home-sections.css) and the carousel that replaces it
 * was never built. Measured on the new build at 1440px before this landed:
 * `#helixStage` had 0 children.
 *
 * The cards themselves are React's now (Services.tsx renders eight
 * `.helix-card`s in HELIX_ORDER). This hook owns only what the source's engine
 * owned: geometry, the rAF glide, the entrance, and the three input modes.
 *
 * EVERY NUMBER BELOW IS THE SOURCE'S. None was chosen here.
 */

/** site.js:534-535 */
const ANG_STEP = 60;
const YAW_STEP = ANG_STEP * 0.9;
/** site.js:502 — the glide constant fed through the frame-rate correction. */
const SCRUB = 0.12;
/** site.js:504-508 — the entrance. */
const EN_BACK = 340;
const EN_RISE = 40;
const EN_SHRINK = 0.12;
const EN_DUR = 820;
const EN_GAP = 265;

const mod = (v: number, n: number) => ((v % n) + n) % n;

export function useServiceHelix(stageRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    /* Explicitly non-null: TS drops the narrowing inside the hoisted function
       declarations below (metrics/render/boot), which are not arrow consts. */
    const stage: HTMLDivElement = stageEl;

    const cards = Array.from(stage.querySelectorAll<HTMLElement>('.helix-card'));
    const N = cards.length;
    if (!N) return;

    const nav = document.getElementById('svcNav');
    const navBtns = nav ? Array.from(nav.querySelectorAll('button')) : [];
    const prevBtn = document.getElementById('helixPrev');
    const nextBtn = document.getElementById('helixNext');

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let target = 0;
    let cur = 0;
    let raf: number | null = null;
    let last = 0;
    let R = 280;
    let STEP = 110;

    const ENT = cards.map(() => 0);

    /* site.js:510-514 — the entrance fires outward from the front card. */
    const restD = (j: number) => (j > N / 2 ? j - N : j);
    const EN_SLOT: number[] = [];
    let slot = 0;
    cards
      .map((_, j) => j)
      .sort((a, b) => restD(b) - restD(a))
      .forEach((j) => {
        EN_SLOT[j] = Math.abs(restD(j)) < N / 2 ? slot++ : 0;
      });

    /*
      site.js:514 — `--hxMode` is READ but declared nowhere in the source, so
      the 'desktop' fallback is load-bearing. Do not add a declaration for it.
    */
    const hxMode = () =>
      getComputedStyle(stage).getPropertyValue('--hxMode').trim() || 'desktop';
    let phoneHx = false;

    /** site.js:516-531 */
    function metrics() {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      phoneHx = hxMode() === 'phone';
      if (phoneHx) {
        const w = Math.max(200, Math.min(320, r.width * 0.7));
        stage.style.setProperty('--hxW', Math.round(w) + 'px');
        stage.style.setProperty('--hxH', Math.round(w * 0.66) + 'px');
        R = Math.max(130, Math.min(250, r.width * 0.56));
        STEP = Math.max(56, Math.min(104, r.height * 0.175));
        return;
      }
      const w = Math.max(300, Math.min(470, r.width * 0.56));
      stage.style.setProperty('--hxW', Math.round(w) + 'px');
      stage.style.setProperty('--hxH', Math.round(w * 0.66) + 'px');
      R = Math.max(210, Math.min(375, r.width * 0.36));
      STEP = Math.max(96, Math.min(165, r.height * 0.26));
    }

    /** site.js:536-566 */
    function render() {
      for (let j = 0; j < N; j++) {
        let d = mod(j - cur, N);
        if (d > N / 2) d -= N;
        const th = (d * ANG_STEP * Math.PI) / 180;
        const c = (Math.cos(th) + 1) / 2;
        const x = Math.sin(th) * R;
        const z = (Math.cos(th) - 1) * R;
        const y = -d * STEP;
        const yaw = d * YAW_STEP;
        const s = 0.68 + 0.32 * c;
        const edge = Math.max(0, Math.abs(d) - 2);
        const el = cards[j];
        const en = ENT[j];
        const k = 1 - en;

        el.style.transform =
          `translate3d(${x.toFixed(1)}px,${(y - k * EN_RISE).toFixed(1)}px,` +
          `${(z - k * EN_BACK).toFixed(1)}px) rotateY(${yaw.toFixed(2)}deg) ` +
          `scale(${(s * (1 - k * EN_SHRINK)).toFixed(3)})`;

        let o = (1 - edge) * (0.92 + 0.08 * c) * en;
        let live = true;
        if (phoneHx) {
          const ad = Math.abs(d);
          const vis = ad <= 1 ? 1 : ad <= 2 ? 1 - (ad - 1) * 0.68 : Math.max(0, 0.32 * (3 - ad));
          o = Math.min(o, vis * en);
          live = ad < 1.5;
        }
        el.style.setProperty('--hxO', o.toFixed(3));
        el.style.setProperty('--hxB', (0.5 + 0.5 * c).toFixed(3));
        el.style.pointerEvents = o < 0.1 || !live ? 'none' : 'auto';
        el.classList.toggle('hx-ghost', !live);
        el.style.zIndex = String(10 + Math.round(c * 100));
        el.classList.toggle('front', Math.abs(d) < 0.5);
        el.style.setProperty('--hxDetail', Math.max(0, 1 - Math.abs(d) * 2.2).toFixed(3));
      }
    }

    /** site.js:567-576 */
    function frame(now: number) {
      raf = null;
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
      last = now;
      const f = reduce ? 1 : 1 - Math.pow(1 - SCRUB, dt * 60);
      cur += (target - cur) * f;
      if (Math.abs(target - cur) < 0.001) cur = target;
      render();
      if (cur !== target) raf = requestAnimationFrame(frame);
    }
    const kick = () => {
      if (raf === null) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    /** site.js:577-580 */
    function markActive() {
      const on = mod(Math.round(target), N);
      navBtns.forEach((b, j) => {
        b.classList.toggle('on', j === on);
        b.setAttribute('aria-selected', j === on ? 'true' : 'false');
      });
    }

    /** site.js:581-584 */
    function goTo(j: number) {
      let d = mod(j - mod(target, N), N);
      if (d > N / 2) d -= N;
      target += d;
      markActive();
      kick();
    }

    const onNext = () => { target += 1; markActive(); kick(); };
    const onPrev = () => { target -= 1; markActive(); kick(); };
    nextBtn?.addEventListener('click', onNext);
    prevBtn?.addEventListener('click', onPrev);

    const navHandlers = navBtns.map((b, j) => {
      const h = () => goTo(j);
      b.addEventListener('click', h);
      return h;
    });

    /* Clicking a card that is not the front one brings it to the front.
       site.js:473-476. */
    const cardHandlers = cards.map((el, j) => {
      const h = () => {
        if (el.classList.contains('hx-ghost')) return;
        if (!el.classList.contains('front')) goTo(j);
      };
      el.addEventListener('click', h);
      return h;
    });

    /* ---- drag: mouse AND touch. site.js:586-612 ------------------------ */
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startTarget = 0;

    const hxStep = () => {
      const w = stage.getBoundingClientRect().width || 900;
      return hxMode() === 'phone' ? Math.max(78, w * 0.34) : Math.max(180, w * 0.33);
    };
    const down = (x: number) => {
      dragging = true; moved = false; startX = x; startTarget = target;
      stage.classList.add('dragging');
    };
    const move = (x: number) => {
      if (!dragging) return;
      const dx = x - startX;
      if (Math.abs(dx) > 4) moved = true;
      target = startTarget - dx / hxStep();
      markActive();
      kick();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('dragging');
      target = Math.round(target);
      markActive();
      kick();
      if (moved) setTimeout(() => { moved = false; }, 0);
    };

    const onMouseDown = (e: MouseEvent) => { e.preventDefault(); down(e.clientX); };
    const onMouseMove = (e: MouseEvent) => move(e.clientX);
    const onTouchStart = (e: TouchEvent) => down(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX);
    const swallowClick = (e: Event) => {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    };

    stage.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', up);
    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: true });
    stage.addEventListener('touchend', up);
    stage.addEventListener('click', swallowClick, true);

    /* ---- trackpad. site.js:613-625 -------------------------------------
       {passive:false} is REQUIRED: the handler calls preventDefault(), and
       React's onWheel prop is passive, so this cannot be a JSX prop. The 2:1
       axis gate stops a vertical page scroll from spinning the carousel; the
       24px accumulator and 300ms cooldown stop one flick firing dozens of
       steps. This is the path the client reviews on a MacBook trackpad. */
    let accum = 0;
    let cooldown = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 2) return;
      e.preventDefault();
      const now = performance.now();
      accum += e.deltaX;
      if (now >= cooldown && Math.abs(accum) > 24) {
        target = Math.round(target) + (accum > 0 ? 1 : -1);
        accum = 0;
        cooldown = now + 300;
        markActive();
        kick();
      }
    };
    stage.addEventListener('wheel', onWheel, { passive: false });

    /* ---- entrance. site.js:626-656 ------------------------------------ */
    let entPlayed = false;
    let entRaf: number | null = null;
    let entT0: number | null = null;
    function entFrame(now: number) {
      if (entT0 === null) entT0 = now;
      const ms = now - entT0;
      let all = true;
      for (let j = 0; j < N; j++) {
        const u = Math.max(0, Math.min(1, (ms - EN_SLOT[j] * EN_GAP) / EN_DUR));
        if (u < 1) all = false;
        ENT[j] = 1 - Math.pow(1 - u, 3);
      }
      render();
      entRaf = all ? null : requestAnimationFrame(entFrame);
    }

    let io: IntersectionObserver | null = null;
    function watchEntrance() {
      if (entPlayed) return;
      if (reduce) { entPlayed = true; ENT.fill(1); render(); return; }
      if (typeof IntersectionObserver === 'undefined') {
        entPlayed = true; ENT.fill(1); render(); return;
      }
      io = new IntersectionObserver(
        (es) => {
          for (const e of es) {
            if (entPlayed || !e.isIntersecting) continue;
            if (e.intersectionRatio < 0.42 && e.boundingClientRect.top > 0) continue;
            entPlayed = true;
            io?.disconnect();
            entRaf = requestAnimationFrame(entFrame);
          }
        },
        { threshold: [0, 0.42] },
      );
      io.observe(stage);
    }

    /* ---- boot, with the source's retry. site.js:673-682 ---------------- */
    let booted = false;
    let tries = 0;
    let bootTimer: ReturnType<typeof setTimeout> | null = null;
    function boot() {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) {
        if (++tries < 20) bootTimer = setTimeout(boot, 150);
        return;
      }
      booted = true;
      metrics();
      cur = target;
      render();
      markActive();
      watchEntrance();
    }
    boot();

    const onResize = () => {
      if (!booted) { tries = 0; boot(); return; }
      metrics();
      render();
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      if (entRaf !== null) cancelAnimationFrame(entRaf);
      if (bootTimer) clearTimeout(bootTimer);
      io?.disconnect();
      nextBtn?.removeEventListener('click', onNext);
      prevBtn?.removeEventListener('click', onPrev);
      navBtns.forEach((b, j) => b.removeEventListener('click', navHandlers[j]));
      cards.forEach((el, j) => el.removeEventListener('click', cardHandlers[j]));
      stage.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', up);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', up);
      stage.removeEventListener('click', swallowClick, true);
      stage.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
    };
  }, [stageRef]);
}
