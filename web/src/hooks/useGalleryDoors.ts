'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * The gallery door wall — a port of the engine inside the IIFE at
 * assets/site.js:2014-2330 (the gallery module runs 2014-2537; this hook owns
 * the scroll rig, not the detail overlay or the lightbox).
 *
 * WHAT WAS MISSING
 * ----------------
 * `Gallery.tsx` shipped with `const DOOR_ENGINE = false`, so `gal-static` was
 * forced on at every width and the >=1121px pinned wall never existed.
 * Measured before this landed: `#galScroll` offsetHeight was 1695 (ordinary
 * flow) where the old build reports 4747 — `Math.round(innerHeight * 5.5)` at
 * an 863px-tall viewport. `sizeRunway()` (site.js:2226) is what stretches it.
 *
 * WHAT THE ENGINE DOES
 * --------------------
 * `#galScroll` is stretched to `innerHeight * RUNWAY`, `.gal-pin` is sticky at
 * 100vh, and the eight cards run four phases off two independent scroll
 * readings:
 *
 *   gather (`gTarget`)  each card flies from an off-stage entry point into a
 *                       fanned pile, staggered by `STAGGER` per card
 *   spread (`p`)        the pile opens out to four side slots
 *   walk   (`p`)        set 0 flies past the camera (+Z) while set 1 comes up
 *                       out of the distance (-Z)
 *   fold                each door rotates on its hinge to `DOOR_ANG` as its
 *                       set passes
 *
 * PHONE / GRID
 * ------------
 * `galStatic()` (site.js:2088) reads `--galMode` back out of CSS and is true
 * for both 'phone' (<=720) and 'grid' (721-1120). Under it the source's
 * `render()` and `frame()` both bail on their first line (2245, 2310), so the
 * only thing that still runs below 1121px is `measure()`'s phone branch —
 * which clears every inline style the desktop engine may have written and
 * publishes `--cw`/`--ch`/`--colGap` for the static CSS to size cards from.
 * Those phone paths are ported here verbatim even though they are unreachable
 * from `render()`, because they are what the source contains.
 *
 * EVERY NUMBER BELOW IS THE SOURCE'S. None was chosen here.
 */

/** site.js:2050 — the wall is built in sets of four. */
const PER_SET = 4;
/** site.js:2053 — `#galScroll` is this many viewport heights tall. */
const RUNWAY = 5.5;
/** site.js:2054-2055 — the gather window, desktop and phone. */
const GATHER_FROM = 0.4,
  GATHER_TO = 1.86;
const GATHER_FROM_P = 0.3,
  GATHER_TO_P = 0.98;
/** site.js:2056-2057 — the spread window, desktop and phone. */
const SPREAD_START = 0.27,
  SPREAD_END = 0.47;
const SPREAD_START_P = 0.1,
  SPREAD_END_P = 0.88;
/** site.js:2058-2059 — phone column stagger, and the phone card's squatter aspect. */
const COL_STAG = 0.58;
const COL_SQ = 2 / 3;
/** site.js:2060 — when set 0 walks past the camera. */
const WALK_START = 0.56,
  WALK_END = 0.7;
/** site.js:2061-2062 — Z travel toward the viewer, and away from it. */
const HALL_PAST = 1150;
const HALL_FAR = 1600;
/** site.js:2063-2065 — the hinge. WALL_TILT is 0 in the source; kept, not folded away. */
const WALL_TILT = 0;
const DOOR_ANG = 78;
const DOOR_SPEED = 1.6;
/** site.js:2066 — the gap between the two rows of the spread. */
const PAIR_G = 18;
/** site.js:2077-2085 */
const SIDE_MARGIN = 0.035;
const STAGGER = 0.12;
const STACK_SC = 1.18;
const PEEK = 0.062;
const PEEK_PHONE = 0.17;
const PEEK_CARDS = [1, 2];
const MID_BAND = 0.32;
const MID_GAP = 26;
/** site.js:2230 — the glide constant, fed through the frame-rate correction. */
const SCRUB = 0.045;
/** site.js:2232 — the phone column's self-playing entrance. */
const ANIM_MS = 1600;

/**
 * site.js:2071-2076 — the four spread slots.
 *   s   scale, dir entry side, ord gather order,
 *   ed  how far off-stage the entry starts (as a fraction of stage width),
 *   ey  entry Y offset (as a fraction of stage height).
 */
const SLOTS = [
  { s: 1.0, dir: -1, ord: 0, ed: 0.6, ey: -0.16 },
  { s: 1.0, dir: -1, ord: 2, ed: 0.92, ey: 0.2 },
  { s: 1.0, dir: 1, ord: 1, ed: 0.66, ey: 0.14 },
  { s: 1.0, dir: 1, ord: 3, ed: 1.0, ey: -0.22 },
];

/** site.js:2068-2070 */
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ss = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Pos {
  x: number;
  y: number;
  rot: number;
  sc: number;
}

interface GalSet {
  el: HTMLElement;
  nodes: HTMLElement[];
  doors: HTMLElement[];
}

export function useGalleryDoors(
  scrollRef: RefObject<HTMLDivElement | null>,
  stageRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const stageEl = stageRef.current;
    /* site.js:2015-2016 — the module bails when either box is missing. */
    if (!scrollEl || !stageEl) return;
    /* Explicitly non-null: TS drops the narrowing inside the hoisted function
       declarations below, which are not arrow consts. */
    const scroll: HTMLDivElement = scrollEl;
    const stage: HTMLDivElement = stageEl;

    /*
      site.js:2197-2223 builds the sets itself; here React has already rendered
      them, so the engine reads them back. NSETS and the project count come off
      the DOM for the same reason — in the source they are
      `Math.ceil(PROJECTS.length/PER_SET)` (2051) and `PROJECTS.length` (2079).
    */
    const sets: GalSet[] = Array.from(
      stage.querySelectorAll<HTMLElement>('.gal-set'),
    ).map((el) => {
      const nodes = Array.from(el.querySelectorAll<HTMLElement>('.gal-card'));
      return {
        el,
        nodes,
        doors: nodes.map((n) => n.querySelector<HTMLElement>('.gal-door')!),
      };
    });
    const NSETS = sets.length;
    if (!NSETS) return;
    const NPROJ = sets.reduce((n, s) => n + s.nodes.length, 0);

    /** site.js:2079 */
    const GTOTAL = 1 + STAGGER * (NPROJ - 1);

    /** site.js:2086-2087 */
    const navBar = document.querySelector<HTMLElement>('header.bar');
    const mBar = document.querySelector<HTMLElement>('.mbar');
    /** site.js:2194-2195 */
    const mid = document.getElementById('galMid');
    const midActions = mid && mid.querySelector<HTMLElement>('.gal-mid-actions');

    /** site.js:2067 */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /*
      site.js:2088-2092 — the mode comes out of CSS, never out of matchMedia.
      'phone' (<=720) and 'grid' (721-1120) are treated alike: both are the
      static layout. >=1121 sets no `--galMode` at all, so the empty string
      falls through to the door engine.
    */
    const galStatic = () => {
      const m = getComputedStyle(stage.closest('#gallery') || stage)
        .getPropertyValue('--galMode')
        .trim();
      return m === 'phone' || m === 'grid';
    };

    /** site.js:2093 */
    let cw = 340,
      ch = 224,
      stackY = 0,
      bandY = 0,
      phone = false,
      M = { w: 1000, h: 700 };
    /** site.js:2224-2225 — the phone column's geometry. */
    let colSc = 1,
      colH = 0,
      colGap = 14;
    const colTop = 0;
    /* site.js:2225. Both stay 0: the block that assigns them sits after an
       unconditional `return` (see measure()). */
    const animPx = 0,
      travelMax = 0;

    /** site.js:2093-2159 */
    function measure() {
      const w = stage.clientWidth || 1000,
        h = stage.clientHeight || 700;
      phone = galStatic();
      const galEl = stage.closest('#gallery');
      if (galEl) galEl.classList.toggle('gal-static', phone);
      const navH = navBar ? navBar.offsetHeight : 0;
      const barH = (mBar && mBar.offsetHeight) || 0;
      const avail = Math.max(240, h - navH);
      bandY = navH / 2;
      const margin = Math.max(30, Math.min(132, avail * 0.135));
      const byH = (avail - 2 * margin - PAIR_G) / 2 / 0.66;
      const byW = w * (0.5 - SIDE_MARGIN - MID_BAND / 2) - MID_GAP;
      cw = phone ? Math.min(w * 0.42, 300) : Math.min(w * 0.3, byH, byW, 430);
      ch = Math.round(cw * 0.66 * (phone ? COL_SQ : 1));
      let lo = Infinity,
        hi = -Infinity;
      for (let s = 0; s < NSETS; s++)
        for (let i = 0; i < PER_SET; i++) {
          const d = PER_SET - 1 - i + s * PER_SET,
            y = -d * (ch * PEEK),
            half = (ch * STACK_SC * (1 - d * 0.022)) / 2;
          if (y - half < lo) lo = y - half;
          if (y + half > hi) hi = y + half;
        }
      stackY = bandY - (lo + hi) / 2;
      if (phone) stackY = (navH - barH) / 2;
      if (phone) {
        const vhNow = window.innerHeight;
        const colW = Math.min(w - 2 * 22, 460);
        colSc = colW / cw;
        colH = ch * colSc;
        colGap = Math.round(Math.min(18, Math.max(10, vhNow * 0.018)));
        scroll.style.height = '';
        stage.style.height = '';
        if (mid) mid.style.height = '';
        stage.querySelectorAll<HTMLElement>('.gal-card').forEach((c) => {
          c.style.transform = '';
          c.style.opacity = '';
        });
        stage.querySelectorAll<HTMLElement>('.gal-door').forEach((d) => {
          d.style.transform = '';
          d.style.boxShadow = '';
        });
        stage.querySelectorAll<HTMLElement>('.gal-meta').forEach((m) => {
          m.style.opacity = '';
        });
        if (mid) {
          mid.style.opacity = '';
          mid.style.transform = '';
        }
        const midAct = mid && mid.querySelector<HTMLElement>('.gal-mid-actions');
        if (midAct) midAct.style.opacity = '';
        stage.style.setProperty('--cw', Math.round(colW) + 'px');
        stage.style.setProperty('--ch', Math.round(colH) + 'px');
        stage.style.setProperty('--colGap', colGap + 'px');
        stage.style.setProperty('--galNavH', navH + 'px');
        stage.style.setProperty('--galBarH', barH + 'px');
        M = { w, h: vhNow };
        return;
        /*
          site.js:2139-2151 sits AFTER that `return` and is therefore dead in
          the source. It is the abandoned "phone column scrolls itself" rig —
          it is what would set colTop / colStageH / travelMax / animPx and
          re-stretch `#galScroll` on a phone. Reproduced here as a comment so
          the oddity is on the record rather than silently tidied away:

            const subEl=mid&&mid.querySelector('.section-sub');
            const copyBottom=subEl ? (subEl.offsetTop+subEl.offsetHeight) : (navH+140);
            const colAir=Math.min(30,Math.max(18,vhNow*0.03));
            colTop=Math.round(copyBottom+colAir);
            const actH=(midActions&&midActions.offsetHeight)||56;
            const foot=Math.round(actH+barH+Math.max(56,vhNow*0.082));
            colStageH=Math.round(colTop+PROJECTS.length*(colH+colGap)-colGap+foot);
            stage.style.height='';
            if(mid) mid.style.height=colStageH+'px';
            travelMax=Math.max(0,colStageH-vhNow);
            animPx=0;
            scroll.style.height=(vhNow+animPx+travelMax)+'px';
            const fanFull=(PROJECTS.length-1)*ch*PEEK_PHONE;
            stackY=colTop+colH/2-vhNow/2+fanFull;
        */
      } else {
        stage.style.height = '';
      }
      stage.style.setProperty('--cw', cw + 'px');
      stage.style.setProperty('--ch', ch + 'px');
      stage.style.setProperty('--galBandY', bandY + 'px');
      stage.style.setProperty('--galNavH', navH + 'px');
      stage.style.setProperty('--galBarH', barH + 'px');
      M = { w, h: phone ? window.innerHeight : h };
    }

    /** site.js:2160-2163 — where a card sits in the phone column. */
    function columnPos(i: number, s: number): Pos {
      const n = s * PER_SET + i;
      return { x: 0, y: colTop + n * (colH + colGap) + colH / 2 - M.h / 2, rot: 0, sc: colSc };
    }
    /** site.js:2164-2166 */
    const colOrd = (i: number, s: number) => s * PER_SET + i;
    const pileDepth = (i: number, s: number) =>
      phone ? NPROJ - 1 - colOrd(i, s) : PER_SET - 1 - i + s * PER_SET;

    /** site.js:2167-2171 — the fanned pile. */
    function stackPos(i: number, s: number): Pos {
      const d = pileDepth(i, s);
      if (phone) return { x: 0, y: stackY - d * (ch * PEEK_PHONE), rot: 0, sc: colSc };
      return { x: 0, y: stackY - d * (ch * PEEK), rot: 0, sc: STACK_SC * (1 - d * 0.022) };
    }

    /** site.js:2172-2179 — the four spread slots, two a side. */
    function sidePos(i: number): Pos {
      const s = SLOTS[i].s;
      const side = i % 2 === 0 ? -1 : 1;
      const row = i < 2 ? -1 : 1;
      const yShift = phone ? -M.h * 0.07 : 0;
      return {
        x: side * (M.w / 2 - M.w * SIDE_MARGIN - (cw * s) / 2),
        y: bandY + yShift + row * (PAIR_G / 2 + (ch * s) / 2),
        rot: 0,
        sc: s,
      };
    }

    /** site.js:2180-2189 — where a card flies in from. */
    function entryPos(i: number, s: number): Pos {
      const f = SLOTS[i],
        p = stackPos(i, s);
      /* Set 1 enters from the mirrored side of set 0. */
      const dir = s % 2 === 0 ? f.dir : -f.dir;
      if (phone) {
        const side = pileDepth(i, s) % 2 === 0 ? -1 : 1;
        const off = (M.w + cw * p.sc) / 2 + 8;
        return { x: p.x + side * off, y: p.y, rot: 0, sc: p.sc };
      }
      return {
        x: p.x + dir * (M.w * f.ed + cw * p.sc * 0.6),
        y: p.y + f.ey * M.h,
        rot: 0,
        sc: p.sc * 0.82,
      };
    }

    /** site.js:2190-2193 — per-card gather, staggered by slot order. */
    function cardGather(gRaw: number, i: number, s: number) {
      const ord = phone ? colOrd(i, s) : (NSETS - 1 - s) * PER_SET + SLOTS[i].ord;
      return ss(clamp01(gRaw * GTOTAL - ord * STAGGER));
    }

    /** site.js:2226-2229 */
    function sizeRunway() {
      if (galStatic()) {
        scroll.style.height = '';
        return;
      }
      scroll.style.height = window.innerHeight * RUNWAY + 'px';
    }

    /** site.js:2231-2233 */
    let gTarget = 0,
      gCur = 0,
      pTarget = 0,
      pCur = 0,
      raf: number | null = null,
      last = 0;
    let animT0: number | null = null,
      animQ = 0;

    /** site.js:2234-2243 — two readings off one rect: gather, and progress. */
    function readScroll() {
      const vh = window.innerHeight;
      const r = scroll.getBoundingClientRect();
      const gt = 1 - r.top / vh;
      const gF = phone ? GATHER_FROM_P : GATHER_FROM,
        gT = phone ? GATHER_TO_P : GATHER_TO;
      gTarget = reduce ? 1 : clamp01((gt - gF) / (gT - gF));
      const len = Math.max(1, scroll.offsetHeight - vh);
      pTarget = clamp01(-r.top / len);
      if (phone && animT0 === null && r.top <= 0) animT0 = performance.now();
    }

    /* site.js:2296 — `el._meta` is cached on the element itself; a WeakMap is
       the same cache without an expando. `undefined` means "never looked",
       `null` means "looked, not there" — the source distinguishes the two. */
    const metaCache = new WeakMap<HTMLElement, HTMLElement | null>();

    /** site.js:2244-2307 */
    function render() {
      if (phone) return;
      const vh = window.innerHeight;
      const gRaw = gCur,
        p = pCur;
      const sS = phone ? SPREAD_START_P : SPREAD_START,
        sE = phone ? SPREAD_END_P : SPREAD_END;
      const animFrac = animPx + travelMax > 0 ? animPx / (animPx + travelMax) : 1;
      const q = phone ? animQ : 0;
      const travel = phone
        ? clamp01((p - animFrac) / Math.max(1 - animFrac, 0.0001)) * travelMax
        : 0;
      const sPhase = phone ? q : 0;
      const spreadLin = reduce ? 1 : phone ? sPhase : clamp01((p - sS) / (sE - sS));
      const spread = reduce ? 1 : ss(spreadLin);
      const walk = phone ? 0 : ss(clamp01((p - WALK_START) / (WALK_END - WALK_START)));
      const open = spread;
      const stackAmt = 1 - spread;
      if (mid)
        mid.style.opacity = (
          phone ? clamp01((gRaw * GTOTAL - 0.04) / 0.34) : clamp01((spread - 0.72) / 0.28)
        ).toFixed(3);
      if (midActions)
        midActions.style.opacity = phone ? clamp01((spread - 0.55) / 0.45).toFixed(3) : '';
      if (mid) mid.style.transform = phone ? `translateY(${(-travel).toFixed(1)}px)` : '';
      let anySettled = false;
      for (let s = 0; s < NSETS; s++) {
        const u = walk - s;
        /* Past the camera the set accelerates toward the viewer; behind it,
           it sits further out. Under reduced motion Z is dropped for Y. */
        const z = reduce ? 0 : u >= 0 ? u * HALL_PAST : u * HALL_FAR;
        const y = reduce ? -u * vh * 1.05 : 0;
        const op = u >= 0 ? clamp01((1 - u) * 3.2) : clamp01(1 + u * 1.02);
        /* Set 0 holds still until the spread has happened. */
        const hold = s === 0 ? 1 : spread;
        const zP = phone ? 0 : z * hold,
          yP = phone ? -travel : y * hold,
          opP = phone ? 1 : lerp(1, op, hold);
        const set = sets[s];
        set.el.style.transform = `translate3d(0,${yP.toFixed(1)}px,${zP.toFixed(1)}px)`;
        set.el.style.opacity = opP.toFixed(3);
        set.el.style.visibility = opP < 0.001 ? 'hidden' : 'visible';
        set.el.style.zIndex = phone ? String(10 + s) : String(10 + Math.round(u * 5));
        const fold = reduce ? 0 : ss(clamp01(u * DOOR_SPEED));
        const settled = phone ? open > 0.96 : Math.abs(u) < 0.05 && open > 0.96;
        set.el.classList.toggle('settled', settled);
        if (settled) anySettled = true;
        set.nodes.forEach((el, i) => {
          const g = phone ? 1 : cardGather(gRaw, i, s);
          const A = entryPos(i, s),
            B = stackPos(i, s),
            D = phone ? columnPos(i, s) : sidePos(i);
          const n = s * PER_SET + i;
          const spC = phone
            ? ss(
                clamp01(
                  spreadLin * (1 + COL_STAG) - ((NPROJ - 1 - n) / (NPROJ - 1)) * COL_STAG,
                ),
              )
            : spread;
          const x = lerp(lerp(A.x, B.x, g), D.x, spC);
          const yy = lerp(lerp(A.y, B.y, g), D.y, spC);
          const sc = lerp(lerp(A.sc, B.sc, g), D.sc, spC);
          el.style.transform = `translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
          el.style.opacity = g.toFixed(3);
          if (phone && metaCache.get(el) !== null) {
            const cached = metaCache.get(el) || el.querySelector<HTMLElement>('.gal-meta');
            metaCache.set(el, cached);
            const isFront = n === NPROJ - 1;
            if (cached) cached.style.opacity = Math.max(spC, isFront ? g : 0).toFixed(3);
          }
          /* site.js:2299-2302 — only the two peeking cards carry the gold
             hairline, and it fades out as the pile opens. */
          if (PEEK_CARDS.indexOf(i) >= 0) {
            const a = stackAmt.toFixed(3);
            set.doors[i].style.boxShadow = `0 34px 80px -30px rgba(0,0,0,0.92),inset 0 0 0 3px rgba(198,166,100,${a}),0 0 0 1px rgba(198,166,100,${(stackAmt * 0.6).toFixed(3)})`;
          }
          const side = i % 2 === 0 ? -1 : 1;
          const ry = phone ? 0 : -side * (WALL_TILT * spread + (DOOR_ANG - WALL_TILT) * fold);
          set.doors[i].style.transform = `rotateY(${ry.toFixed(2)}deg)`;
        });
      }
      stage.classList.toggle('settled', anySettled);
    }

    /** site.js:2308-2328 */
    function frame(now: number) {
      raf = null;
      if (phone) return;
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
      last = now;
      readScroll();
      const f = reduce ? 1 : 1 - Math.pow(1 - SCRUB, dt * 60);
      const playing = animT0 !== null && animQ < 1;
      if (playing) {
        const raw = Math.min(1, (now - animT0!) / ANIM_MS);
        animQ = reduce ? 1 : raw;
      }
      const dg = gTarget - gCur;
      if (phone) pCur = pTarget;
      const dp = pTarget - pCur;
      if (!playing && Math.abs(dg) < 0.0002 && Math.abs(dp) < 0.0002) {
        gCur = gTarget;
        pCur = pTarget;
        render();
        return;
      }
      gCur += dg * f;
      if (!phone) pCur += dp * f;
      render();
      raf = requestAnimationFrame(frame);
    }

    /** site.js:2329 */
    function kick() {
      if (raf === null) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    /** site.js:2330 */
    window.addEventListener('scroll', kick, { passive: true });

    /** site.js:2513 */
    const onResize = () => {
      sizeRunway();
      measure();
      kick();
    };
    window.addEventListener('resize', onResize);

    /** site.js:2514-2522 */
    let ro: ResizeObserver | null = null;
    if ('ResizeObserver' in window) {
      let lastW = 0,
        lastH = 0;
      ro = new ResizeObserver(() => {
        const w = Math.round(stage.clientWidth),
          h = Math.round(stage.clientHeight);
        if (w === lastW && h === lastH) return;
        lastW = w;
        lastH = h;
        sizeRunway();
        measure();
        kick();
      });
      ro.observe(stage);
    }

    /** site.js:2523 */
    const onLoad = () => {
      sizeRunway();
      measure();
      kick();
    };
    window.addEventListener('load', onLoad);

    /** site.js:2524 */
    let fontsGone = false;
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(() => {
        if (fontsGone) return;
        measure();
        kick();
      });

    /** site.js:2529-2536 — boot waits for a measurable stage, then settles
        the engine on the current scroll position without any glide. */
    let bootTimer: ReturnType<typeof setTimeout> | null = null;
    (function boot() {
      if (!window.innerHeight || !stage.clientWidth) {
        bootTimer = setTimeout(boot, 120);
        return;
      }
      sizeRunway();
      measure();
      readScroll();
      gCur = gTarget;
      pCur = pTarget;
      render();
    })();

    return () => {
      fontsGone = true;
      if (bootTimer !== null) clearTimeout(bootTimer);
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onLoad);
      if (ro) ro.disconnect();
    };
  }, [scrollRef, stageRef]);
}
