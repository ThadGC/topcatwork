'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useCarouselSwipe, WHEEL_REVIEW_DECK } from './useCarouselSwipe';

/**
 * The reviews deck, ported from assets/site.js:1502-1980.
 *
 * `.rev` cards are `position:absolute; inset:0` inside `.rev-deck`
 * (home-sections.css:277), i.e. all fifteen are stacked on top of one another
 * and the layout is *entirely* a set of JS-written transforms. Render the
 * cards without this hook and you get fifteen cards in a pile.
 *
 * There are two layouts, and which one runs is decided by CSS, not by JS:
 * `#reviews` declares `--revPer: 3`, dropping to `1` below 1121px
 * (globals.css:610/617). The source reads that property back with
 * getComputedStyle (site.js:1560) — a media query telling JavaScript what
 * mode it is in. Do not replace it with a matchMedia call; the property is
 * the contract.
 *
 *   WIDE   (--revPer 3, >=1121px)  three cards side by side in `desktopSlots`,
 *                                  hinged up on rotateX as the section
 *                                  scrolls in (`applyEntranceFlip`), paged by
 *                                  a fly-out/fly-in (`shiftCards`).
 *   SOLO   (--revPer 1, <=1120px)  a 3D carousel on a cylinder of radius
 *                                  `soloR`, neighbours turned SOLO_ANG away,
 *                                  dragged with finger/mouse/trackpad and
 *                                  settled with `easeRoll`.
 *   GRID   (--revPer >1, narrow)   the middle branch. Unreachable with the
 *                                  shipped breakpoints but the source keeps
 *                                  it, so it is kept.
 *
 * The whole engine lives inside ONE effect, as one closure over `let`s,
 * because that is what the source is: a module-scoped state machine whose
 * pieces call each other freely (`goPage` -> `soloPlace` -> `soloSettle` ->
 * `soloFrame` -> `soloRender`). Splitting it into React state would change
 * the frame timing of every one of those calls. React sees only the handles
 * it needs — the pager's disabled flag, and two imperative entry points.
 *
 * EVERY NUMBER BELOW IS THE SOURCE'S. None of them was chosen here.
 */

/* --- solo carousel geometry, site.js:1706-1729 -------------------------- */
const SOLO_NS = 0.86; // neighbour scale at one step away
const SOLO_DIM = 0.5; // neighbour opacity at one step away
const SOLO_GAP = 12; // px of air between card edges on the cylinder
const SOLO_ANG = 32; // degrees of yaw per step
const SOLO_P = 1000; // px, the deck's perspective (home-sections.css:318)

/* --- solo roll, site.js:1741-1743 --------------------------------------- */
const SOLO_DUR = 620;

/* --- solo release tests, site.js:1799-1801 ------------------------------- */
const SOLO_THROW = 48; // px of travel that pages on its own
const SOLO_FLICK = 0.45; // px/ms release speed that pages
const SOLO_FLICK_MIN = 10; // ...but only past this much travel

/* --- wide layout, site.js:1874-1884 ------------------------------------- */
const WIDE_GAP = 28;
const WIDE_AVAIL_VW = 0.84;
const WIDE_AVAIL_MAX = 1220;
const WIDE_STAGE_FILL = 0.96;

/* --- wide entrance, site.js:1868-1873 ----------------------------------- */
const REV_STAG = 0; // per-card stagger. Zero in the shipped build, so every
//                     card shares one progress — kept as the source's own
//                     constant because it is still divided by below.
const REV_FLIP_Y = 130;
const REV_FLIP_RX = -88;
const REV_FLIP_SC = 0.82;
const REV_ENTER_TOP = 0.95; // stage top, in viewports, where the flip starts
const REV_SETTLE_TOP = 0.2; // ...and where it finishes

/* --- wide paging, site.js:1918-1951 ------------------------------------- */
const SHIFT_ROLL = 380; // degrees of spin per direction
const SHIFT_OFF_PAD = 420; // px past the viewport edge that a card flies to
const SHIFT_SETTLE = 800; // ms until the deck re-seats at rest

/* --- solo/grid layout, site.js:1566-1583 -------------------------------- */
const GRID_GAP = 16;
const SOLO_AVAIL_VW = 0.72;
const SOLO_AVAIL_MAX = 420;
const GRID_AVAIL_VW = 0.8;
const GRID_AVAIL_MAX = 1180;
const GRID_STAGE_FILL = 0.94;
const GRID_ENTRY_PAD = 80;

/* --- grid entrance sequence, site.js:1690, 1953-1975 -------------------- */
const REV_FROM = [-1, -1, 1, -1, 1, 1];
const REV_STEP_IN = 140;
const REV_STEP_OUT = 200;
const REV_PAGE_ORDER = [1, 0, 2];
const REV_ENTER_LINE = 0.74;
const REV_EXIT_LINE = 0.68;

/* --- expansion, site.js:1503 -------------------------------------------- */
const REV_OPEN_GAP = 24;

/** site.js:1712 — radius that puts SOLO_GAP of air between projected edges. */
function soloRadius(cellW: number): number {
  const a = (SOLO_ANG * Math.PI) / 180;
  const E = cellW / 2 + SOLO_GAP;
  const C = (cellW * SOLO_NS * Math.cos(a)) / 2;
  const den = SOLO_P * Math.sin(a) - E * (1 - Math.cos(a));
  return den > 1 ? (SOLO_P * (E + C)) / den : cellW * 2;
}

/** site.js:1720 — half the projected gap, used to place the pager buttons. */
function soloGapX(R: number, cellW: number): number {
  const a = (SOLO_ANG * Math.PI) / 180;
  const px = (-cellW * SOLO_NS) / 2;
  const x1 = px * Math.cos(a) + R * Math.sin(a);
  const z1 = -px * Math.sin(a) + R * Math.cos(a);
  return (cellW / 2 + (x1 * SOLO_P) / (SOLO_P + R - z1)) / 2;
}

/**
 * site.js:1727 — how far one step of the cylinder travels on screen, in px.
 * This is the drag's unit: `soloAnim = dragBase + drag/soloOff` turns pixels
 * of finger travel into fractions of a step.
 */
function soloStep(R: number): number {
  const a = (SOLO_ANG * Math.PI) / 180;
  return (R * Math.sin(a) * SOLO_P) / (SOLO_P + R * (1 - Math.cos(a)));
}

/** site.js:1745 — the roll's easing. In-out cubic, and nothing else. */
const easeRoll = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** site.js:1875-1876 — out-cubic for the entrance, and a 0..1 clamp. */
const eOut = (t: number): number => 1 - Math.pow(1 - t, 3);
const clampR = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export interface ReviewDeck {
  /** Attach to `section#reviews`. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Attach to `.rev-stage#revStage` — the solo drag binds here (site.js:1802). */
  stageRef: RefObject<HTMLDivElement | null>;
  /** Attach to `.rev-deck#revDeck` — the trackpad binds here (site.js:1821). */
  deckRef: RefObject<HTMLDivElement | null>;
  /** The pager buttons: `shiftCards` when wide, `goPage` otherwise (site.js:1953). */
  page: (delta: number) => void;
  /** Both buttons are disabled together when there is only one page. */
  pagerDisabled: boolean;
  /** The "Read more" button. */
  toggleExpand: (index: number) => void;
}

interface Engine {
  page: (delta: number) => void;
  toggleExpandIndex: (index: number) => void;
  revSolo: () => boolean;
  goPage: (d: number) => void;
  onSoloDragStart: () => void;
  onSoloDragMove: (dx: number) => void;
  onSoloDragEnd: (dx: number, vx: number) => void;
}

export function useReviewDeck(count: number): ReviewDeck {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const [pagerDisabled, setPagerDisabled] = useState(true);

  useEffect(() => {
    const revSection = sectionRef.current;
    const revStage = stageRef.current;
    const deck = deckRef.current;
    if (!revSection || !revStage || !deck) return;

    const revNodes = Array.from(deck.querySelectorAll<HTMLElement>('.rev'));
    if (!revNodes.length) return;

    /* ------------------------------------------------------------ state --
       site.js's module-scoped `let`s, in the order the source declares them. */

    /** site.js:1690 `el._revEndT` — the expando that cancels a card's pending
     *  "stop transitioning" timer. A Map instead of a property on the node. */
    const revEndT = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

    const reduceRev = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches; // site.js:1548

    let gridSlots: Array<{ x: number; y: number; s: number }> = []; // :1551
    let entryOff = 900; // :1552
    let gridPage = 0; // :1553 — solo: the centred card; grid: the page

    let soloOff = 0; // :1709
    let soloR = 520; // :1711
    let soloDragged = false; // :1731
    let soloAnim = 0; // :1741
    let soloA0 = 0;
    let soloT0 = 0;
    let soloRaf: number | null = null;
    let soloDragBase = 0;
    let soloLiveT: ReturnType<typeof setTimeout> | null = null; // :1780

    let pageRecycleT: ReturnType<typeof setTimeout> | null = null; // :1652

    const N_REV = revNodes.length; // :1959
    let revStart = 0; // :1960 — index of the leftmost visible wide card
    let desktopSlots: Array<{ x: number; s: number }> = []; // :1961
    let revPhase: 'enter' | 'settled' = 'enter'; // :1962
    let revPaging = false; // :1963

    let revSeqTimers: Array<ReturnType<typeof setTimeout>> = []; // :1966
    /* site.js:1946-1950 — the double-rAF release and the 800ms re-seat that
       `shiftCards` schedules. Held here so the teardown can cancel them. */
    let shiftRafA: number | null = null;
    let shiftRafB: number | null = null;
    let shiftT: ReturnType<typeof setTimeout> | null = null;
    let revLastY = window.scrollY; // :1978
    let revDir = 0;

    /* ------------------------------------------------------------- mode -- */

    /** site.js:1502 */
    const isDesktopRev = () => window.innerWidth >= 1121;

    /** site.js:1560 — the mode comes out of CSS, not out of matchMedia. */
    const perPage = () => {
      const v = parseInt(
        getComputedStyle(revSection).getPropertyValue('--revPer'),
        10,
      );
      return Number.isFinite(v) && v > 0 ? v : window.innerWidth < 720 ? 1 : 3;
    };
    const pageCount = () => Math.ceil(N_REV / perPage()); // :1563
    const cardPage = (i: number) => Math.floor(i / perPage()); // :1564
    const pageCards = () =>
      revNodes.map((_, i) => i).filter((i) => cardPage(i) === gridPage); // :1565

    /** site.js:1732 */
    const revSolo = () => !isDesktopRev() && perPage() === 1;
    /** site.js:1549 */
    const revNoEntrance = () => reduceRev || revSolo();

    let revEntered = revNoEntrance(); // site.js:1550

    /* -------------------------------------------------------------- fit -- */

    /**
     * site.js:1602 `fitQuote` — clamp the quote to the box by binary-searching
     * the word count, then append an ellipsis.
     *
     * A CSS `-webkit-line-clamp` cannot be used instead: the card's height is
     * a `clamp()` of viewport units, so the number of lines that fit is not
     * known at author time, and the button has to know whether it truncated
     * anything in order to decide whether to show itself at all.
     */
    const fitQuote = (el: HTMLElement) => {
      const q = el.querySelector<HTMLElement>('.quote');
      const t = el.querySelector<HTMLElement>('.qt');
      const b = el.querySelector<HTMLElement>('.rev-more');
      if (!q || !t || !b) return;
      const full = el.dataset.full || '';

      if (el.classList.contains('expanded')) {
        t.textContent = '“' + full + '”';
        b.style.display = '';
        b.textContent = 'Show less';
        return;
      }

      b.style.display = 'none';
      t.textContent = '“' + full + '”';
      if (q.scrollHeight <= q.clientHeight + 1) {
        el.classList.remove('clamped');
        return;
      }

      el.classList.add('clamped');
      b.style.display = '';
      b.textContent = 'Read more';

      const words = full.split(/\s+/);
      let lo = 1;
      let hi = words.length;
      let best = 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        t.textContent = '“' + words.slice(0, mid).join(' ') + '… ';
        if (q.scrollHeight <= q.clientHeight + 1) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      t.textContent = '“' + words.slice(0, best).join(' ') + '… ';
    };

    /** site.js:1620 */
    const markClamped = () => revNodes.forEach(fitQuote);

    /** site.js:1621 — both buttons live and die together. */
    const updatePageBtns = () => setPagerDisabled(!(pageCount() > 1));

    /* ------------------------------------------------------- expand/close */

    /** site.js:1504 */
    const collapseCard = (el: HTMLElement) => {
      el.classList.remove('expanded');
      el.style.height = '';
      revStage.style.marginBottom = '';
      revStage.style.setProperty('--revPagerDrop', '0px');
      fitQuote(el);
      if (isDesktopRev()) {
        if (!revPaging && revPhase === 'settled') placeDesktopRest();
      } else el.style.zIndex = '1';
    };

    /** site.js:1516 */
    const toggleExpand = (el: HTMLElement | null | undefined) => {
      if (!el) return;
      if (el.classList.contains('expanded')) {
        collapseCard(el);
        return;
      }
      if (!el.classList.contains('clamped')) return;
      revNodes.forEach((n) => {
        if (n !== el && n.classList.contains('expanded')) collapseCard(n);
      });
      const base = el.offsetHeight;
      el.classList.add('expanded');
      el.style.zIndex = '40';
      el.style.height = base + 'px';
      fitQuote(el);
      const q = el.querySelector<HTMLElement>('.quote');
      const extra = q ? Math.max(0, q.scrollHeight - q.clientHeight) : 0;
      const r0 = el.getBoundingClientRect();
      const sc = base && r0.height ? r0.height / base : 1;
      const vh = window.innerHeight || 800;
      const capR = Math.min(Math.max(240, vh - r0.top - 24), vh * 0.8, 640);
      const finalH = revSolo()
        ? base + extra + 28
        : Math.min(base + extra + 28, capR / sc);
      el.style.height = finalH + 'px';
      if (revSolo()) {
        const band = parseFloat(getComputedStyle(revStage).paddingBottom) || 0;
        const air =
          parseFloat(
            getComputedStyle(revSection).getPropertyValue('--revAir'),
          ) || 0;
        const drop = Math.max(
          0,
          Math.round(
            r0.top +
              finalH * sc +
              air / 2 +
              band -
              revStage.getBoundingClientRect().bottom,
          ),
        );
        revStage.style.setProperty('--revPagerDrop', drop + 'px');
        const strap =
          parseFloat(
            getComputedStyle(
              revSection.querySelector<HTMLElement>('.rev-cta') || revStage,
            ).marginTop,
          ) || REV_OPEN_GAP;
        revStage.style.marginBottom = drop > 0 ? drop + strap + 'px' : '';
      } else {
        const over =
          r0.top +
          finalH * sc -
          revStage.getBoundingClientRect().bottom +
          REV_OPEN_GAP;
        revStage.style.marginBottom = over > 1 ? Math.round(over) + 'px' : '';
      }
    };

    /** site.js:1545 */
    const collapseAllReviews = () => {
      revNodes.forEach((n) => {
        if (n.classList.contains('expanded')) collapseCard(n);
      });
    };

    /* ==================================================== SOLO CAROUSEL == */

    /**
     * site.js:1733 — signed, wrapped distance from the centred page, in pages.
     * Wrapping through the short way is what makes card 0 sit next to card 14.
     */
    const soloDist = (i: number) => {
      const n = pageCount();
      let d = (cardPage(i) - gridPage + n) % n;
      if (d > n / 2) d -= n;
      return d;
    };

    /** site.js:1746 */
    const soloStop = () => {
      if (soloRaf !== null) {
        cancelAnimationFrame(soloRaf);
        soloRaf = null;
      }
    };

    /**
     * site.js:1747 — the roll. `soloAnim` is the offset in steps that still
     * has to be worked off; it decays to zero over SOLO_DUR on easeRoll, and
     * every frame re-renders the whole cylinder.
     */
    const soloFrame = (now: number) => {
      soloRaf = null;
      const t = Math.min(1, (now - soloT0) / SOLO_DUR);
      soloAnim = soloA0 * (1 - easeRoll(t));
      if (t >= 1) soloAnim = 0;
      soloRender();
      if (t < 1) soloRaf = requestAnimationFrame(soloFrame);
    };

    /** site.js:1755 — below 0.0008 of a step there is nothing to animate. */
    const soloSettle = () => {
      soloStop();
      if (Math.abs(soloAnim) < 0.0008) {
        soloAnim = 0;
        soloRender();
        return;
      }
      soloA0 = soloAnim;
      soloT0 = performance.now();
      soloRaf = requestAnimationFrame(soloFrame);
    };

    /**
     * site.js:1761 — the cylinder. Each card is pushed back to the axis
     * (`translateZ(-R)`), yawed by its distance, then pushed back out
     * (`translateZ(R)`), which puts it on the rim of a cylinder of radius R.
     * Scale, opacity and z-index all key off the ABSOLUTE distance, so the
     * two neighbours are treated alike whichever side they are on.
     */
    const soloRender = () => {
      const gs = gridSlots.length ? gridSlots[0].s : 1;
      revNodes.forEach((el, i) => {
        const d = soloDist(i);
        const u = d + soloAnim;
        const au = Math.abs(u);
        const t0 = revEndT.get(el);
        if (t0 !== undefined) {
          clearTimeout(t0);
          revEndT.delete(el);
        }
        if (!revEntered) {
          // Parked off-stage, waiting for the section to be reached.
          el.classList.remove('entering');
          el.classList.add('leaving');
          const from =
            d === 0 ? REV_FROM[i % REV_FROM.length] : d < 0 ? -1 : 1;
          el.style.transform = `translate3d(${Math.round(from * entryOff)}px,0,0) scale(${(gs * SOLO_NS).toFixed(3)})`;
          el.style.opacity = Math.abs(d) <= 1 ? '1' : '0';
          el.style.pointerEvents = 'none';
          el.style.zIndex = '1';
          return;
        }
        el.classList.remove('entering', 'leaving');
        const t = Math.min(au, 1);
        const s = gs * (1 - (1 - SOLO_NS) * t);
        const op =
          au <= 1 ? 1 - (1 - SOLO_DIM) * au : Math.max(0, SOLO_DIM * (2 - au));
        el.style.transform =
          `translateZ(${-soloR}px) rotateY(${(u * SOLO_ANG).toFixed(2)}deg) ` +
          `translateZ(${soloR}px) scale(${s.toFixed(3)})`;
        el.style.opacity = op.toFixed(3);
        el.style.pointerEvents = op > 0.05 ? 'auto' : 'none';
        el.style.zIndex = String(Math.round(10 - au * 3));
      });
    };

    /**
     * site.js:1781 — the one entry point into the solo layout.
     *
     * `settle` false is the live drag: kill any animation, set `soloAnim`
     * straight from the finger, render. `settle` true hands it to `soloSettle`
     * to roll home.
     *
     * `.rev-live` is what switches the CSS transition off (home-sections.css:
     * 320) so the drag tracks the finger instead of lagging a transition
     * behind it. It is added on the FIRST settle and never removed while the
     * deck is in solo, which is why the 820ms arming branch below only ever
     * runs for a deck that entered wide and was resized into solo.
     */
    const soloPlace = (drag: number, settle: boolean) => {
      if (!revEntered) {
        soloStop();
        soloAnim = 0;
        if (soloLiveT) clearTimeout(soloLiveT);
        deck.classList.remove('rev-live');
        soloRender();
        return;
      }
      if (
        settle &&
        !deck.classList.contains('rev-live') &&
        !revNoEntrance()
      ) {
        soloStop();
        soloAnim = 0;
        soloRender();
        if (soloLiveT) clearTimeout(soloLiveT);
        soloLiveT = setTimeout(() => {
          if (revEntered) deck.classList.add('rev-live');
        }, 820);
        return;
      }
      if (soloLiveT) clearTimeout(soloLiveT);
      deck.classList.add('rev-live');
      if (settle) {
        soloSettle();
        return;
      }
      soloStop();
      soloAnim = soloDragBase + (soloOff > 0 ? drag / soloOff : 0);
      soloRender();
    };

    /* ================================================== GRID (the middle) = */

    /** site.js:1691 */
    const seatGridCard = (i: number, waiting: boolean) => {
      const el = revNodes[i];
      const g = gridSlots[i];
      if (!g) return;
      const from = REV_FROM[i % REV_FROM.length];
      const t0 = revEndT.get(el);
      if (t0 !== undefined) {
        clearTimeout(t0);
        revEndT.delete(el);
      }
      if (waiting) {
        el.classList.remove('entering');
        el.classList.add('leaving');
        el.style.transform = `translate3d(${Math.round(from * entryOff)}px,${g.y}px,0) rotate(${(from * 4).toFixed(1)}deg) scale(${g.s.toFixed(3)})`;
      } else {
        el.classList.remove('leaving');
        el.classList.add('entering');
        el.style.transform = `translate3d(${g.x}px,${g.y}px,0) rotate(0deg) scale(${g.s.toFixed(3)})`;
        revEndT.set(
          el,
          setTimeout(() => {
            el.classList.remove('entering');
            revEndT.delete(el);
          }, 1250),
        );
      }
      el.style.opacity = '1';
      el.style.pointerEvents = waiting ? 'none' : 'auto';
    };

    /** site.js:1636 */
    const parkGridCard = (i: number, dir: number, instant?: boolean) => {
      const el = revNodes[i];
      const g = gridSlots[i];
      if (!g) return;
      const t0 = revEndT.get(el);
      if (t0 !== undefined) {
        clearTimeout(t0);
        revEndT.delete(el);
      }
      const t = `translate3d(${Math.round(dir * entryOff)}px,${g.y}px,0) rotate(${(dir * 4).toFixed(1)}deg) scale(${g.s.toFixed(3)})`;
      if (instant) {
        const prev = el.style.transition;
        el.style.transition = 'none';
        el.style.transform = t;
        void el.offsetWidth; // forced reflow: the source's own, and load-bearing
        el.style.transition = prev;
      } else {
        el.classList.remove('leaving');
        el.classList.add('entering');
        el.style.transform = t;
      }
      el.style.opacity = '1';
      el.style.pointerEvents = 'none';
    };

    /** site.js:1631 */
    const placeGridCard = (i: number) => {
      const page = cardPage(i);
      if (page === gridPage) seatGridCard(i, !revEntered);
      else parkGridCard(i, page < gridPage ? -1 : 1);
    };

    /** site.js:1653 — paging for everything that is not the wide layout. */
    const goPage = (d: number) => {
      const pages = pageCount();
      if (pages < 2) return;
      if (revSolo()) {
        collapseAllReviews();
        gridPage = (gridPage + d + pages) % pages;
        /* The compensation that makes the roll animate: the centre has
           already moved, so push `soloAnim` the same amount the other way and
           let soloSettle work it off. site.js:1658. */
        soloAnim += d;
        revEntered = true;
        soloPlace(0, true);
        updatePageBtns();
        return;
      }
      const from = gridPage;
      gridPage = (gridPage + d + pages) % pages;
      revEntered = true;
      if (pageRecycleT) clearTimeout(pageRecycleT);
      revNodes.forEach((_el, i) => {
        const page = cardPage(i);
        if (page === gridPage) {
          parkGridCard(i, d > 0 ? 1 : -1, true);
          seatGridCard(i, false);
        } else if (page === from) {
          parkGridCard(i, d > 0 ? -1 : 1, false);
        } else {
          parkGridCard(i, d > 0 ? 1 : -1, true);
        }
      });
      pageRecycleT = setTimeout(() => {
        revNodes.forEach((_el, i) => {
          if (cardPage(i) !== gridPage) parkGridCard(i, d > 0 ? 1 : -1, true);
        });
      }, 1300);
      updatePageBtns();
    };

    /* ==================================================== WIDE (>=1121) == */

    /** site.js:1877 */
    const measureDesktopSlots = () => {
      const cw = deck.offsetWidth || 300;
      const ch = deck.offsetHeight || 400;
      const gap = WIDE_GAP;
      const availW = Math.min(window.innerWidth * WIDE_AVAIL_VW, WIDE_AVAIL_MAX);
      const stageH = deck.parentElement?.clientHeight || 520;
      let GS = Math.min(
        (availW - 2 * gap) / (3 * cw),
        (stageH * WIDE_STAGE_FILL) / ch,
        1,
      );
      if (!(GS > 0)) GS = 0.9;
      const cellW = cw * GS;
      const totalW = 3 * cellW + 2 * gap;
      desktopSlots = [0, 1, 2].map((s) => ({
        x: Math.round(-totalW / 2 + cellW / 2 + s * (cellW + gap)),
        s: GS,
      }));
    };

    /** site.js:1885 */
    const visibleRevIds = () => [0, 1, 2].map((k) => (revStart + k) % N_REV);
    /** site.js:1886 */
    const restTransform = (k: number) => {
      const g = desktopSlots[k];
      return `translate3d(${g.x}px,0,0) scale(${g.s.toFixed(3)})`;
    };
    /** site.js:1887 — the off-stage state every non-visible card sits in. */
    const parkReview = (el: HTMLElement) => {
      el.style.transition = 'none';
      el.style.transform = 'translate3d(0,60px,0) scale(0.9)';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '0';
    };

    /** site.js:1888 */
    const placeDesktopRest = () => {
      const vis = visibleRevIds();
      revNodes.forEach((el, i) => {
        const k = vis.indexOf(i);
        if (k < 0) {
          parkReview(el);
          return;
        }
        el.style.transition = 'transform .5s var(--ease),opacity .4s var(--ease)';
        el.style.transform = restTransform(k);
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
        el.style.zIndex = el.classList.contains('expanded') ? '40' : String(5 - k);
      });
    };

    /**
     * site.js:1900 — THE ENTRANCE. This is the piece the client can see
     * missing: the three cards hinge up on rotateX from -88deg as the section
     * scrolls in, driven by scroll POSITION, not by a transition.
     *
     * `transition:'none'` on every frame is essential — the transform is being
     * written many times a second from the scroll handler, and a transition
     * would fight it. The perspective is a transform FUNCTION here
     * (`perspective(1400px) translate3d(...) rotateX(...)`), not the `.rev`
     * rule's perspective property, so the hinge is foreshortened per card.
     *
     * `opacity = e * 1.6` clamped: the card is fully opaque at 62% of the
     * flip, so it is solid well before it is upright.
     */
    const applyEntranceFlip = (p: number) => {
      const vis = visibleRevIds();
      revNodes.forEach((el, i) => {
        const k = vis.indexOf(i);
        if (k < 0) {
          parkReview(el);
          return;
        }
        const lp = clampR((p - k * REV_STAG) / (1 - 2 * REV_STAG));
        const e = eOut(lp);
        const g = desktopSlots[k];
        const y = REV_FLIP_Y * (1 - e);
        const rx = REV_FLIP_RX * (1 - e);
        const sc = REV_FLIP_SC + (g.s - REV_FLIP_SC) * e;
        el.style.transition = 'none';
        el.style.transform =
          `perspective(1400px) translate3d(${g.x}px,${y.toFixed(1)}px,0) ` +
          `rotateX(${rx.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
        el.style.opacity = clampR(e * 1.6).toFixed(3);
        el.style.pointerEvents = e > 0.98 ? 'auto' : 'none';
        el.style.zIndex = String(5 - k);
      });
    };

    /** site.js:1912 — stage top from 0.95 viewports down to 0.20, as 0..1. */
    const revScrollProgress = () => {
      const top =
        revStage.getBoundingClientRect().top / (window.innerHeight || 1);
      return clampR(
        (REV_ENTER_TOP - top) / (REV_ENTER_TOP - REV_SETTLE_TOP),
      );
    };

    /** site.js:1916 */
    const desktopReviewScroll = () => {
      if (!isDesktopRev() || revPaging) return;
      const p = reduceRev ? 1 : revScrollProgress();
      if (p >= 1) {
        if (revPhase !== 'settled') {
          revPhase = 'settled';
          placeDesktopRest();
        }
      } else {
        revPhase = 'enter';
        collapseAllReviews();
        applyEntranceFlip(p);
      }
    };

    /** site.js:1924 */
    const desktopLayout = () => {
      measureDesktopSlots();
      markClamped();
      updatePageBtns();
      if (reduceRev) {
        revPhase = 'settled';
        placeDesktopRest();
        return;
      }
      const p = revScrollProgress();
      if (p >= 1) {
        revPhase = 'settled';
        placeDesktopRest();
      } else {
        revPhase = 'enter';
        applyEntranceFlip(p);
      }
    };

    /**
     * site.js:1932 — THE PAGE TURN. The leaving card is thrown clear off the
     * side of the window, spinning 380deg and shrinking to half size; the
     * entering card is placed instantly on the OPPOSITE side, spun the other
     * way, then released on the next-but-one frame so the browser has a
     * painted "from" state to transition out of. The two cards that stay
     * simply slide to their new slots.
     *
     * The double rAF is not decoration: set `transition` and `transform` in
     * the same frame and the browser coalesces them into no animation at all.
     */
    const shiftCards = (dir: number) => {
      if (revPaging || N_REV < 4) return;
      collapseAllReviews();
      measureDesktopSlots();
      revPaging = true;
      const oldVis = visibleRevIds();
      const leavingId = dir > 0 ? oldVis[0] : oldVis[2];
      revStart = (revStart + dir + N_REV) % N_REV;
      const newVis = visibleRevIds();
      const enteringId = dir > 0 ? newVis[2] : newVis[0];
      const enSlot = dir > 0 ? 2 : 0;
      const roll = SHIFT_ROLL * dir;
      const offX = window.innerWidth / 2 + SHIFT_OFF_PAD;

      const lv = revNodes[leavingId];
      lv.style.transition =
        'transform .72s cubic-bezier(.5,0,.7,1),opacity .6s ease';
      lv.style.transform =
        `translate3d(${(-dir * offX).toFixed(0)}px,-40px,0) ` +
        `rotate(${(-roll).toFixed(0)}deg) scale(0.5)`;
      lv.style.opacity = '0';
      lv.style.zIndex = '1';
      lv.style.pointerEvents = 'none';

      newVis.forEach((id, k) => {
        if (id === enteringId) return;
        const el = revNodes[id];
        el.style.transition = 'transform .6s var(--ease),opacity .4s var(--ease)';
        el.style.transform = restTransform(k);
        el.style.opacity = '1';
        el.style.zIndex = String(5 - k);
        el.style.pointerEvents = 'auto';
      });

      const en = revNodes[enteringId];
      en.style.transition = 'none';
      en.style.transform =
        `translate3d(${(dir * offX).toFixed(0)}px,-40px,0) ` +
        `rotate(${roll.toFixed(0)}deg) scale(0.5)`;
      en.style.opacity = '0';
      en.style.zIndex = String(5 - enSlot);
      en.style.pointerEvents = 'none';
      shiftRafA = requestAnimationFrame(() => {
        shiftRafB = requestAnimationFrame(() => {
          en.style.transition =
            'transform .74s cubic-bezier(.25,.9,.3,1),opacity .5s ease';
          en.style.transform = restTransform(enSlot);
          en.style.opacity = '1';
        });
      });

      shiftT = setTimeout(() => {
        revPaging = false;
        revPhase = 'settled';
        placeDesktopRest();
      }, SHIFT_SETTLE);
    };

    /* ===================================================== the layout === */

    /** site.js:1566 */
    const gridLayout = () => {
      collapseAllReviews();
      revSection.classList.toggle('rev-solo', revSolo());
      if (isDesktopRev()) {
        desktopLayout();
        return;
      }
      const pp = perPage();
      gridPage = Math.max(0, Math.min(gridPage, pageCount() - 1));
      const cw = deck.offsetWidth || 480;
      const ch = deck.offsetHeight || 320;
      const gap = GRID_GAP; // site.js:1571 picks 16 either side of 720px
      const availW = revSolo()
        ? Math.min(window.innerWidth * SOLO_AVAIL_VW, SOLO_AVAIL_MAX)
        : Math.min(window.innerWidth * GRID_AVAIL_VW, GRID_AVAIL_MAX);
      const stageH = deck.parentElement?.clientHeight || 520;
      let GS = (availW - (pp - 1) * gap) / (pp * cw);
      if (revSolo()) GS = Math.min(GS, 1);
      else GS = Math.min(GS, (stageH * GRID_STAGE_FILL) / ch, 1);
      if (!(GS > 0)) GS = 0.5;
      const cellW = cw * GS;
      const totalW = pp * cellW + (pp - 1) * gap;
      entryOff = window.innerWidth / 2 + cellW / 2 + GRID_ENTRY_PAD;

      if (revSolo()) {
        revSection.style.setProperty('--revScale', GS.toFixed(4));
        soloR = soloRadius(cellW);
        soloOff = Math.round(soloStep(soloR));
        revSection.style.setProperty(
          '--revPagerX',
          soloGapX(soloR, cellW).toFixed(1) + 'px',
        );
        gridSlots = revNodes.map(() => ({ x: 0, y: 0, s: GS }));
        soloPlace(0, true);
        updatePageBtns();
        markClamped();
        return;
      }

      gridSlots = revNodes.map((_el, i) => {
        const col = i % pp;
        return {
          x: Math.round(-totalW / 2 + cellW / 2 + col * (cellW + gap)),
          y: 0,
          s: GS,
        };
      });
      revNodes.forEach((el, i) => {
        el.style.zIndex = '1';
        placeGridCard(i);
      });
      updatePageBtns();
      markClamped();
    };

    /* ============================================ entrance sequencing === */

    /** site.js:1967 — the grid layout's staggered seating, middle card first. */
    const runRevSequence = (seating: boolean) => {
      revSeqTimers.forEach(clearTimeout);
      revSeqTimers = [];
      if (revSolo()) {
        soloPlace(0, true);
        return;
      }
      const ids = pageCards();
      const seq = REV_PAGE_ORDER.filter((k) => k < ids.length).map((k) => ids[k]);
      const step = seating ? REV_STEP_IN : REV_STEP_OUT;
      seq.forEach((ri, k) => {
        revSeqTimers.push(
          setTimeout(() => seatGridCard(ri, !seating), k * step),
        );
      });
    };

    /**
     * site.js:1979 — the narrow entrance trigger. Direction-sensitive: it
     * seats on the way down past 0.74 viewports and un-seats on the way back
     * up past 0.68, with a 6px deadband on the direction itself.
     */
    const checkRevSequence = () => {
      if (reduceRev) return;
      if (revSolo()) {
        if (!revEntered) {
          revEntered = true;
          soloPlace(0, true);
        }
        return;
      }
      if (isDesktopRev()) return;
      const y = window.scrollY;
      if (Math.abs(y - revLastY) >= 6) {
        revDir = y > revLastY ? 1 : -1;
        revLastY = y;
      }
      const topFrac =
        revStage.getBoundingClientRect().top / (window.innerHeight || 1);
      if (!revEntered && revDir >= 0 && topFrac <= REV_ENTER_LINE) {
        revEntered = true;
        runRevSequence(true);
      } else if (revEntered && revDir < 0 && topFrac >= REV_EXIT_LINE) {
        revEntered = false;
        runRevSequence(false);
      }
    };

    /* ====================================================== deck input === */

    /** site.js:1833 — tap a neighbour to page to it; tap the centre to expand. */
    const onDeckClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || typeof t.closest !== 'function') return;
      if (t.closest('.rev-more')) return;
      const c = t.closest<HTMLElement>('.rev');
      if (!c) return;
      if (soloDragged) {
        soloDragged = false;
        return;
      }
      if (revSolo()) {
        const d = soloDist(revNodes.indexOf(c));
        if (d === 1 || d === -1) {
          goPage(d);
          return;
        }
      }
      toggleExpand(c);
    };

    /** site.js:1843 */
    const onDeckKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const t = e.target as Element | null;
      const c = t && typeof t.closest === 'function' ? t.closest<HTMLElement>('.rev') : null;
      if (c) toggleExpand(c);
    };

    deck.addEventListener('click', onDeckClick);
    deck.addEventListener('keydown', onDeckKey);

    /* ========================================================== arming === */

    /**
     * THE FIRST LAYOUT IS ARMED, NOT RUN AT MOUNT.
     *
     * `gridLayout()` ends in `markClamped()`, and `fitQuote` binary-searches
     * the word count by writing `textContent` and reading `scrollHeight` on
     * each step. Fifteen cards of 20-165 words is ~90 write/read pairs — ~90
     * forced synchronous layouts of a 1,700-element document — and at mount
     * they all land inside React's passive-effect flush, on the same main
     * thread the film is trying to start on.
     *
     * Measured, headless Chrome at the S21 Ultra's metrics (384x722, dpr
     * 3.75), 10 interleaved runs per variant: it is the single largest JS
     * cost in the startup path, 59-167ms of samples inside the hydration long
     * task.
     *
     * None of it is visible work at that moment. `#reviews` is the section
     * AFTER the film, and the film is a 1050vh runway, so on a phone the deck
     * sits some 5,700px below the fold when this effect runs.
     *
     * So it is armed three ways and runs once:
     *   - an IntersectionObserver a viewport and a half early, which is the
     *     guarantee. Note this is far earlier than the entrance itself needs:
     *     the flip starts at REV_ENTER_TOP (0.95 viewports), the observer
     *     fires at 1.5, so the deck is always measured and parked BEFORE the
     *     first frame of the flip is asked for;
     *   - an idle backstop, so a visitor who never scrolls still gets a deck;
     *   - the scroll and resize handlers, which run it themselves if they are
     *     somehow reached first.
     */
    let ran = false;
    let disarm: (() => void) | null = null;

    const run = () => {
      if (ran) return;
      ran = true;
      disarm?.();
      disarm = null;
      gridLayout();
      checkRevSequence();
    };

    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) run();
        },
        { rootMargin: '150% 0px' },
      );
      io.observe(deck);
      disarm = () => io.disconnect();
    } else {
      // No IntersectionObserver: lay out now, exactly as the source does.
      // Failing to the old behaviour is the only safe direction — an unlaid
      // deck is fifteen cards in a pile.
      run();
    }

    /*
      THE BACKSTOP HAS NO DEADLINE, and that is the point. A
      `{ timeout: 1200 }` would have fired the ninety forced layouts at 1.2s —
      inside the window this deferral exists to protect. The film opens its
      first byte range at ~90ms and needs SPAN_MIN (4s) of contiguous buffer
      before the scrub is allowed to start, and the probe's `firstScrollAt` was
      563ms. A plain idle callback runs when the main thread is genuinely free,
      which during the intro it is not; the observer above is the guarantee,
      this is only for a visitor who never scrolls. The 3s timer is for the
      browsers with no `requestIdleCallback` at all.
    */
    const idle =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback(run)
        : (setTimeout(run, 3000) as unknown as number);

    /* site.js:1955-1958, 1985-1986 — the source's own listener set. */
    const onScroll = () => {
      if (!ran) {
        run();
        return;
      }
      desktopReviewScroll();
      checkRevSequence();
    };
    const onResize = () => {
      if (!ran) {
        run();
        return;
      }
      gridLayout();
      checkRevSequence();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    /* ======================================================== the API === */

    engineRef.current = {
      /* site.js:1953 — the pager's two buttons. */
      page: (delta: number) => {
        if (!ran) run();
        if (isDesktopRev()) shiftCards(delta);
        else goPage(delta);
      },
      toggleExpandIndex: (index: number) => toggleExpand(revNodes[index]),
      revSolo,
      goPage,
      /* site.js:1809-1817 — the drag's three callbacks, verbatim. */
      onSoloDragStart: () => {
        soloStop();
        soloDragBase = soloAnim;
        soloDragged = true;
        deck.classList.add('solo-dragging');
      },
      onSoloDragMove: (dx: number) => {
        soloPlace(dx, false);
      },
      onSoloDragEnd: (dx: number, vx: number) => {
        deck.classList.remove('solo-dragging');
        /* The zero-delay timeout is the source's: the click that follows the
           release has to see `soloDragged` still true so it can swallow
           itself, and this clears the flag on the very next task. */
        setTimeout(() => {
          soloDragged = false;
        }, 0);
        const flick = Math.abs(vx) > SOLO_FLICK && Math.abs(dx) > SOLO_FLICK_MIN;
        if (Math.abs(dx) > SOLO_THROW) {
          goPage(dx < 0 ? 1 : -1);
          return;
        }
        if (flick) {
          goPage(vx < 0 ? 1 : -1);
          return;
        }
        soloPlace(0, true);
      },
    };

    return () => {
      engineRef.current = null;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      deck.removeEventListener('click', onDeckClick);
      deck.removeEventListener('keydown', onDeckKey);
      disarm?.();
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idle);
      else clearTimeout(idle);
      soloStop();
      if (soloLiveT) clearTimeout(soloLiveT);
      if (pageRecycleT) clearTimeout(pageRecycleT);
      if (shiftT) clearTimeout(shiftT);
      if (shiftRafA !== null) cancelAnimationFrame(shiftRafA);
      if (shiftRafB !== null) cancelAnimationFrame(shiftRafB);
      revSeqTimers.forEach(clearTimeout);
      revEndT.forEach(clearTimeout);
      revEndT.clear();
    };
  }, [count]);

  /* --------------------------------------------------------------- input --
     site.js:1802-1831: the drag binds to `revStage`, the trackpad to `deck`.
     Two different elements, so two calls. Do not collapse them onto one —
     `.rev-stage` is the wider hit area a thumb actually lands on, and the
     wheel has to sit on the deck so a trackpad flick over the pager buttons
     does not page.

     STANDING CLIENT RULE: the solo carousel must answer to touch, mouse AND
     a trackpad deltaX. He reviews the mobile layout on a MacBook. */
  useCarouselSwipe(stageRef, {
    drag: 'pointer',
    /* The client, 28 Aug, verbatim: "if someone places their thumb on the
       review card and swipes up, currently the whole site is glitching and
       jumping everywhere ... it should just scroll down. It should not
       interact with the review card itself." A vertical verdict hands the
       gesture back to the browser entirely. Ships with `touch-action: pan-y`
       on `.rev-stage`; neither works without the other. */
    releaseOnVertical: true,
    enabled: () => engineRef.current?.revSolo() ?? false,
    /* site.js:1808 — never start a drag on the pager buttons. */
    ignore: (t) => {
      const el = t as Element | null;
      return !!(el && typeof el.closest === 'function' && el.closest('.rev-page'));
    },
    onDragStart: () => engineRef.current?.onSoloDragStart(),
    onDragMove: (dx) => engineRef.current?.onSoloDragMove(dx),
    onDragEnd: (dx, vx) => engineRef.current?.onSoloDragEnd(dx, vx),
    wheel: false,
  });

  useCarouselSwipe(deckRef, {
    drag: 'none',
    enabled: () => engineRef.current?.revSolo() ?? false,
    onStep: (dir) => engineRef.current?.goPage(dir),
    wheel: WHEEL_REVIEW_DECK,
  });

  const page = useCallback((delta: number) => {
    engineRef.current?.page(delta);
  }, []);

  const toggleExpand = useCallback((index: number) => {
    engineRef.current?.toggleExpandIndex(index);
  }, []);

  return { sectionRef, stageRef, deckRef, page, pagerDisabled, toggleExpand };
}
