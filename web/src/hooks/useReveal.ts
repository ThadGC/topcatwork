'use client';

import { useEffect, useRef, type DependencyList, type RefObject } from 'react';

/**
 * Reveal-on-scroll — the `.rise` behaviour, ported from assets/site.js:4579.
 *
 * The legacy implementation is four lines at the very bottom of site.js:
 *
 *     const io = new IntersectionObserver(es => { es.forEach(e => {
 *       if (!e.isIntersecting) return;
 *       e.target.classList.add('in');
 *       io.unobserve(e.target);
 *     }); }, { threshold: 0.25 });
 *     document.querySelectorAll('.rise').forEach(el => io.observe(el));
 *
 * Three properties of that snippet are load-bearing and are preserved here:
 *
 *   1. THRESHOLD 0.25, not 0. An element reveals when a quarter of it is on
 *      screen, which is what makes the stagger read as deliberate rather than
 *      as things popping in at the very edge of the viewport.
 *   2. IT UNOBSERVES. `.rise` is a one-way door: once revealed, an element
 *      never fades back out on scroll-up. Re-revealing would fight the
 *      `--rd` delays that #about hard-codes in markup.
 *   3. IT NEVER REMOVES `.in`. There is no teardown path in the source.
 *
 * The visual half stays in CSS and is not restated here (site.css:391):
 *   .rise    { opacity:0; transform:translateY(34px); transition:… 1s }
 *   .rise.in { opacity:1; transform:none }
 *
 * REDUCED MOTION is handled entirely by CSS — globals.css block 8 sets
 * `.rise{opacity:1;transform:none}` under `prefers-reduced-motion: reduce`, so
 * an element that is never observed still shows. Do NOT add a JS branch for
 * it; that would diverge from the source and would fail closed if the media
 * query changed mid-session.
 *
 * WHY A ROOT REF INSTEAD OF `document.querySelectorAll`
 * -----------------------------------------------------
 * The legacy page queries the document once, at parse time, because its markup
 * is static. React mounts sections over time and re-renders them, so a single
 * document-wide sweep would miss anything rendered later. Scoping to a ref and
 * re-sweeping on demand is the same behaviour for markup that exists, and
 * correct behaviour for markup that does not exist yet.
 *
 * @param deps  Re-sweep the subtree when these change — pass whatever state
 *              adds or replaces `.rise` nodes. Nodes already observed or
 *              already revealed are skipped, so sweeping again is cheap and
 *              idempotent.
 *
 * @example
 *   const root = useReveal<HTMLElement>();
 *   return <section ref={root}><h2 className="rise">…</h2></section>;
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  deps: DependencyList = [],
): RefObject<T | null> {
  const root = useRef<T | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // No IntersectionObserver (very old browser, or a jsdom test that has not
    // stubbed it): reveal everything immediately rather than leaving the page
    // at opacity 0. Failing open is the only safe direction here.
    if (typeof IntersectionObserver === 'undefined') {
      el.querySelectorAll('.rise').forEach((n) => n.classList.add('in'));
      if (el.classList.contains('rise')) el.classList.add('in');
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
      { threshold: 0.25 },
    );

    const sweep = () => {
      const nodes: Element[] = [];
      if (el.classList.contains('rise')) nodes.push(el);
      el.querySelectorAll('.rise').forEach((n) => nodes.push(n));
      for (const n of nodes) {
        // Already through the one-way door — do not re-arm it.
        if (n.classList.contains('in')) continue;
        io.observe(n);
      }
    };

    sweep();

    // React can commit `.rise` nodes after this effect runs — a client section
    // that hydrates its list, say. A MutationObserver catches those without
    // the caller having to thread every piece of state through `deps`.
    const mo =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(sweep);
    mo?.observe(el, { childList: true, subtree: true });

    return () => {
      mo?.disconnect();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return root;
}
