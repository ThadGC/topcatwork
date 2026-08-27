/* ==========================================================================
   BACK GOES BACK TO WHERE YOU WERE.

   The client, 27 Aug: "when I open that individual stone and click the back
   button, it doesn't take me back to the stone section... It takes me all the
   way back to the beginning of the video, which it should not do. So the back
   button should only go back to the previous part that I was viewing."

   ── why the browser does not do this on its own ────────────────────────────
   Every navigation on this site is a FULL page load. The stone wheel opens a
   slab with `location.href` (site.js:1058, ported in useStoneWheel), and the
   collection tiles and the nav are plain `<a href>`. So going back is a fresh
   document, and Chrome's automatic restoration has to guess a scroll offset
   for a page whose height is still moving: `#cine` is an 800vh runway at parse
   time, grows again as the sections below hydrate, and then COLLAPSES to one
   viewport the moment the film locks (`html.cine-done`, useHeroFilm's
   `lockFilm`). Measured on this build, back from a stone page: Chrome restored
   16408 at t=241ms and had lost it again by t=522ms, and on the next run never
   restored at all. The old build's own restoration works only because its
   height happens to settle sooner. Racy either way.

   So this module takes the job off the browser — `history.scrollRestoration`
   goes to `manual` — and does it deterministically:

     1. `remember()` writes the offset on `pagehide`, together with whether the
        intro had already finished.
     2. On the way back, `takeRestore()` reports the saved offset for exactly
        this URL, and only for a `back_forward` navigation.
     3. Nothing is restored until the page has stopped changing height. On the
        home page that means waiting for `cine-done`, because `lockFilm()`
        collapses the runway AND subtracts the same distance from `scrollY` in
        the same frame — restore before it and the subtraction eats the offset.

   ── and the film must not replay ───────────────────────────────────────────
   Restoring the offset is only half of it. The saved `cine` flag is read at
   PARSE time by the boot script in components/HeroFilm/HeroFilmBoot.tsx, which
   puts the document into `to-hero` — the same state the `/#hero` deep link
   uses — so the engine snaps to the last frame and the visitor never sees a
   frame of the intro replaying.
   ========================================================================== */

/** sessionStorage prefix. The boot script builds the same key inline — if this
 *  changes, change it there too (it is interpolated, so it cannot drift). */
export const POS_KEY = 'tc:pos:';

export interface SavedPosition {
  /** `window.scrollY` when the page was left. */
  y: number;
  /** Was `html.cine-done` set — i.e. had the intro already finished? */
  cine: boolean;
}

/** The URL this position belongs to. Hash excluded: `/#hero` and `/` are the
 *  same page and the visitor's offset is the same fact either way. */
export function posKey(loc: { pathname: string; search: string }): string {
  return POS_KEY + loc.pathname + loc.search;
}

/** Did the visitor arrive here with Back or Forward? */
export function isBackForward(): boolean {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    return nav?.type === 'back_forward';
  } catch {
    return false;
  }
}

export function readPosition(key: string): SavedPosition | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<SavedPosition>;
    if (typeof v?.y !== 'number' || !isFinite(v.y)) return null;
    return { y: Math.max(0, Math.round(v.y)), cine: !!v.cine };
  } catch {
    return null;
  }
}

export function writePosition(key: string, pos: SavedPosition): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(pos));
  } catch {
    /* private mode, quota, a browser with storage off — never block a nav */
  }
}

export function clearPosition(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Is the page's height finally settled enough to trust an offset?
 *
 * Two gates, and both matter:
 *  - if the film is running, nothing is settled until it has locked, because
 *    `lockFilm()` collapses the runway and subtracts from `scrollY` together;
 *  - the document has to be tall enough to hold the offset at all, or the
 *    browser clamps the scroll and the offset is lost silently.
 */
export function settled(y: number): boolean {
  const root = document.documentElement;
  if (root.classList.contains('cine-on') && !root.classList.contains('cine-done')) {
    return false;
  }
  return root.scrollHeight - window.innerHeight >= y - 2;
}
