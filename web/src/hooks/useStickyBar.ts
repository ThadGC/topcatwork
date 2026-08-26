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

    const read = () =>
      anchor.getBoundingClientRect().bottom <
      (document.querySelector<HTMLElement>('header.bar')?.offsetHeight || 76);

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
