'use client';

/* ==========================================================================
   `.rise` — the reveal-on-scroll class.

   `.rise` starts at `opacity:0; transform:translateY(…)` in BOTH stylesheets
   (site.css:391, service.css:313) and only `.rise.in` is visible. Something
   has to add `.in` or the page is blank. The legacy site does it twice, with
   two different thresholds:

     site.js:4579–4584            threshold 0.25, unobserve after firing
     trade/index.html inline      threshold 0.12, same shape

   Both are reproduced; pass the threshold the page's own script used. The
   observer is disconnected on unmount rather than left running.

   `prefers-reduced-motion` needs no branch here: service.css:315 and
   globals.css §9 already flatten `.rise` to `opacity:1;transform:none` under
   that query, so adding `.in` is harmless.
   ========================================================================== */

import { useEffect } from 'react';

export function RiseObserver({ threshold = 0.25 }: { threshold?: number }) {
  useEffect(() => {
    /*
      No IntersectionObserver — a very old browser, or a jsdom test that has
      not stubbed it. Reveal everything immediately rather than leaving the
      page at opacity 0. Failing OPEN is the only safe direction: the CSS
      hides `.rise` until something adds `.in`, so a thrown constructor here
      would mean a blank page. Same guard as hooks/useReveal.ts.
    */
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.rise').forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);
        });
      },
      { threshold },
    );
    document.querySelectorAll('.rise').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [threshold]);

  return null;
}
