'use client';

import { useEffect, useState } from 'react';

export type StickyBarMode = 'always' | 'scroll';

export interface UseStickyBarOptions {
  readonly mode: StickyBarMode;
  /** `.hero-ctas` on the home page. Ignored when mode is 'always'. */
  readonly anchorSelector?: string;
}

/**
 * Port of assets/site.js:2822-2839 and of the one-line inline script the
 * other 172 pages carry instead.
 *
 *   const mbar = document.getElementById('mobileBar');
 *   if (!document.querySelector('.hero-ctas')) {
 *     html.classList.add('bar-always');
 *     mbar.classList.add('on');
 *     return;                       // <- and no scroll listener at all
 *   }
 *   const past = ctas.getBoundingClientRect().bottom
 *                  < (document.querySelector('header.bar')?.offsetHeight || 76);
 *
 * The early return is the whole design: on every page that has no hero CTA
 * row the bar is simply always up, and `html.bar-always` additionally
 * `display:none`s the two FABs so they never fight it. Only the home page
 * ever reveals on scroll, and it reveals at the moment the hero's own CTAs
 * scroll up behind the header.
 *
 * The fallback header height of 76 is the source's, and it is not `--barH`
 * (78.5 / 80): it is the pre-token value that never got updated. Kept.
 */
export function useStickyBar({
  mode,
  anchorSelector = '.hero-ctas',
}: UseStickyBarOptions): boolean {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const anchor =
      mode === 'scroll'
        ? document.querySelector<HTMLElement>(anchorSelector)
        : null;

    // Both the explicit 'always' mode and 'scroll' with a missing anchor land
    // here — the source makes no distinction between them.
    if (!anchor) {
      root.classList.add('bar-always');
      setOn(true);
      return () => {
        root.classList.remove('bar-always');
      };
    }

    /*
      The bar element is looked up once and MEMOISED ON SUCCESS, not on every
      scroll event. The old form ran `document.querySelector('header.bar')`
      inside `read()`, so a selector match happened on every one of the hundreds
      of scroll events in a slow drag.

      ⚠️ Memoised lazily rather than latched at setup. Latching a single query
      here would cache `null` forever on any page where the header is not yet in
      the DOM when this effect runs, and the fallback 76 would then stand in for
      a real 80px bar for the life of the page — a 4px error in the threshold,
      permanently, and invisible. `??=` only remembers a hit, so a late header is
      still picked up on the next scroll event, while `|| 76` still covers the
      lite pages that genuinely ship no bar.
    */
    let bar: HTMLElement | null = null;
    const barH = () =>
      (bar ??= document.querySelector<HTMLElement>('header.bar'))?.offsetHeight || 76;

    const read = () => anchor.getBoundingClientRect().bottom < barH();

    /*
      ⛔ DELIBERATELY NOT rAF-BATCHED, unlike the other scroll handlers touched
      in this round.

      Batching it deferred the class by one frame, which broke
      tests/chrome.test.tsx:294 ("stays down until the anchor clears the header,
      then comes up") — it dispatches a scroll inside act() and asserts
      synchronously. That test is asserting the real affordance, not an
      implementation detail.

      And there was nothing to win. `read()` is now one getBoundingClientRect
      plus a memoised offsetHeight; the whole site's scroll-handler cost
      measured 0.013ms per event before any of this work, so batching this one
      would trade a visible affordance's responsiveness for nothing measurable.
      The expensive path here was the per-event querySelector, and that is gone.
    */
    const handle = () => {
      const past = read();
      setOn((prev) => (prev === past ? prev : past));
    };

    handle();
    window.addEventListener('scroll', handle, { passive: true });
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
    };
  }, [mode, anchorSelector]);

  return on;
}
