'use client';

import { useRef } from 'react';
import type { RefObject } from 'react';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * The project hero slideshow — a port of assets/site.js:2338-2377.
 *
 * WHAT WAS MISSING
 * ----------------
 * `Gallery.tsx` held the clicked card's photograph still behind the project
 * title and said so in a comment. Measured before this landed:
 * `#projHeroBg .phb-slide` was 0 on the new build against 5 on the old one.
 *
 * WHAT IT DOES
 * ------------
 * Five stacked `.phb-slide` divs cross-fade through the project's own
 * photographs on a 4.5s interval, starting from the image on the card that was
 * clicked. Each incoming slide is only revealed once its image has actually
 * decoded (`preload`), so the fade never lands on an empty box; the outgoing
 * slide is reset 1.4s later, once the 1.3s CSS fade has finished.
 *
 * The five slides are a ring buffer over a sequence that is usually far
 * longer (Watford has 18 photographs), which is why `heroIdx` is taken modulo
 * HERO_N for the slides and modulo `heroSeq.length` for the URLs.
 *
 * `heroRun` is the source's cancellation token: `stopHero` bumps it, and every
 * async continuation bails when the run it belongs to is no longer current.
 * That matters here more than it did in the source, because React can close
 * and reopen the overlay inside one 1.4s tail.
 *
 * EVERY NUMBER BELOW IS THE SOURCE'S. None was chosen here.
 */

/** site.js:2338 — five slides, however many photographs there are. */
export const HERO_N = 5;
/** site.js:2357 — the interval between cross-fades. */
export const HERO_INTERVAL_MS = 4500;
/**
 * site.js:2371 — how long the outgoing slide is left alone before it is reset.
 * The fade itself is `transition:opacity 1.3s` (site.css:1516), so this clears
 * up 100ms after it lands.
 */
export const HERO_CLEAR_MS = 1400;

/** site.js:2341 — gallery entries are [url,w,h]; heroes are plain strings. */
const srcOf = (g: readonly [string, number, number] | string) =>
  Array.isArray(g) ? g[0] : (g as string);

/** site.js:2342 — resolves on error too, so one dead URL cannot stall the run. */
const preload = (u: string) =>
  new Promise<string>((res) => {
    const im = new Image();
    im.onload = im.onerror = () => res(u);
    im.src = u;
  });

/**
 * @param heroBgRef  `#projHeroBg`, whose children are the five `.phb-slide`s.
 * @param clickedSrc the open project's card image, or null when nothing is
 *                   open — which is the source's `closeFocus` → `stopHero`.
 * @param pool       the open project's gallery.
 */
export function useProjectSlideshow(
  heroBgRef: RefObject<HTMLDivElement | null>,
  clickedSrc: string | null,
  pool: readonly (readonly [string, number, number])[] | null,
) {
  /** site.js:2340 — the whole engine's mutable state. */
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seqRef = useRef<string[]>([]);
  const runRef = useRef(0);

  useIsomorphicLayoutEffect(() => {
    const heroBg = heroBgRef.current;
    if (!heroBg) return;
    const heroSlides = Array.from(heroBg.querySelectorAll<HTMLElement>('.phb-slide'));
    if (heroSlides.length !== HERO_N) return;

    /** site.js:2377 */
    function stopHero() {
      runRef.current++;
      if (timerRef.current !== null) clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!clickedSrc) {
      stopHero();
      return;
    }

    /** site.js:2359-2376 */
    async function advance(run: number) {
      const seq = seqRef.current;
      if (run !== runRef.current || seq.length < 2) return;
      const cur = heroSlides[idxRef.current % HERO_N],
        nxt = heroSlides[(idxRef.current + 1) % HERO_N];
      const url = seq[(idxRef.current + 1) % seq.length];
      await preload(url);
      if (run !== runRef.current) return;
      nxt.style.backgroundImage = `url("${url}")`;
      nxt.style.transition = 'none';
      nxt.style.opacity = '0';
      nxt.style.zIndex = '2';
      /* Forced reflow: without it the browser coalesces the reset and the
         reveal into no transition at all. */
      void nxt.offsetWidth;
      nxt.style.transition = '';
      nxt.classList.add('active');
      nxt.style.opacity = '1';
      idxRef.current++;
      setTimeout(() => {
        if (run !== runRef.current) return;
        cur.style.transition = 'none';
        cur.style.opacity = '0';
        cur.style.zIndex = '0';
        cur.classList.remove('active');
        void cur.offsetWidth;
        cur.style.transition = '';
        preload(seq[(idxRef.current + 1) % seq.length]);
      }, HERO_CLEAR_MS);
    }

    /** site.js:2343-2358 */
    function startHero(src: string, list: readonly (readonly [string, number, number])[] | null) {
      const run = ++runRef.current;
      if (timerRef.current !== null) clearInterval(timerRef.current);
      timerRef.current = null;
      const urls = list && list.length ? list.map(srcOf) : [];
      seqRef.current = [src, ...urls.filter((s) => s !== src)];
      heroSlides.forEach((s) => {
        s.style.transition = 'none';
        s.style.opacity = '0';
        s.style.zIndex = '0';
        s.classList.remove('active');
      });
      idxRef.current = 0;
      const first = heroSlides[0];
      first.style.backgroundImage = `url("${seqRef.current[0]}")`;
      void first.offsetWidth;
      first.style.opacity = '1';
      first.style.zIndex = '1';
      first.classList.add('active');
      requestAnimationFrame(() =>
        heroSlides.forEach((s) => {
          s.style.transition = '';
        }),
      );
      if (seqRef.current.length < 2) return;
      /* site.js:2356 — the next two frames are fetched up front. */
      seqRef.current.slice(1, 3).forEach(preload);
      timerRef.current = setInterval(() => advance(run), HERO_INTERVAL_MS);
    }

    startHero(clickedSrc, pool);
    return stopHero;
  }, [heroBgRef, clickedSrc, pool]);
}
