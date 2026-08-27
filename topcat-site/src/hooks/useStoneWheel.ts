'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import {
  MATERIALS,
  POPULAR,
  STONE_FIXES,
  STONE_WORDS,
  matLabel,
  stoneMarkup,
  type MatKey,
  type WheelStone,
} from '@/data/home/stoneWheel';

import { WHEEL_STONE_WHEEL, useCarouselSwipe } from './useCarouselSwipe';

/**
 * The stone wheel — `#wheel` on the home page, "Choose your stone".
 *
 * PORTED FROM assets/site.js:
 *   1001-1038  landingIndex / clearOpening / fanOrder — the ordering pass
 *   1039-1049  module state and constants
 *   1050-1063  buildNodes
 *   1064-1084  slabReadout / fitStoneName / showArrows / shortestOffset
 *   1085-1121  metrics / wheelBend / makeBelt
 *   1122-1157  layout / tick / startGallery
 *   1158-1173  pointer primitives
 *   1174-1194  input bindings (buttons, keys, drag, trackpad)
 *   1195-1239  primeWheel / fanOut / playAnim — the entrance
 *   1240-1255  loadMaterial
 *   1256-1261  the filter state
 *   1290-1329  the search matcher and filterStones
 *   1330-1374  syncSilicaGroup / syncChipAvailability / refreshFilterUI
 *   1376-1398  clearWheelToEmpty / restoreStoneActions / applyStoneFilter
 *   1400-1424  the filter drawer's chip / search / clear bindings
 *   1425-1442  boot, announceStone, the entrance IntersectionObserver
 *
 * WHY THIS IS IMPERATIVE
 * ----------------------
 * The wheel is a measured belt. `makeBelt()` reads `nodes[0].offsetWidth` off
 * a slab that is ALREADY IN THE DOM to work out the step, and the step
 * decides how many repetitions the belt needs — so the DOM has to be built,
 * measured, and rebuilt, in that order, three separate times (boot, material
 * switch, filter change). React state cannot express "measure the outgoing
 * nodes, then replace them"; a ref plus direct DOM writes can, and does it
 * with the source's own ordering. So the slabs are `document.createElement`d
 * here exactly as site.js:1052-1062 does, and `#wheel` is rendered empty by
 * Stones.tsx — which is also how the legacy markup ships it.
 *
 * THE DOUBLE `buildNodes()` AT BOOT IS NOT A MISTAKE. site.js:1426-1428:
 *
 *     buildNodes();                    // 1: put measurable slabs in the DOM
 *     SLABS = makeBelt(SLABS_UNIQUE);  // 2: measure nodes[0], order the belt
 *     buildNodes();                    // 3: build the real belt
 *
 * Delete the first call and `nodes[0]` is undefined, `cw` falls back to 320,
 * the step changes, the repetition count changes, and the tile count stops
 * being 67. The same ordering appears in `loadMaterial` (site.js:1244) and
 * `applyStoneFilter` (site.js:1390), where `makeBelt` deliberately measures
 * the OUTGOING material's still-attached slabs. All three are reproduced.
 *
 * WHAT REACT OWNS AND WHAT THIS OWNS
 * ----------------------------------
 * Stones.tsx renders every element with its legacy id and a STATIC
 * className/href/hidden. React only writes a DOM attribute when the prop
 * VALUE changes between renders, so a static prop is never rewritten and this
 * hook's `classList` / `href` / `hidden` / `textContent` writes survive the
 * component re-rendering (which it does, for the filter drawer's open state).
 * The one thing React drives is the drawer's `hidden` — because that is the
 * component's own `filterOpen` state — so this hook never touches it.
 */

/* --------------------------------------------------------------- constants
   site.js:1039-1043. */

/** site.js:1039 — the belt index the wheel lands on, and the slot the
 *  entrance animation grows out of. */
export const LAND = 3;
/** site.js:1014 — how many light stones `clearOpening` guarantees each side. */
export const OPEN_SPAN = 7;
/** site.js:1045 — `BEND_PX = BEND * 24` = 120. The fallback arc depth in px
 *  when `--wheelBend` is not set on `#wheel`. */
const BEND = 5;
const BEND_PX = BEND * 24;
/** site.js:1045 — the rAF glide's lerp factor toward `target`. */
const SCROLL_EASE = 0.08;
/** site.js:1045 — drag travel is multiplied by this before it becomes steps. */
const SCROLL_SPEED = 1.4;

/* ------------------------------------------------------------------ 1064 */

/** site.js:1064. */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/* ------------------------------------------------------------- 1001-1038 */

/**
 * site.js:1001-1013 — which stone the wheel should land on.
 *
 * Walk `POPULAR` in its hand-ordered sequence and take the first entry that is
 * (a) still in `list` — it may have been filtered out — and (b) not a
 * dark-tone stone. Failing that, fall back to the light stone with the fewest
 * dark neighbours within ±2.
 *
 * THE TRAP. `fanOrder` calls this as `landingIndex(list)` — ONE argument
 * (site.js:1034) — so `mat` is `undefined` inside and `POPULAR[mat||currentMat]`
 * always reads the CURRENT material, never the list's own. It makes no
 * difference today because every caller passes the current material's list,
 * but the second parameter is dead and it is preserved dead: `fanOrder` below
 * still does not pass it.
 */
export function landingIndex(
  list: WheelStone[],
  currentMat: MatKey,
  mat?: MatKey,
): number {
  const n = list.length;
  const dark = (i: number) => list[((i % n) + n) % n].tone === 'dark';
  for (const slug of POPULAR[mat || currentMat] || []) {
    const i = list.findIndex((s) => s.slug === slug);
    if (i >= 0 && !dark(i)) return i;
  }
  let best = -1;
  let score = Infinity;
  for (let i = 0; i < n; i++) {
    if (dark(i)) continue;
    let c = 0;
    for (let d = -2; d <= 2; d++) if (dark(i + d)) c++;
    if (c < score) {
      score = c;
      best = i;
    }
  }
  return best >= 0 ? best : 0;
}

/**
 * site.js:1015-1032 — clear a run of light stones around the landing stone.
 *
 * The seven slabs each side of centre are the ones a visitor actually sees, so
 * dark stones are pulled OUT of that window and re-inserted split in half at
 * the two ends of the opening. Nothing is dropped: `skipped`, `left`, `land`,
 * `right` and everything not yet used are all concatenated back.
 *
 * Two guards are the source's and both matter: a list shorter than 7, or with
 * fewer than 5 light stones, is returned untouched (there is nothing to clear
 * with), and `span` is capped at `floor((lights-1)/2)` so the walk cannot ask
 * for more light stones than exist and spin forever.
 */
export function clearOpening(
  list: WheelStone[],
  s: number,
): { list: WheelStone[]; s: number } {
  const n = list.length;
  const land = list[s];
  const lights = list.filter((x) => x.tone !== 'dark').length;
  if (n < 7 || lights < 5) return { list: list.slice(), s };
  const span = Math.min(OPEN_SPAN, Math.floor((lights - 1) / 2));
  const skipped: WheelStone[] = [];
  const left: WheelStone[] = [];
  const right: WheelStone[] = [];
  let i = s;
  let j = s;
  while (left.length < span) {
    i = ((i - 1) % n + n) % n;
    (list[i].tone === 'dark' ? skipped : left).unshift(list[i]);
  }
  while (right.length < span) {
    j = (j + 1) % n;
    (list[j].tone === 'dark' ? skipped : right).push(list[j]);
  }
  const used = new Set([...left, land, ...right, ...skipped].map((x) => x.slug));
  const rest: WheelStone[] = [];
  for (let k = 1; k <= n; k++) {
    const x = list[(j + k) % n];
    if (!used.has(x.slug)) rest.push(x);
  }
  const half = Math.ceil(skipped.length / 2);
  const belt = [...skipped.slice(half), ...left, land, ...right, ...skipped.slice(0, half), ...rest];
  return { list: belt, s: belt.indexOf(land) };
}

/**
 * Which slot the wheel parks the landing stone in.
 *
 * NOT THE SOURCE'S — the source only ever has `Math.min(LAND, n - 1)`, because
 * its belt always wraps (it repeats the list until it is wider than the wheel).
 * A belt that does NOT wrap is a fan of exactly `n` slabs with two ends, and
 * parking a 4-stone fan at slot 3 puts three of them off the left edge. Centre
 * it instead, so every stone that survived the filter is on screen.
 *
 * See `makeBelt` for why short belts stopped wrapping.
 */
export function landSlot(n: number, wraps: boolean): number {
  if (n <= 0) return 0;
  return wraps ? Math.min(LAND, n - 1) : Math.floor((n - 1) / 2);
}

/**
 * site.js:1033-1038 — rotate the cleared belt so the landing stone sits at
 * index `LAND` (3), which is where `startGallery` parks `current`.
 *
 * `slot` is this port's: a non-wrapping belt lands in the middle instead. It
 * defaults to the source's slot, so every existing caller and test is
 * unchanged.
 */
export function fanOrder(
  list: WheelStone[],
  currentMat: MatKey,
  slot?: number,
): WheelStone[] {
  if (list.length < 3) return list.slice();
  /* ONE argument — see landingIndex's trap note. */
  const { list: belt, s } = clearOpening(list, landingIndex(list, currentMat));
  const n = belt.length;
  const L = slot == null ? Math.min(LAND, n - 1) : Math.min(Math.max(slot, 0), n - 1);
  const out = new Array<WheelStone>(n);
  for (let k = 0; k < n; k++) out[(L + k) % n] = belt[(s + k) % n];
  return out;
}

/* ------------------------------------------------------- 1256-1261, 1290-1329
   The filter. */

/** site.js:1256. */
export interface StoneFilterState {
  q: string;
  tone: Set<string>;
  hue: Set<string>;
  vein: Set<string>;
  finish: Set<string>;
  silica: Set<string>;
}

export function newStoneFilter(): StoneFilterState {
  return { q: '', tone: new Set(), hue: new Set(), vein: new Set(), finish: new Set(), silica: new Set() };
}

/** site.js:1260-1261 — how many filters are active, for the button badge. */
export function sfActiveN(f: StoneFilterState): number {
  return (f.q.trim() ? 1 : 0) + f.tone.size + f.hue.size + f.vein.size + f.finish.size + f.silica.size;
}

/** site.js:1289 — the haystack cache, keyed by slug, never invalidated. */
const hayCache: Record<string, string> = {};

/**
 * site.js:1290-1297. Note the two things baked into the string: `kind` gets
 * " engineered" appended for quartz and " natural stone" for everything else
 * (so a search for "natural" can reach granite), and the silica words are
 * spelled out — dead in practice, because no record carries `silica`.
 */
export function stoneHaystack(s: WheelStone): string {
  if (hayCache[s.slug]) return hayCache[s.slug];
  const kind = (s.kind || s.mat) + (s.mat === 'Quartz' ? ' engineered' : ' natural stone');
  const sil =
    s.silica === 'free'
      ? 'silicafree lowsilica silica free'
      : s.silica === 'low'
        ? 'lowsilica low silica'
        : '';
  return (hayCache[s.slug] = [s.name, kind, s.tone, s.hue, s.vein, s.finish, s.stone, sil]
    .join(' ')
    .toLowerCase());
}

/** site.js:1298-1302 — one-deletion fuzzy match, terms of 5+ characters only. */
export function nearlyIn(hay: string, t: string): boolean {
  if (t.length < 5) return false;
  for (let i = 0; i < t.length; i++) {
    if (hay.includes(t.slice(0, i) + t.slice(i + 1))) return true;
  }
  return false;
}

/** site.js:1303-1308. A synonym rule wins over fuzzy matching, and a literal
 *  substring hit wins over both. */
export function termHits(hay: string, raw: string): boolean {
  const t = STONE_FIXES[raw] || raw;
  if (hay.includes(t)) return true;
  const rule = STONE_WORDS[t];
  if (rule) return rule.split(' ').every((grp) => grp.split('|').some((w) => hay.includes(w)));
  return nearlyIn(hay, t) || nearlyIn(hay, raw);
}

/** site.js:1309-1312. */
export function matchStone(s: WheelStone, terms: string[]): boolean {
  const hay = stoneHaystack(s);
  return terms.every((t) => termHits(hay, t));
}

/**
 * site.js:1313-1329.
 *
 * The query normaliser here is NOT the collection page's `normaliseQuery` in
 * lib/stones.ts — this one also glues the three silica phrasings, which that
 * one does not. Both are the source's; they are genuinely different functions.
 *
 * The `silica` clause can never pass while a silica chip is on, because no
 * record has the field. That is the live behaviour (and why `syncSilicaGroup`
 * hides the whole group), not a porting slip.
 */
export function filterStones(list: WheelStone[], stoneFilter: StoneFilterState): WheelStone[] {
  const q = stoneFilter.q
    .trim()
    .toLowerCase()
    .replace(/\b(marble|stone)\s+(effect|look|style)\b/g, '$1$2')
    .replace(/\blow\s+maintenance\b/g, 'lowmaintenance')
    .replace(/\bsilica[\s-]*free\b/g, 'silicafree')
    .replace(/\bfree[\s-]*of[\s-]*silica\b/g, 'silicafree')
    .replace(/\blow[\s-]*silica\b/g, 'lowsilica')
    .replace(/\boff[\s-]white\b/g, 'offwhite');
  const terms = q ? q.split(/[\s,]+/).filter(Boolean) : [];
  return list.filter(
    (s) =>
      (!terms.length || matchStone(s, terms)) &&
      (!stoneFilter.tone.size || stoneFilter.tone.has(s.tone)) &&
      (!stoneFilter.hue.size || stoneFilter.hue.has(s.hue)) &&
      (!stoneFilter.vein.size || stoneFilter.vein.has(s.vein)) &&
      (!stoneFilter.finish.size ||
        [...stoneFilter.finish].some((f) => (s.finish || '').toLowerCase().includes(f))) &&
      (!stoneFilter.silica.size ||
        !!(
          s.silica &&
          (stoneFilter.silica.has(s.silica) ||
            (s.silica === 'free' && stoneFilter.silica.has('low')))
        )),
  );
}

/* ------------------------------------------------------------------ hook */

/** What the shared swipe engine calls back into. Set by the effect below and
 *  nulled on teardown, so a stray listener during unmount is a no-op. */
interface WheelApi {
  isOn: () => boolean;
  dragStart: () => void;
  dragMove: (dx: number) => void;
  dragEnd: () => void;
  step: (dir: 1 | -1) => void;
}

/**
 * Attach the wheel.
 *
 * @param rootRef  `#stones` — the section. Everything else is found inside it
 *                 by the legacy id, the way site.js finds it in `document`.
 * @returns        the ref to put on `#wheel`.
 */
export function useStoneWheel(
  rootRef: RefObject<HTMLElement | null>,
): RefObject<HTMLDivElement | null> {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<WheelApi | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const wheel = wheelRef.current;
    if (!root || !wheel) return;

    /* site.js:1046-1047 — the DOM handles, by id. */
    const readout = root.querySelector<HTMLDivElement>('#readout');
    const prevBtn = root.querySelector<HTMLButtonElement>('#prev');
    const nextBtn = root.querySelector<HTMLButtonElement>('#next');
    if (!readout || !prevBtn || !nextBtn) return;
    const matBtns = Array.from(
      root.querySelectorAll<HTMLElement>('#matTabs .mat-tab[data-mat]'),
    );
    /* site.js:1065 and 1375 — the same element under two names. */
    const stoneViewBtn = root.querySelector<HTMLAnchorElement>('#stoneView');
    /* site.js:1257-1259. `sfBtn` is NOT taken: React owns the drawer's open
       state (Stones.tsx `filterOpen`), so the open/close half of
       site.js:1401-1406 is not ported here. */
    const sfPanel = root.querySelector<HTMLElement>('#stoneFilter');
    const sfSearch = root.querySelector<HTMLInputElement>('#sfSearch');
    const sfCountEl = root.querySelector<HTMLElement>('#sfCount');
    const sfBadgeEl = root.querySelector<HTMLElement>('#sfBadge');
    const sfClear = root.querySelector<HTMLElement>('#sfClear');
    const stoneEstBtn = root.querySelector<HTMLElement>('#stoneEst');
    const stoneAskBtn = root.querySelector<HTMLElement>('#stoneAsk');

    /* ------------------------------------------------ site.js:1035-1049
       Module state. These are the source's module-scope `let`s; the effect
       closure is this port's module scope. */
    let currentMat: MatKey = 'Quartz';
    let SLABS_UNIQUE: WheelStone[] = MATERIALS[currentMat];
    let SLABS: WheelStone[] = SLABS_UNIQUE;
    let wheelPlayed = false;
    let galleryOn = false;
    let target = 0;
    let current = 0;
    let idx = LAND;
    let moved = false;
    let dragStartTarget = 0;
    let nodes: HTMLDivElement[] = [];
    let animTimers: ReturnType<typeof setTimeout>[] = [];
    let bendCache: number | null = null;
    /* Not the source's: it always wraps. Refreshed by every `metrics()` call,
       which `layout` makes once a frame, and read by `tick`'s end-stops. */
    let beltWrap = true;
    /* site.js:1158. Set only by the `?stone=` deep-link at site.js:4600,
       which is a different section and is not in this hook's scope — so it
       stays null here. Kept because startGallery reads it. */
    const pendingIdx: number | null = null;
    const stoneFilter = newStoneFilter();
    /* Not in the source: React can unmount this section, and the source's
       rAF loop and timers have no stop. */
    let rafId = 0;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    /* ------------------------------------------------- site.js:1050-1063 */
    function buildNodes() {
      wheel!.querySelectorAll('.slab').forEach((n) => n.remove());
      nodes = SLABS.map((s, i) => {
        const el = document.createElement('div');
        el.className = 'slab';
        el.dataset.i = String(i);
        el.innerHTML =
          `<div class="stone">${stoneMarkup(s)}</div>` +
          `<div class="glass"></div>` +
          `<span class="name">${s.name}</span>`;
        el.addEventListener('click', () => {
          if (moved || !galleryOn) return;
          const off = shortestOffset(i);
          /* Clicking the CENTRED slab opens it; clicking any other one just
             brings it to the centre. site.js:1057-1060. The `.html` leaf is
             the legacy URL and is what every other stone link in this build
             uses (StoneTile -> collection.tiles[].href). */
          if (off === 0) {
            location.href = '/stones/' + s.slug + '.html';
            return;
          }
          target = Math.round(target) + off;
        });
        wheel!.appendChild(el);
        return el;
      });
    }

    /* ------------------------------------------------- site.js:1066-1072 */
    function slabReadout(i: number) {
      const s = SLABS[i];
      if (!s) return;
      readout!.innerHTML =
        `<div class="r-mat">${s.kind || s.mat}</div>` +
        `<div class="r-name"><span>${s.name}</span></div>` +
        /* site.js:1068 — a constant string, the same under every stone. */
        `<div class="r-sup">Fitted with a ten-year guarantee</div>`;
      fitStoneName(readout!.querySelector<HTMLElement>('.r-name'));
      if (stoneViewBtn) stoneViewBtn.href = `/stones/${s.slug}.html`;
    }

    /**
     * site.js:1073-1082 — shrink a long stone name until it fits two lines.
     * Steps down 1px at a time and gives up at 60% of the base size, so a
     * pathological name gets small but never invisible.
     */
    function fitStoneName(el: HTMLElement | null) {
      if (!el) return;
      el.style.fontSize = '';
      const sp = el.firstElementChild;
      if (!sp) return;
      const base = parseFloat(getComputedStyle(el).fontSize) || 26;
      const lines = () => {
        const lh = parseFloat(getComputedStyle(el).lineHeight) || base * 1.15;
        return Math.round(sp.getBoundingClientRect().height / lh);
      };
      for (let fs = base; lines() > 2 && fs > base * 0.6; ) {
        fs -= 1;
        el.style.fontSize = fs + 'px';
      }
    }

    /* site.js:1083 — the arrows are invisible AND click-through until the
       entrance animation has finished. */
    function showArrows(on: boolean) {
      const v = on ? '1' : '0';
      const p = on ? 'auto' : 'none';
      prevBtn!.style.opacity = v;
      nextBtn!.style.opacity = v;
      prevBtn!.style.pointerEvents = p;
      nextBtn!.style.pointerEvents = p;
    }

    /* site.js:1084 — signed distance to slab `i` the short way round. On a
       flat belt there is no way round: the distance is just the difference. */
    function shortestOffset(i: number) {
      const n = SLABS.length;
      if (!beltWrap) return i - Math.min(Math.max(Math.round(current), 0), n - 1);
      let d = mod(i - mod(Math.round(current), n), n);
      if (d > n / 2) d -= n;
      return d;
    }

    /* ------------------------------------------------- site.js:1085-1103
       The geometry. Desktop (≥1121px) sizes the step from the space actually
       available between the rail and the centre line; every narrower band
       falls back to three competing minimums. */
    function stepFor() {
      const cw = (nodes[0] && nodes[0].offsetWidth) || 320;
      const W = wheel!.clientWidth || 1200;
      if (window.matchMedia('(min-width:1121px)').matches) {
        const stageW = (wheel!.parentElement && wheel!.parentElement.clientWidth) || W;
        const railW =
          parseFloat(getComputedStyle(wheel!.parentElement!).getPropertyValue('--railW')) || 190;
        const stonesPad = parseFloat(getComputedStyle(root!).paddingLeft) || 0;
        const allowed = Math.max(stageW / 2 - railW - 28 + stonesPad, cw * 1.2);
        return Math.max((allowed - cw / 2) / 3, cw * 0.42);
      }
      /* The source has a third term here, `(W + cw * 2) / SLABS.length`, which
         inflates the step until the belt is wide enough to wrap unseen. It is
         inert for any list long enough to fill the wheel and it is exactly
         wrong for one that is not — with a single match it makes the step a
         whole viewport wide. `wrapsAt` below now decides the same question
         honestly, so the term is gone. site.js:1103. */
      return Math.max(cw * 0.52, W * 0.085);
    }

    /**
     * Is the belt long enough to hide its own seam?
     *
     * The wheel is a circle: `layout` wraps each slab's x into +/- half a belt,
     * so slab 0 reappears one belt-width away. That is invisible only while a
     * belt is wider than the wheel plus a slab either side. The source keeps it
     * true by repeating the list; this build does not repeat (see `makeBelt`),
     * so a short belt is laid out flat instead and the answer has to be asked.
     */
    function wrapsAt(n: number, step: number) {
      const cw = (nodes[0] && nodes[0].offsetWidth) || 320;
      const W = wheel!.clientWidth || 1200;
      return n * step >= W + cw * 2;
    }

    function metrics() {
      const step = stepFor();
      const H = Math.max(wheel!.clientWidth / 2, 1);
      const bend = wheelBend();
      /* Sagitta -> radius: a chord of half-width H bulging `bend` deep. */
      const R = (H * H + bend * bend) / (2 * bend);
      beltWrap = wrapsAt(SLABS.length, step);
      return { step, H, R, wrap: beltWrap };
    }

    /** The slot `startGallery`, `primeWheel`, `fanOut` and `playAnim` all park
     *  on. One function so they cannot disagree — they read the same belt. */
    function landIdx() {
      return landSlot(SLABS.length, wrapsAt(SLABS.length, stepFor()));
    }

    /* site.js:1104-1111 — cached, and the cache is dropped on resize. */
    function wheelBend() {
      if (bendCache === null) {
        const v = parseFloat(getComputedStyle(wheel!).getPropertyValue('--wheelBend'));
        bendCache = isFinite(v) && v > 0 ? v : BEND_PX;
      }
      return bendCache;
    }

    /**
     * The belt is the matching stones, once each.
     *
     * DELIBERATELY NOT site.js:1112-1121. The source orders the list and then
     * REPEATS it until the belt is wider than the wheel plus a slab either
     * side, which is invisible on the full 67-stone collection (one repetition
     * covers it) and absurd on a filtered one: the client filtered down to a
     * single Azul Shimmer on 27 Aug and got a wheel of nine Azul Shimmers.
     * His rule, and it is the obvious one — "we don't duplicate any stones in
     * the wheel, the amount that's available is what we show".
     *
     * So the ordered list IS the belt, at every width. A belt too short to
     * fill the wheel stops wrapping instead of repeating: see `wrapsAt`, and
     * the `wrap` branches in `layout`, `fanOut`, `shortestOffset` and `tick`.
     *
     * It still measures `nodes[0]`, which is STILL THE OLD MATERIAL'S SLAB —
     * every caller builds nodes first and rebuilds after — because `fanOrder`
     * now needs the landing slot and that needs the step. Same order as the
     * source, same reason.
     */
    function makeBelt(list: WheelStone[]): WheelStone[] {
      if (!list.length) return [];
      return fanOrder(list, currentMat, landSlot(list.length, wrapsAt(list.length, stepFor())));
    }

    /**
     * site.js:1122-1145 — place every slab for a fractional belt position.
     *
     * Each slab is pushed along a circular arc: `x` is its distance from the
     * centre wrapped into ±half a belt, `arc` is how far the circle has
     * dropped at that x, `rot` is the tangent angle, and the scale/lift/dim
     * are all distance falloffs. `fade` only applies to an EVEN-length belt,
     * where the wrap-around slab would otherwise pop at the seam.
     */
    function layout(pos: number) {
      const n = SLABS.length;
      const { step, H, R, wrap } = metrics();
      const total = n * step;
      nodes.forEach((el, i) => {
        let x = (i - pos) * step;
        /* A short belt is a flat fan, not a circle — wrapping it would bring
           its far end round into view beside its near one, which is the
           duplicate `makeBelt` just stopped producing. */
        if (wrap) x = mod(x + total / 2, total) - total / 2;
        const ax = Math.min(Math.abs(x), H);
        const arc = R - Math.sqrt(Math.max(R * R - ax * ax, 0));
        const rot = Math.sign(x) * Math.asin(ax / R) * (180 / Math.PI);
        const d = Math.abs(x) / H;
        const near = Math.max(0, 1 - Math.abs(x) / (step * 0.9));
        const sc = (1 - Math.min(d, 1) * 0.14) * (1 + near * 0.09);
        const lift = near * -8;
        const op = Math.abs(x) > H * 1.3 ? 0 : 1;
        const stepsOut = Math.abs(x) / step;
        const br = Math.min(
          1,
          stepsOut <= 3 ? 1 - 0.22 * stepsOut : Math.max(0.18, 0.34 - 0.16 * (stepsOut - 3)),
        );
        /* The seam fade only means anything on a belt that HAS a seam. */
        const fade =
          wrap && n % 2 === 0
            ? Math.max(0, Math.min(1, (total / 2 - step * 0.5 - Math.abs(x)) / (step * 0.5)))
            : 1;
        const vis = op * fade;
        el.style.transform = `translate3d(${x.toFixed(1)}px,${(arc + lift).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        el.style.opacity = vis.toFixed(3);
        el.style.setProperty('--dim', br.toFixed(3));
        el.style.zIndex = String(Math.round(100 - d * 50 + near * 40));
        el.style.pointerEvents = vis < 0.15 ? 'none' : 'auto';
        el.classList.toggle('center', near > 0.5);
      });
      const c = wrap
        ? mod(Math.round(pos), n)
        : Math.min(Math.max(Math.round(pos), 0), n - 1);
      if (c !== idx) {
        idx = c;
        slabReadout(idx);
      }
    }

    /* site.js:1146-1152 — the glide. `current` chases `target` at 8% a frame
       and snaps when it is within half a thousandth of a slab. The loop runs
       forever in the source; here it is cancelled on teardown. */
    function tick() {
      if (galleryOn) {
        /* End-stops. A wrapping belt has none — `target` runs off to any
           integer and `layout` folds it back — but a flat one does, or an
           arrow press and a drag both walk the fan off the screen. */
        if (!beltWrap) target = Math.min(Math.max(target, 0), SLABS.length - 1);
        current += (target - current) * SCROLL_EASE;
        if (Math.abs(target - current) < 0.0005) current = target;
        layout(current);
      }
      rafId = requestAnimationFrame(tick);
    }

    /* site.js:1159-1164 */
    function startGallery() {
      if (!SLABS.length) return;
      galleryOn = true;
      wheel!.classList.add('gallery');
      /* One stone is the whole collection: there is nowhere for an arrow to
         go, so it is not offered. */
      showArrows(SLABS.length > 1);
      target = current = landIdx();
      layout(current);
      slabReadout(idx);
      if (pendingIdx != null) {
        target = Math.round(target) + shortestOffset(pendingIdx);
      }
    }

    /* ------------------------------------------------- site.js:1195-1216
       The entrance. Everything stacked at the centre slot, invisible. */
    function primeWheel() {
      showArrows(false);
      const L = landIdx();
      nodes.forEach((el, i) => {
        el.classList.remove('center');
        if (i === L) {
          el.style.transform = 'translate3d(0,150px,0) scale(0.86)';
          el.style.zIndex = '30';
        } else {
          el.style.transform = 'translate3d(0,0,0) scale(0.6)';
          el.style.zIndex = '1';
        }
        el.style.opacity = '0';
      });
      slabReadout(L);
      idx = L;
    }

    /**
     * site.js:1217-1236 — the fan.
     *
     * This is `layout()` at position L with ONE difference, and it is the
     * source's: the even-length `fade` divides by `n*step/2` written out
     * longhand instead of `total/2`. Same value; kept as two functions
     * because the source keeps them as two.
     */
    function fanOut() {
      const n = SLABS.length;
      const { step, H, R, wrap } = metrics();
      const L = landIdx();
      nodes.forEach((el, i) => {
        let off = i - L;
        if (wrap) {
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
        }
        const x = off * step;
        const ax = Math.min(Math.abs(x), H);
        const arc = R - Math.sqrt(Math.max(R * R - ax * ax, 0));
        const rot = Math.sign(x) * Math.asin(ax / R) * (180 / Math.PI);
        const d = Math.abs(x) / H;
        const near = Math.max(0, 1 - Math.abs(x) / (step * 0.9));
        const sc = (1 - Math.min(d, 1) * 0.14) * (1 + near * 0.09);
        const lift = near * -8;
        const op = Math.abs(x) > H * 1.3 ? 0 : 1;
        const stepsOut = Math.abs(x) / step;
        const br = Math.min(
          1,
          stepsOut <= 3 ? 1 - 0.22 * stepsOut : Math.max(0.18, 0.34 - 0.16 * (stepsOut - 3)),
        );
        const fade =
          wrap && n % 2 === 0
            ? Math.max(0, Math.min(1, (n * step / 2 - step * 0.5 - Math.abs(x)) / (step * 0.5)))
            : 1;
        el.style.transform = `translate3d(${x.toFixed(1)}px,${(arc + lift).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        el.style.opacity = (op * fade).toFixed(3);
        el.style.setProperty('--dim', br.toFixed(3));
        el.style.zIndex = String(Math.round(100 - d * 50 + near * 40));
        el.classList.toggle('center', near > 0.5);
      });
    }

    /* site.js:1237 */
    function clearAnim() {
      animTimers.forEach(clearTimeout);
      animTimers = [];
    }

    /* site.js:1238-1246 — the centre slab rises first, the rest fan out at
       850ms, and the wheel becomes interactive at 1900ms. The two numbers are
       the source's and are longer than the CSS transitions they gate. */
    function playAnim() {
      clearAnim();
      wheel!.classList.add('entering');
      const c = nodes[landIdx()];
      if (!c) return;
      c.style.transform = 'translate3d(0,0,0) scale(0.86)';
      c.style.opacity = '1';
      c.style.zIndex = '30';
      animTimers.push(setTimeout(fanOut, 850));
      animTimers.push(
        setTimeout(() => {
          wheel!.classList.remove('entering');
          startGallery();
        }, 1900),
      );
    }

    function playWheel() {
      if (wheelPlayed) return;
      wheelPlayed = true;
      playAnim();
    }

    /* ------------------------------------------------- site.js:1247-1259
       Switching material. Note the order: the belt is measured off the
       OUTGOING nodes (they are still attached), and only then rebuilt. */
    function loadMaterial(mat: MatKey) {
      currentMat = mat;
      wheelPlayed = true;
      matBtns.forEach((b) => b.classList.toggle('on', b.dataset.mat === mat));
      SLABS_UNIQUE = filterStones(MATERIALS[mat], stoneFilter);
      SLABS = makeBelt(SLABS_UNIQUE);
      refreshFilterUI();
      galleryOn = false;
      clearAnim();
      wheel!.classList.remove('gallery', 'dragging', 'entering');
      if (!SLABS.length) {
        clearWheelToEmpty();
        return;
      }
      restoreStoneActions();
      buildNodes();
      target = current = landIdx();
      primeWheel();
      /* Two nested rAFs, not one: the first lets the browser commit the
         primed transforms, the second starts the animation from them so the
         entrance transition has something to interpolate FROM. */
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!disposed) playAnim();
        }),
      );
    }

    /* ------------------------------------------------- site.js:1330-1345
       The silica group. `has.free`/`has.low` are computed from the data, and
       NO record carries `silica`, so both are false and the whole `.sf-group`
       is hidden on every material. That is the live behaviour. */
    function syncSilicaGroup() {
      if (!sfPanel) return;
      const grp = sfPanel.querySelector<HTMLElement>('.sf-chips[data-f="silica"]');
      if (!grp) return;
      const list = MATERIALS[currentMat] || [];
      const has: Record<string, boolean> = {
        free: list.some((s) => s.silica === 'free'),
        low: list.some((s) => s.silica === 'free' || s.silica === 'low'),
      };
      let any = false;
      grp.querySelectorAll<HTMLElement>('.sf-chip').forEach((c) => {
        const on = !!has[c.dataset.v ?? ''];
        c.hidden = !on;
        if (on) any = true;
        if (!on && c.classList.contains('on')) {
          c.classList.remove('on');
          stoneFilter.silica.delete(c.dataset.v ?? '');
        }
      });
      const box = grp.closest<HTMLElement>('.sf-group');
      if (box) box.hidden = !any;
    }

    /* site.js:1346-1367 — grey out a chip that would return nothing GIVEN the
       other chips already on. An already-on chip is never disabled, so a
       filter can always be taken back off. */
    function syncChipAvailability() {
      if (!sfPanel) return;
      const list = MATERIALS[currentMat] || [];
      sfPanel.querySelectorAll<HTMLElement>('.sf-chips').forEach((g) => {
        const f = g.dataset.f as 'tone' | 'hue' | 'vein' | 'finish' | 'silica';
        g.querySelectorAll<HTMLButtonElement>('.sf-chip').forEach((c) => {
          if (c.hidden) return;
          if (c.classList.contains('on')) {
            c.disabled = false;
            return;
          }
          const v = c.dataset.v ?? '';
          c.disabled = !list.some((s) => {
            if (
              f === 'finish'
                ? !(s.finish || '').toLowerCase().includes(v)
                : (s as unknown as Record<string, string>)[f] !== v
            )
              return false;
            for (const k of ['tone', 'hue', 'vein', 'finish'] as const) {
              if (k === f || !stoneFilter[k].size) continue;
              const hit =
                k === 'finish'
                  ? [...stoneFilter[k]].some((x) => (s.finish || '').toLowerCase().includes(x))
                  : stoneFilter[k].has((s as unknown as Record<string, string>)[k]);
              if (!hit) return false;
            }
            return true;
          });
        });
      });
    }

    /* site.js:1368-1374 */
    function refreshFilterUI() {
      syncSilicaGroup();
      syncChipAvailability();
      const total = MATERIALS[currentMat].length;
      const act = sfActiveN(stoneFilter);
      if (sfBadgeEl) {
        sfBadgeEl.hidden = !act;
        sfBadgeEl.textContent = act ? String(act) : '';
      }
      if (sfCountEl)
        sfCountEl.textContent = SLABS_UNIQUE.length
          ? `Showing ${SLABS_UNIQUE.length} of ${total}`
          : `No matches in ${matLabel(currentMat)}`;
      if (sfPanel) sfPanel.classList.toggle('sf-empty', !SLABS_UNIQUE.length);
    }

    /* site.js:1376-1386 — nothing matches: strip the belt, say so in the
       readout, and make "View this stone" inert rather than wrong. */
    function clearWheelToEmpty() {
      galleryOn = false;
      clearAnim();
      wheel!.classList.remove('gallery', 'entering', 'dragging');
      wheel!.querySelectorAll('.slab').forEach((el) => el.remove());
      nodes = [];
      readout!.innerHTML =
        `<div class="r-mat">${matLabel(currentMat)}</div>` +
        `<div class="r-name">No stones match</div>` +
        `<div class="r-sup">Clear a filter or try another material</div>`;
      showArrows(false);
      if (stoneViewBtn) {
        stoneViewBtn.style.opacity = '0.4';
        stoneViewBtn.style.pointerEvents = 'none';
      }
    }

    /* site.js:1387-1389 */
    function restoreStoneActions() {
      if (stoneViewBtn) {
        stoneViewBtn.style.opacity = '';
        stoneViewBtn.style.pointerEvents = '';
      }
    }

    /* site.js:1390-1398 — same measure-then-rebuild order as loadMaterial.
       If the entrance has already played the wheel goes straight back to the
       gallery; if it has not, it is re-primed and waits. */
    function applyStoneFilter() {
      SLABS_UNIQUE = filterStones(MATERIALS[currentMat], stoneFilter);
      SLABS = makeBelt(SLABS_UNIQUE);
      refreshFilterUI();
      if (!SLABS.length) {
        clearWheelToEmpty();
        return;
      }
      restoreStoneActions();
      clearAnim();
      wheel!.classList.remove('entering');
      buildNodes();
      if (wheelPlayed) {
        wheel!.classList.remove('gallery');
        startGallery();
      } else primeWheel();
    }

    /* site.js:1399-1400 */
    function clearStoneFilters() {
      stoneFilter.q = '';
      if (sfSearch) sfSearch.value = '';
      stoneFilter.tone.clear();
      stoneFilter.hue.clear();
      stoneFilter.vein.clear();
      stoneFilter.finish.clear();
      stoneFilter.silica.clear();
      if (sfPanel)
        sfPanel.querySelectorAll('.sf-chip.on').forEach((c) => c.classList.remove('on'));
    }

    /* site.js:1429-1434 — tell the CTA form which stone is centred. The chip
       in ContactForm.tsx reads `name`, `mat` and `kind`; the rest of the
       payload is carried because the source carries it. `sup` is not in the
       dataset — see data/home/stoneWheel.ts. */
    function announceStone() {
      const s = SLABS[idx];
      if (!s) return;
      document.dispatchEvent(
        new CustomEvent('topcat:stone', {
          detail: {
            name: s.name,
            mat: s.mat,
            kind: s.kind,
            stone: s.stone,
            seed: s.seed,
            slug: s.slug,
          },
        }),
      );
    }

    /* =============================================== site.js:1174-1194
       Input. */

    const onNext = () => {
      if (galleryOn) target = Math.round(target) + 1;
    };
    const onPrev = () => {
      if (galleryOn) target = Math.round(target) - 1;
    };
    nextBtn.addEventListener('click', onNext);
    prevBtn.addEventListener('click', onPrev);
    cleanups.push(() => {
      nextBtn.removeEventListener('click', onNext);
      prevBtn.removeEventListener('click', onPrev);
    });

    /* site.js:1179 — on window, not the wheel: the wheel is not focusable. */
    const onKey = (e: KeyboardEvent) => {
      if (!galleryOn) return;
      if (e.key === 'ArrowRight') target = Math.round(target) + 1;
      if (e.key === 'ArrowLeft') target = Math.round(target) - 1;
    };
    window.addEventListener('keydown', onKey);
    cleanups.push(() => window.removeEventListener('keydown', onKey));

    /**
     * site.js:1165-1173, 1181-1191 — drag and trackpad, delegated to the
     * shared engine (useCarouselSwipe below, `drag: 'raw'` +
     * WHEEL_STONE_WHEEL). This object is what it calls into.
     *
     * `dragMove` is the source's `pointerMove`: travel is divided by the
     * CURRENT step (re-measured every move, as the source does) and
     * multiplied by SCROLL_SPEED, so a drag moves the belt 1.4 slabs per slab
     * of finger travel. 4px of travel sets `moved`, which is what stops a
     * drag ending in a navigation.
     */
    apiRef.current = {
      isOn: () => galleryOn,
      dragStart: () => {
        moved = false;
        dragStartTarget = target;
      },
      dragMove: (dx) => {
        const { step } = metrics();
        if (Math.abs(dx) > 4) moved = true;
        target = dragStartTarget - (dx / step) * SCROLL_SPEED;
      },
      /* site.js:1163 — release snaps to the nearest whole slab. */
      dragEnd: () => {
        target = Math.round(target);
      },
      step: (dir) => {
        target = Math.round(target) + dir;
      },
    };
    cleanups.push(() => {
      apiRef.current = null;
    });

    /* site.js:1401-1424 — the filter drawer's chips, search box and clear.
       The drawer's own open/close is React's (Stones.tsx `filterOpen`), so
       site.js:1401-1406 is deliberately not ported. */
    if (sfPanel) {
      sfPanel.querySelectorAll<HTMLElement>('.sf-chips').forEach((g) => {
        const key = g.dataset.f as keyof StoneFilterState;
        g.querySelectorAll<HTMLElement>('.sf-chip').forEach((ch) => {
          const onChip = () => {
            const v = ch.dataset.v ?? '';
            const set = stoneFilter[key];
            if (!(set instanceof Set)) return;
            if (set.has(v)) set.delete(v);
            else set.add(v);
            ch.classList.toggle('on');
            applyStoneFilter();
          };
          ch.addEventListener('click', onChip);
          cleanups.push(() => ch.removeEventListener('click', onChip));
        });
      });
      if (sfSearch) {
        const onInput = () => {
          stoneFilter.q = sfSearch.value;
          applyStoneFilter();
        };
        sfSearch.addEventListener('input', onInput);
        cleanups.push(() => sfSearch.removeEventListener('input', onInput));
      }
      if (sfClear) {
        const onClear = () => {
          clearStoneFilters();
          applyStoneFilter();
        };
        sfClear.addEventListener('click', onClear);
        cleanups.push(() => sfClear.removeEventListener('click', onClear));
      }
    }

    /* site.js:1247 (the tabs' own binding, at the end of loadMaterial). */
    matBtns.forEach((b) => {
      const onTab = () => loadMaterial(b.dataset.mat as MatKey);
      b.addEventListener('click', onTab);
      cleanups.push(() => b.removeEventListener('click', onTab));
    });

    /* site.js:1425 — a resize invalidates the measured bend and re-lays out,
       or re-primes if the entrance has not run yet. */
    const onResize = () => {
      bendCache = null;
      if (galleryOn) layout(current);
      else if (!wheelPlayed) primeWheel();
    };
    window.addEventListener('resize', onResize);
    cleanups.push(() => window.removeEventListener('resize', onResize));

    /* ================================================ site.js:1426-1442
       BOOT. The order is exact — see the header note on the double build. */
    buildNodes();
    SLABS = makeBelt(SLABS_UNIQUE);
    buildNodes();
    rafId = requestAnimationFrame(tick);

    if (stoneEstBtn) {
      stoneEstBtn.addEventListener('click', announceStone);
      cleanups.push(() => stoneEstBtn.removeEventListener('click', announceStone));
    }
    if (stoneAskBtn) {
      stoneAskBtn.addEventListener('click', announceStone);
      cleanups.push(() => stoneAskBtn.removeEventListener('click', announceStone));
    }

    /* site.js:1400 (the `refreshFilterUI()` at the foot of the drawer setup).
       It runs once so the count reads "Showing 67 of 67" instead of the
       markup's placeholder, and so the silica group is hidden from the
       start. */
    refreshFilterUI();

    /* site.js:1436-1442 — reduced motion skips the entrance entirely and the
       wheel is simply already there. Otherwise it primes, and plays once the
       section is 55% on screen. */
    const reduceWheel = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    let wheelIO: IntersectionObserver | null = null;
    if (reduceWheel) {
      wheelPlayed = true;
      startGallery();
    } else {
      primeWheel();
      if (typeof IntersectionObserver === 'undefined') {
        /* Not in the source, which can assume a browser. Failing open leaves
           the wheel usable rather than at opacity 0 forever. */
        playWheel();
      } else {
        wheelIO = new IntersectionObserver(
          (es) => {
            es.forEach((e) => {
              if (e.isIntersecting) {
                playWheel();
                wheelIO?.disconnect();
              }
            });
          },
          { threshold: 0.55 },
        );
        wheelIO.observe(wheel);
      }
    }

    return () => {
      disposed = true;
      wheelIO?.disconnect();
      cancelAnimationFrame(rafId);
      clearAnim();
      for (const c of cleanups) c();
      wheel.querySelectorAll('.slab').forEach((el) => el.remove());
      nodes = [];
    };
  }, [rootRef]);

  /* site.js:1165-1172 (mouse/touch) and 1181-1191 (trackpad), through the one
     shared engine. `drag:'raw'` is the stone wheel's own binding style — no
     axis lock, no scroll takeover, move listeners on window. The trackpad
     config is the wheel's own numbers: the 2:1 axis gate that stops a
     vertical page scroll spinning it, the 24px accumulator, and the 260ms
     cooldown that turns one flick into one step. It MUST be a non-passive
     listener because the handler preventDefaults, which is why this cannot be
     React's `onWheel`. */
  useCarouselSwipe(wheelRef, {
    drag: 'raw',
    dragClass: 'dragging',
    /* site.js:1159 — nothing responds until the entrance has finished. */
    enabled: () => !!apiRef.current?.isOn(),
    onDragStart: () => apiRef.current?.dragStart(),
    onDragMove: (dx) => apiRef.current?.dragMove(dx),
    onDragEnd: () => apiRef.current?.dragEnd(),
    onStep: (dir) => apiRef.current?.step(dir),
    wheel: WHEEL_STONE_WHEEL,
  });

  return wheelRef;
}
