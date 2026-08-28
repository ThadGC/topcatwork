'use client';

import { useEffect, useState } from 'react';

export interface HeaderScrollState {
  /** `header.bar.scrolled` — the bar has formed. */
  readonly scrolled: boolean;
  /**
   * `header.bar.preform` — the bar had no chrome at all over the hero film,
   * before the film's closing beat formed it. ⛔ The film was stripped out
   * 28 Aug 2026, so this is permanently false; it stays in the shape because
   * the CSS state still exists and the rebuild needs it back.
   */
  readonly preform: boolean;
}

export interface UseHeaderScrolledOptions {
  /**
   * The landing page, where the bar is anchored to the HERO rather than to a
   * scroll threshold.
   *
   * On that page the bar has no chrome of its own over the film and over the
   * hero, and forms only once the hero has gone by — the forming IS the film's
   * closing beat. Measured on the old build: at the locked hero it reads
   * `class="bar preform"`, never `formed`.
   *
   * Deliberately NOT a `getBoundingClientRect()` on the hero, which is what the
   * old build did: that is a layout read on every scroll event, on the same
   * main thread the film is being scrubbed on. The hero is one viewport tall
   * and sits at the top of the document once the film has locked, so the same
   * answer comes out of arithmetic — and while the film is still running the
   * root class it writes says so.
   */
  readonly heroAnchored?: boolean;
  /**
   * Where `.scrolled` latches. The source uses two different numbers:
   * 40 on the six site.css pages, 12 on the 171 service.css pages. Both are
   * carried; see `thresholdForVariant`.
   */
  readonly threshold: number;
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
 * ⛔ THE FILM BRANCH IS GONE (28 Aug 2026, stripped with the film). The bar
 * anchored its forming to the HERO's position rather than to a scroll
 * threshold while the film was running, and sat in `.preform` until then.
 * Only the `window.scrollY > threshold` half is left. Both halves are in the
 * source above; put the film half back when the film comes back.
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
  heroAnchored = false,
}: UseHeaderScrolledOptions): HeaderScrollState {
  const [state, setState] = useState<HeaderScrollState>({
    scrolled: false,
    preform: false,
  });

  useEffect(() => {
    const read = (): HeaderScrollState => {
      if (heroAnchored) {
        const film = document.documentElement.classList.contains('film-running');
        // Past the hero once a viewport of it has gone by, less the 40px the
        // source uses. While the film runs, nothing has gone by at all.
        const scrolled = !film && window.scrollY > window.innerHeight - 40;
        return { scrolled, preform: !scrolled };
      }
      return { scrolled: window.scrollY > threshold, preform: false };
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
  }, [threshold, heroAnchored]);

  return state;
}
