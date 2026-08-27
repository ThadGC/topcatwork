/**
 * HERO FILM — the deferred still.
 *
 * ── the measurement ─────────────────────────────────────────────────────────
 * `html.cine-on .cine .bgImg { opacity: 0 }` (HeroFilm.module.css:140). The
 * still hero is not hidden when the film starts playing — it is hidden the
 * instant `cine-on` lands, which is during HTML parse, and it stays at zero for
 * the entire session. On a Samsung S21 Ultra (384x722, dpr 3.75) the server log
 * showed `/assets/site/hero-night-2752.webp` — 151,604 bytes — arriving at
 * t=68ms as the FIRST image on the wire, ahead of all eight JS chunks, because
 * the markup asks for it with `fetchpriority="high"`. Not one of those pixels
 * is ever composited on a device that runs the film.
 *
 * `opacity:0` does not stop a fetch and neither does anything else you can put
 * in CSS, and the boot script cannot help either: the preload scanner runs
 * AHEAD of script execution, so by the time `cine-on` is set the scanner has
 * already queued the image. The only thing that stops it is not having a `src`
 * attribute to scan.
 *
 * ── the shape ───────────────────────────────────────────────────────────────
 * So the still ships with `data-src` / `data-srcset` and no `src`, and exactly
 * three things promote it back to a real image:
 *
 *   1. the parse-time script in ../HeroFilmBoot.tsx, when the film is OFF —
 *      reduced motion, no MP4 decoder, no matchMedia. Those visitors get the
 *      still as their hero and must not wait ~400ms for hydration for it.
 *   2. `fail()` in ../useHeroFilm.ts, when the film has been switched off
 *      mid-session and the still becomes the hero after all.
 *   3. `<noscript>`, for a visitor with no JavaScript, who gets a plain
 *      `<img src>` twin instead — see ../HeroFilm.tsx.
 *
 * `sizes`, `width` and `height` stay real attributes throughout: none of them
 * starts a fetch on their own, and `width`/`height` are what give the element
 * its aspect-ratio box, so deferring them would trade bytes for layout shift.
 */

/**
 * Promote a deferred `<img>` to a real one. Idempotent, and a no-op on an
 * element that was never deferred.
 *
 * `srcset` is assigned before `src` so the candidate the browser commits to is
 * chosen from the full set rather than from the fallback URL.
 */
export function promoteDeferredImage(img: HTMLImageElement | null | undefined): boolean {
  if (!img) return false;
  const src = img.getAttribute('data-src');
  if (!src) return false;
  const set = img.getAttribute('data-srcset');
  if (set) img.setAttribute('srcset', set);
  img.setAttribute('src', src);
  img.removeAttribute('data-src');
  img.removeAttribute('data-srcset');
  return true;
}

/** Promote every deferred `<img>` under `root`. Returns how many moved. */
export function promoteDeferredImages(root: ParentNode | null | undefined): number {
  if (!root) return 0;
  let n = 0;
  for (const img of Array.from(root.querySelectorAll<HTMLImageElement>('img[data-src]'))) {
    if (promoteDeferredImage(img)) n++;
  }
  return n;
}
