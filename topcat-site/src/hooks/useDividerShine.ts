'use client';

import { useEffect } from 'react';

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

    const shine = () => {
      const vh = window.innerHeight || 1;
      for (const d of divs) {
        const r = d.getBoundingClientRect();
        const p = 1 - (r.top + r.height / 2) / vh;
        const c = Math.max(0, Math.min(1, p));
        d.style.setProperty('--shine', (c * 100).toFixed(1) + '%');
        d.style.setProperty(
          '--shineA',
          Math.max(0, Math.min(1, (c - 0.04) / 0.1, (0.96 - c) / 0.1)).toFixed(3),
        );
      }
    };

    shine();
    window.addEventListener('scroll', shine, { passive: true });
    window.addEventListener('resize', shine);
    return () => {
      window.removeEventListener('scroll', shine);
      window.removeEventListener('resize', shine);
    };
  }, []);
}
