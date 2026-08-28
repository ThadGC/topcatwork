'use client';

/**
 * HERO — the still.
 *
 * ⛔ THE FILM WAS STRIPPED OUT ON 28 AUG 2026, deliberately, and is being
 * rebuilt from scratch. This component is what stands in the hero's place
 * while there is no film. It is not a new design: it is exactly the state
 * `<HeroFilm>` rendered on the server, and exactly what a reduced-motion
 * visitor, a browser with no MP4 decoder and a no-JS visitor were already
 * getting.
 *
 * The complete film specification — every word of copy, every beat window per
 * band, every resolved placement, every animation curve, the hand-measured
 * reveal tables, the assets and their hashes — plus a verbatim snapshot of all
 * 10,362 lines of the deleted film system and 160 reference screenshots are in
 * `~/Documents/TOPCAT-FILM-SPEC/`. Read `FILM-SPEC.md` before rebuilding.
 *
 * ── `loaded` ────────────────────────────────────────────────────────────────
 * The hero copy's entrance stagger is gated on `#hero.loaded` (globals.css).
 * The film used to add that class at 93% of the runway. With no film, this
 * adds it on mount, which is the same thing the reduced-motion path did.
 * Without it the hero copy stays at `opacity: 0` and the page looks empty.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { TcDefs } from '@/components/sections/TcDefs';
import styles from './HeroStill.module.css';

export interface HeroStillProps {
  children?: ReactNode;
  still?: {
    src: string;
    srcSet?: string;
    sizes?: string;
    width: number;
    height: number;
    alt?: string;
  };
}

const DEFAULT_STILL = {
  src: '/assets/site/hero-night-2752.webp',
  srcSet:
    '/assets/site/hero-night-1400.webp 1400w, /assets/site/hero-night-2000.webp 2000w, /assets/site/hero-night-2752.webp 2752w',
  sizes: '(max-width:720px) 1000px, 1739px',
  width: 2752,
  height: 1536,
  alt: '',
};

export function HeroStill({ children, still = DEFAULT_STILL }: HeroStillProps) {
  const hero = useRef<HTMLElement>(null);

  useEffect(() => {
    // Two frames, so the initial `opacity: 0` is painted before the class that
    // transitions away from it. Setting both in one frame skips the entrance.
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => hero.current?.classList.add('loaded', styles.loaded)),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className={styles.hero} ref={hero} id="hero">
      {/* The two gold gradients. `.wbtn svg` fills with `url(#tcGoldSolid)` and
          the hero's "Free home visit" chip strokes with `url(#tcGold)`, and a
          `url(#id)` paint resolves against the document — with no `<defs>` in
          the DOM the stroke resolves to nothing and the icon disappears. */}
      <TcDefs />

      <div className={styles.bg} aria-hidden="true">
        <img
          className={styles.bgImg}
          src={still.src}
          srcSet={still.srcSet}
          sizes={still.sizes}
          width={still.width}
          height={still.height}
          alt={still.alt ?? ''}
          draggable={false}
          fetchPriority="high"
          decoding="async"
        />
        <div className={styles.shade} />
      </div>

      <div className={styles.inner}>{children}</div>
    </section>
  );
}

export default HeroStill;
