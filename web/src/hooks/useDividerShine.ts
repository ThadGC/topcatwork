'use client';

import { useEffect } from 'react';
import { viewportHeight } from '@/lib/viewportHeight';

/**
 * `.section-divider` — the travelling flash.
 *
 * Port of assets/site.js:2792-2810.
 *
 * home-sections.css:389 already reads the two custom properties:
 *
 *   .sd-line::after{ left:var(--shine,50%); opacity:var(--shineA,1) }
 *
 * but nothing in the port ever WROTE them, so every divider sat with its
 * highlight parked at the 50% fallback at full opacity — a static blob in the
 * middle of the rule instead of a flash that travels across the screen as the
 * divider crosses the viewport.
 *
 * `--shine` is the divider's own centre expressed as a percentage of the
 * viewport height, inverted so it runs left-to-right on the way down.
 * `--shineA` fades it out in the first and last 10% of that travel, so the
 * highlight arrives and leaves rather than popping.
 *
 * Both numbers are the source's.
 */
export function useDividerShine() {
  useEffect(() => {
    const divs = Array.from(
      document.querySelectorAll<HTMLElement>('.section-divider'),
    );
    if (!divs.length) return;

    /*
      ⛔ THIS USED TO THRASH LAYOUT ONCE PER DIVIDER, PER SCROLL EVENT.

      The original interleaved the two halves inside the loop:

          for (const d of divs) {
            const r = d.getBoundingClientRect();   // READ
            d.style.setProperty('--shine', …);     // WRITE
            d.style.setProperty('--shineA', …);    // WRITE
          }

      A style write invalidates layout, so the NEXT iteration's
      getBoundingClientRect() cannot be served from cache and forces a full
      synchronous recalculation of the document. The home page carries eight
      `.section-divider`s (app/page.tsx), so that is eight forced layouts on
      every scroll event, unthrottled, on the main thread.

      Measured in the client's own screen recording: during a slow drag 31% of
      frames rendered no movement at all, with stalls up to 317ms. He described
      it as "jumping around a little bit... it has to be perfectly smooth".

      Now the reads all happen first and the writes all happen after, so the
      document is laid out ONCE per frame instead of eight times, and the whole
      pass is rAF-batched so a burst of scroll events collapses into one.
    */
    let raf = 0;
    const shine = () => {
      raf = 0;
      /* The layout viewport — the same number the `vh` in the stylesheet
         resolves against, so the shine does not slide when the bar moves. */
      const vh = viewportHeight();
      /* Phase 1: read every rect while layout is clean. */
      const cs = divs.map((d) => {
        const r = d.getBoundingClientRect();
        return Math.max(0, Math.min(1, 1 - (r.top + r.height / 2) / vh));
      });
      /* Phase 2: write. Nothing is read after this point. */
      divs.forEach((d, i) => {
        const c = cs[i];
        d.style.setProperty('--shine', (c * 100).toFixed(1) + '%');
        d.style.setProperty(
          '--shineA',
          Math.max(0, Math.min(1, (c - 0.04) / 0.1, (0.96 - c) / 0.1)).toFixed(3),
        );
      });
    };

    /* One pass per frame at most. Scroll can fire many times between paints
       and every extra pass is invisible work. */
    const request = () => {
      if (!raf) raf = requestAnimationFrame(shine);
    };

    shine();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, []);
}
