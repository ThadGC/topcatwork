'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/**
 * The reviews deck — layout only, ported from assets/site.js:1550-1980.
 *
 * `.rev` cards are `position:absolute; inset:0` inside `.rev-deck`
 * (site.css:688), i.e. all fifteen are stacked on top of one another and the
 * layout is *entirely* a set of JS-written transforms. Render the cards
 * without this hook and you get fifteen cards in a pile.
 *
 * There are two layouts, and which one runs is decided by CSS, not by JS:
 * `#reviews` declares `--revPer: 3`, dropping to `1` below 1121px
 * (globals.css §7). The source reads that property back with getComputedStyle
 * — a media query telling JavaScript what mode it is in. Do not replace it
 * with a matchMedia call; the property is the contract.
 *
 *   WIDE   (--revPer 3, ≥1121px)  three cards side by side, `desktopSlots`
 *   SOLO   (--revPer 1, ≤1120px)  a 3D carousel on a cylinder of radius
 *                                 `soloR`, neighbours turned SOLO_ANG away
 *
 * WHAT IS PORTED HERE, AND WHAT IS NOT
 * ------------------------------------
 * Ported: both REST layouts, the page arithmetic, the prev/next wiring, and
 * `fitQuote`'s binary-search truncation (without it the "Read more" button is
 * decorative).
 *
 * Not ported — these are separate, larger pieces of the legacy engine and are
 * called out so nobody assumes they were missed:
 *   - `applyEntranceFlip` / `desktopReviewScroll` (site.js:1886-1908), the
 *     scroll-linked entrance where cards hinge up on rotateX as the section
 *     enters. Cards here simply start at rest.
 *   - `shiftCards` (site.js:1918), the fly-out/fly-in choreography on the
 *     wide pager. Paging here re-seats through the CSS transition that
 *     `.rev` already declares.
 *   - the solo drag/roll (`soloFrame`, `soloSettle`, pointer handling).
 *
 * Every number below is the source's. None of them was chosen here.
 */

/* --- solo carousel geometry, site.js:1706-1729 -------------------------- */
const SOLO_NS = 0.86; // neighbour scale at one step away
const SOLO_DIM = 0.5; // neighbour opacity at one step away
const SOLO_GAP = 12; // px of air between card edges on the cylinder
const SOLO_ANG = 32; // degrees of yaw per step
const SOLO_P = 1000; // px, the deck's perspective

/* --- wide layout, site.js:1874-1884 ------------------------------------- */
const WIDE_GAP = 28;
const WIDE_AVAIL_VW = 0.84;
const WIDE_AVAIL_MAX = 1220;
const WIDE_STAGE_FILL = 0.96;

/* --- solo layout, site.js:1571-1577 ------------------------------------- */
const SOLO_LAYOUT_GAP = 16;
const SOLO_AVAIL_VW = 0.72;
const SOLO_AVAIL_MAX = 420;

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

export interface ReviewDeck {
  /** Attach to `section#reviews`. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Attach to `.rev-deck`. */
  deckRef: RefObject<HTMLDivElement | null>;
  /** Page back / forward. Wraps, exactly as `goPage` does. */
  page: (delta: number) => void;
  /** Both buttons are disabled together when there is only one page. */
  pagerDisabled: boolean;
  /** Toggle a card's expanded state; re-runs the quote fit. */
  toggleExpand: (index: number) => void;
}

export function useReviewDeck(count: number): ReviewDeck {
  const sectionRef = useRef<HTMLElement | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef(0); // wide: index of the leftmost visible card
  const pageRef = useRef(0); // solo: index of the centred card
  const [pagerDisabled, setPagerDisabled] = useState(true);

  /* ---------------------------------------------------------------- fit */

  /**
   * site.js:1602 `fitQuote` — clamp the quote to the box by binary-searching
   * the word count, then append an ellipsis.
   *
   * A CSS `-webkit-line-clamp` cannot be used instead: the card's height is a
   * `clamp()` of viewport units, so the number of lines that fit is not known
   * at author time, and the button has to know whether it truncated anything
   * in order to decide whether to show itself at all.
   */
  const fitQuote = useCallback((el: HTMLElement) => {
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
  }, []);

  /* ------------------------------------------------------------- layout */

  const layout = useCallback(() => {
    const section = sectionRef.current;
    const deck = deckRef.current;
    if (!section || !deck) return;

    const cards = Array.from(deck.querySelectorAll<HTMLElement>('.rev'));
    if (!cards.length) return;

    // site.js:1559 — the mode comes out of CSS, not out of matchMedia.
    const perRaw = parseInt(
      getComputedStyle(section).getPropertyValue('--revPer'),
      10,
    );
    const per =
      Number.isFinite(perRaw) && perRaw > 0
        ? perRaw
        : window.innerWidth < 720
          ? 1
          : 3;
    const wide = window.innerWidth >= 1121; // site.js:1502 isDesktopRev
    const solo = !wide && per === 1;

    section.classList.toggle('rev-solo', solo);

    const cw = deck.offsetWidth || (wide ? 300 : 480);
    const ch = deck.offsetHeight || (wide ? 400 : 320);
    const stageH = deck.parentElement?.clientHeight || 520;

    const pages = Math.ceil(cards.length / per);
    setPagerDisabled(pages < 2);

    if (wide) {
      // ---- site.js:1874 measureDesktopSlots + 1888 placeDesktopRest ----
      const availW = Math.min(window.innerWidth * WIDE_AVAIL_VW, WIDE_AVAIL_MAX);
      let GS = Math.min(
        (availW - 2 * WIDE_GAP) / (3 * cw),
        (stageH * WIDE_STAGE_FILL) / ch,
        1,
      );
      if (!(GS > 0)) GS = 0.9;
      const cellW = cw * GS;
      const totalW = 3 * cellW + 2 * WIDE_GAP;
      const slots = [0, 1, 2].map((s) => ({
        x: Math.round(-totalW / 2 + cellW / 2 + s * (cellW + WIDE_GAP)),
        s: GS,
      }));

      const start = startRef.current % cards.length;
      const visible = [0, 1, 2].map((k) => (start + k) % cards.length);

      cards.forEach((el, i) => {
        const k = visible.indexOf(i);
        if (k < 0) {
          // site.js:1886 parkReview
          el.style.transition = 'none';
          el.style.transform = 'translate3d(0,60px,0) scale(0.9)';
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.zIndex = '0';
          return;
        }
        const g = slots[k];
        el.style.transition =
          'transform .5s var(--ease),opacity .4s var(--ease)';
        el.style.transform = `translate3d(${g.x}px,0,0) scale(${g.s.toFixed(3)})`;
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
        el.style.zIndex = el.classList.contains('expanded')
          ? '40'
          : String(5 - k);
      });
    } else {
      // ---- site.js:1566 gridLayout (solo branch) + 1597 soloRender -----
      const availW = solo
        ? Math.min(window.innerWidth * SOLO_AVAIL_VW, SOLO_AVAIL_MAX)
        : Math.min(window.innerWidth * 0.8, 1180);
      let GS = (availW - (per - 1) * SOLO_LAYOUT_GAP) / (per * cw);
      if (solo) GS = Math.min(GS, 1);
      else GS = Math.min(GS, (stageH * 0.94) / ch, 1);
      if (!(GS > 0)) GS = 0.5;
      const cellW = cw * GS;

      if (solo) {
        const R = soloRadius(cellW);
        section.style.setProperty('--revScale', GS.toFixed(4));
        section.style.setProperty(
          '--revPagerX',
          soloGapX(R, cellW).toFixed(1) + 'px',
        );

        const centre = pageRef.current % pages;
        cards.forEach((el, i) => {
          // site.js:1553 soloDist — signed, wrapped distance in pages.
          let d = (i - centre + pages) % pages;
          if (d > pages / 2) d -= pages;
          const au = Math.abs(d);
          const t = Math.min(au, 1);
          const s = GS * (1 - (1 - SOLO_NS) * t);
          const op =
            au <= 1
              ? 1 - (1 - SOLO_DIM) * au
              : Math.max(0, SOLO_DIM * (2 - au));
          el.style.transform =
            `translateZ(${-R}px) rotateY(${(d * SOLO_ANG).toFixed(2)}deg) ` +
            `translateZ(${R}px) scale(${s.toFixed(3)})`;
          el.style.opacity = op.toFixed(3);
          el.style.pointerEvents = op > 0.05 ? 'auto' : 'none';
          el.style.zIndex = String(Math.round(10 - au * 3));
        });
      } else {
        // The narrow multi-column branch. Unreachable with the shipped
        // breakpoints (≤1120px always sets --revPer:1) but the source keeps
        // it, so it is kept: a future breakpoint change must not fall off a
        // cliff.
        const totalW = per * cellW + (per - 1) * SOLO_LAYOUT_GAP;
        const gridPage = pageRef.current % pages;
        cards.forEach((el, i) => {
          const col = i % per;
          const x = Math.round(
            -totalW / 2 + cellW / 2 + col * (cellW + SOLO_LAYOUT_GAP),
          );
          const onPage = Math.floor(i / per) === gridPage;
          el.style.transition =
            'transform .62s var(--ease),opacity .5s var(--ease)';
          el.style.transform = onPage
            ? `translate3d(${x}px,0,0) rotate(0deg) scale(${GS.toFixed(3)})`
            : `translate3d(${Math.round(
                (Math.floor(i / per) < gridPage ? -1 : 1) *
                  (window.innerWidth / 2 + cellW / 2 + 80),
              )}px,0,0) scale(${GS.toFixed(3)})`;
          el.style.opacity = '1';
          el.style.pointerEvents = onPage ? 'auto' : 'none';
        });
      }
    }

    cards.forEach(fitQuote);
  }, [fitQuote]);

  /* --------------------------------------------------------------- wire */

  /**
   * THE FIRST LAYOUT IS ARMED, NOT RUN AT MOUNT.
   *
   * `layout()` ends in `cards.forEach(fitQuote)`, and `fitQuote` binary-
   * searches the word count by writing `textContent` and reading
   * `scrollHeight` on each step. Fifteen cards of 20-165 words is ~90
   * write/read pairs — ~90 forced synchronous layouts of a 1,700-element
   * document — and at mount they all land inside React's passive-effect
   * flush, on the same main thread the film is trying to start on.
   *
   * Measured, headless Chrome at the S21 Ultra's metrics (384x722, dpr 3.75),
   * 10 interleaved runs per variant: it is the single largest JS cost in the
   * startup path, 59-167ms of samples inside the hydration long task.
   *
   * None of it is visible work at that moment. `#reviews` is the section
   * AFTER the film, and the film is a 1050vh runway, so on a phone the deck
   * sits some 5,700px below the fold when this effect runs.
   *
   * So it is armed three ways and runs once:
   *   - an IntersectionObserver a viewport and a half early, which is the
   *     guarantee — the deck is always laid out well before it can be seen;
   *   - an idle backstop, so a visitor who never scrolls still gets a deck;
   *   - the first resize, which needs a layout anyway.
   *
   * `layout()` itself is untouched, and the end state is identical: all 15
   * cards' transform/opacity/z-index/pointer-events, the clamp text, the
   * "Read more" labels, `--revScale`, `--revPagerX` and the pager's disabled
   * state were dumped from both versions and compared field by field.
   */
  useEffect(() => {
    const deck = deckRef.current;
    let disarm: (() => void) | null = null;
    let ran = false;

    const run = () => {
      if (ran) return;
      ran = true;
      disarm?.();
      disarm = null;
      layout();
    };

    if (deck && typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) run();
        },
        { rootMargin: '150% 0px' },
      );
      io.observe(deck);
      disarm = () => io.disconnect();
    } else {
      // No IntersectionObserver: lay out now, exactly as before. Failing to
      // the old behaviour is the only safe direction — an unlaid deck is
      // fifteen cards in a pile.
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

    const onResize = () => (ran ? layout() : run());
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      disarm?.();
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [layout, count]);

  const page = useCallback(
    (delta: number) => {
      const deck = deckRef.current;
      if (!deck) return;
      const cards = deck.querySelectorAll('.rev').length;
      if (!cards) return;
      // Collapse any expanded card first — site.js does this at the top of
      // both goPage and shiftCards, because an expanded card is taller than
      // its slot and would drag the stage height through the transition.
      deck
        .querySelectorAll<HTMLElement>('.rev.expanded')
        .forEach((el) => el.classList.remove('expanded'));
      startRef.current = (startRef.current + delta + cards) % cards;
      pageRef.current = (pageRef.current + delta + cards) % cards;
      layout();
    },
    [layout],
  );

  const toggleExpand = useCallback(
    (index: number) => {
      const deck = deckRef.current;
      if (!deck) return;
      const el = deck.querySelectorAll<HTMLElement>('.rev')[index];
      if (!el) return;
      el.classList.toggle('expanded');
      layout();
    },
    [layout],
  );

  return { sectionRef, deckRef, page, pagerDisabled, toggleExpand };
}
