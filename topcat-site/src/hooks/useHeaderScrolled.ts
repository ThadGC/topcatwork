'use client';

import { useEffect, useState } from 'react';

export interface HeaderScrollState {
  /** `header.bar.scrolled` — the bar has formed. */
  readonly scrolled: boolean;
  /** `header.bar.preform` — index only, over the cine film, before it forms. */
  readonly preform: boolean;
}

export interface UseHeaderScrolledOptions {
  /**
   * Where `.scrolled` latches. The source uses two different numbers:
   * 40 on the six site.css pages, 12 on the 171 service.css pages. Both are
   * carried; see `thresholdForVariant`.
   */
  readonly threshold: number;
  /**
   * Index only. Enables the hero-anchored reading and the `.preform` state.
   * Even with this on, the film branch is taken only while `html.cine-on` is
   * actually set — the film removes that class when it bails on reduced
   * motion or a missing codec, and the bar must fall straight back to the
   * plain scrollY reading when it does.
   */
  readonly cine?: boolean;
  /** The element the film measures against. `#hero` in the source. */
  readonly heroSelector?: string;
}

/**
 * Port of the header module at assets/site.js:2810-2820, and of the
 * `scrollY > 12` inline script the 171 content pages carry instead.
 *
 *   const on = () => {
 *     const film   = html.classList.contains('cine-on') && hero;
 *     const formed = film ? hero.getBoundingClientRect().top <= -40
 *                         : window.scrollY > 40;
 *     bar.classList.toggle('scrolled', formed);
 *     bar.classList.toggle('preform', !!film && !formed);
 *   };
 *
 * Two things are deliberate.
 *
 * FIRST, nothing runs during render. Both classes start off, so the exported
 * HTML says `class="bar"` — which is what the legacy HTML says, since the
 * source adds them from a deferred script. A page loaded already scrolled
 * gets them on mount, exactly as the source's immediate `on()` call does.
 *
 * SECOND, the state is only written when it changes. `.bar-flare` runs a CSS
 * animation keyed on `.scrolled` being added, so re-toggling the class on
 * every scroll event would re-fire the sweep continuously.
 */
export function useHeaderScrolled({
  threshold,
  cine = false,
  heroSelector = '#hero',
}: UseHeaderScrolledOptions): HeaderScrollState {
  const [state, setState] = useState<HeaderScrollState>({
    scrolled: false,
    preform: false,
  });

  useEffect(() => {
    const root = document.documentElement;
    const hero = cine
      ? (document.querySelector<HTMLElement>(heroSelector) ?? null)
      : null;

    const read = (): HeaderScrollState => {
      const film = !!hero && root.classList.contains('cine-on');
      const formed = film
        ? hero.getBoundingClientRect().top <= -40
        : window.scrollY > threshold;
      return { scrolled: formed, preform: film && !formed };
    };

    const on = () => {
      const next = read();
      setState((prev) =>
        prev.scrolled === next.scrolled && prev.preform === next.preform
          ? prev
          : next,
      );
    };

    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold, cine, heroSelector]);

  return state;
}
